package com.my.project_linkus_back.filters.service;

import com.my.project_linkus_back.common.exception.BadAccessException;
import com.my.project_linkus_back.filters.repository.FilterRepository;
import com.my.project_linkus_back.filters.entity.Filters;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 읽기 전용 성능 최적화
public class FilterService {
    private final FilterRepository filterRepository;
    // 멀티스레드 환경에서 안전한 캐시 (메모리 로드용 오리지널 단어 저장소)
    private final Set<String> badWords = ConcurrentHashMap.newKeySet();
    // 정규식 컴파일 결과를 저장할 객체
    private Pattern badWordsPattern;

    private void updatePattern() {
        if (badWords.isEmpty()) {
            badWordsPattern = null;
            return;
        }
        // 금지어들을 특수문자 처리(quote) 후 파이프(|)로 연결
        String patternString = badWords.stream()
                .map(Pattern::quote)
                .collect(Collectors.joining("|"));
        // 대소문자 구분 없이 매칭하도록 정규식 컴파일
        this.badWordsPattern = Pattern.compile(patternString, Pattern.CASE_INSENSITIVE);
    }

    // 서버 시작 시 DB의 금지어를 메모리에 로드
    @PostConstruct
    public void loadWords() {
        List<String> words = filterRepository.findAll().stream()
                .map(Filters::getWord)
                .toList();

        badWords.addAll(words);
        updatePattern(); // 패턴 초기화
    }

    // 금지어 추가
    @Transactional // 쓰기 작업이므로 트랜잭션 적용
    public void addWord(String word) {
        if (word == null || word.trim().isEmpty()) {
            throw new BadAccessException("올바른 단어를 입력해주세요.");
        }
        // DB 중복 검사
        if (filterRepository.existsByWord(word)) {
            throw new BadAccessException("이미 등록된 금지어입니다.");
        }
        // DB 저장
        Filters saved = filterRepository.save(
                Filters.builder()
                        .word(word)
                        .build()
        );
        // DB 전체를 다시 조회하지 않고 메모리와 패턴만 즉시 갱신
        badWords.add(saved.getWord());
        updatePattern();
    }

    // 금지어 삭제
    @Transactional // 쓰기 작업이므로 트랜잭션 적용
    public void deleteWord(Long id) {
        filterRepository.findById(id).ifPresent(filter -> {
            filterRepository.delete(filter);
            // 메모리와 패턴 즉시 갱신
            badWords.remove(filter.getWord());
            updatePattern();
        });
    }

    // 전체 금지어 조회
    public List<Filters> getAllWords() {
        return filterRepository.findAll();
    }

    // 금지어 포함 여부 단순 검사
    public boolean containsBadWord(String text) {
        if (text == null || badWordsPattern == null) {
            return false;
        }
        return badWordsPattern.matcher(text).find();
    }

    // 비속어 필터링 및 치환
    public String filterAndReplace(String text) {
        if (text == null || badWordsPattern == null || text.isEmpty()) {
            return text;
        }
        Matcher matcher = badWordsPattern.matcher(text);
        StringBuilder sb = new StringBuilder();
        // 패턴에 일치하는 금지어를 찾을 때마다 StringBuilder 내부에서 치환 실행
        while (matcher.find()) {
            matcher.appendReplacement(sb, "***");
        }
        matcher.appendTail(sb);
        return sb.toString();
    }
}
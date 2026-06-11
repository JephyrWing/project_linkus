package com.my.project_linkus_back.filters.service;

import com.my.project_linkus_back.filters.Repository.FilterRepository;
import com.my.project_linkus_back.filters.entity.Filters;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FilterService {

    private final FilterRepository filterRepository;
    //서버 시작 시 DB의 금지어 메모리에 로드
    private Set<String> badWords = new HashSet<>();
    //서버 시작 시 DB의 금지어를 메모리에 로드
    @PostConstruct
    public  void loadWords(){
        badWords = filterRepository.findAll()
                .stream()
                .map(Filters::getWord)
                .collect(Collectors.toSet());
    }

    //금지어 추가
    public void addWord(String word) {
        // 중복 검사
        if (filterRepository.existsByWord(word)){
            throw new IllegalArgumentException("이미 등록된 금지어입니다.");
        }
        //DB 저장
        filterRepository.save(
                Filters.builder()
                        .word(word)
                        .build()
        );
        // 메모리 갱싱
        loadWords();
    }
    //금지어 삭제
    public void deleteWord(Long id) {
        filterRepository.deleteById(id);
        // 메모리 갱신
        loadWords();
    }
    // 전체 금지어 조회
    public List<Filters> getAllWords(){
        return filterRepository.findAll();
    }

    //문자열 정규화(소문자 변호나, 공백제거, 특수문자 제거
    private String normalize(String text){
        return text.toLowerCase()
                .replaceAll("\\s+", "")
                .replaceAll("[^가-힣a-z0-9]","");
    }
    // 금지어 포함 여부 검사
    public boolean containsBadWord(String text){
        String normalized = normalize(text);
        for (String badWord : badWords){
            if (normalized.contains(normalize(badWord))){
                return true;
            }
        }
        return false;
    }

}

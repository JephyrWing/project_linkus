package com.my.project_linkus_back.filters.config;

import com.my.project_linkus_back.filters.repository.FilterRepository;
import com.my.project_linkus_back.filters.entity.Filters;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

@Component
@RequiredArgsConstructor
public class FilterInitializer {

    // 금칙어 DB 접근 객체
    private final FilterRepository filterRepository;

    // 서버 시작시 실행
    // resources/filter.txt 파일의 금지어를 DB에 초기 저장
    @PostConstruct
    public void init() throws Exception {
        // 이미 데이터가 있으면 최기화 생략
        if (filterRepository.count() > 0) {
            return;
        }
        // resources 폴더의 filters.txt 읽기
        InputStream is = getClass().getResourceAsStream("/filters.txt");

        BufferedReader br = new BufferedReader(new InputStreamReader(is));

        String line;

        // 한 줄씩 읽어서 DB 저장
        while ((line = br.readLine()) != null) {
            line = line.trim();

            // 빈 줄은 무시
            if (line.isEmpty()) {
                continue;
            }
            filterRepository.save(
                    Filters.builder()
                            .word(line)
                            .build()
            );
        }
    }
}

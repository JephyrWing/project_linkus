package com.my.project_linkus_back.filters.config;

import com.my.project_linkus_back.filters.Repository.FilterRepository;
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
    private final FilterRepository filterRepository;

    @PostConstruct
    public void init() throws Exception{
        if(filterRepository.count()>0){
            return;
        }
        InputStream is = getClass().getResourceAsStream("/filters.txt");

        BufferedReader br = new BufferedReader(new InputStreamReader(is));

        String line;

        while((line = br.readLine()) != null) {
            line = line.trim();

            if (line.isEmpty()){
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

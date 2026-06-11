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
    private Set<String> badWords = new HashSet<>();

    @PostConstruct
    public  void loadWords(){
        badWords = filterRepository.findAll()
                .stream()
                .map(Filters::getWord)
                .collect(Collectors.toSet());
    }

    public void addWord(String word) {
        if (filterRepository.existsByWord(word)){
            throw new IllegalArgumentException("이미 등록된 금지어입니다.");
        }
        filterRepository.save(
                Filters.builder()
                        .word(word)
                        .build()
        );
        loadWords();
    }
    public void deleteWord(Long id) {
        filterRepository.deleteById(id);
        loadWords();
    }
    public List<Filters> getAllWords(){
        return filterRepository.findAll();
    }
    private String normalize(String text){
        return text.toLowerCase()
                .replaceAll("\\s+", "")
                .replaceAll("[^가-힣a-z0-9]","");
    }
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

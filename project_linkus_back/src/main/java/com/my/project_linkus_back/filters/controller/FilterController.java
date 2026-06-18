package com.my.project_linkus_back.filters.controller;

import com.my.project_linkus_back.filters.dto.FilterRequestDto;
import com.my.project_linkus_back.filters.entity.Filters;
import com.my.project_linkus_back.filters.service.FilterService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/filters")
@RequiredArgsConstructor
public class FilterController {
    private final FilterService filterService;

    // 전체 조회
    @GetMapping("/findall")
    public List<Filters> getAllWords() {
        return filterService.getAllWords();
    }


    // 금지어 등록
    @PostMapping("/")
    public String addWord(@RequestBody FilterRequestDto dto) {
        filterService.addWord(dto.getWord());
        return "등록 완료";
    }

    // 금지어 삭제
    @DeleteMapping("/{id}")
    public String deleteWord(@PathVariable("id") Long id) {
        filterService.deleteWord(id);
        return "삭제 완료";
    }
}

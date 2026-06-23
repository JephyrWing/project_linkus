package com.my.project_linkus_back.reports.controller;

import com.my.project_linkus_back.common.dto.PageResponse;
import com.my.project_linkus_back.reports.dto.ReportRequestDto;
import com.my.project_linkus_back.reports.dto.ReportResponseDto;
import com.my.project_linkus_back.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    //신고하기
    @PostMapping
    public ReportResponseDto createReport(@RequestBody ReportRequestDto dto) {
        return reportService.createReport(dto);
    }

    // 내 신고 내역
    @GetMapping("/my/{userId}")
    public PageResponse<ReportResponseDto> searchMyReports(@RequestBody ReportRequestDto dto,
                                                           @RequestParam(name = "page", defaultValue = "0") int page,
                                                           @RequestParam(name = "size", defaultValue = "10") int size) {
        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        List<ReportResponseDto> results = reportService.getMyReports(dto.getUserId());
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<ReportResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<ReportResponseDto> resultpage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultpage);
    }
}

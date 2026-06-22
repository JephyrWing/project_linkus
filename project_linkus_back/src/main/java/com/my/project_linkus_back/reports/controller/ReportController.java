package com.my.project_linkus_back.reports.controller;

import com.my.project_linkus_back.reports.dto.ReportRequestDto;
import com.my.project_linkus_back.reports.dto.ReportResponseDto;
import com.my.project_linkus_back.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
    public List<ReportResponseDto> searchMyReports(@RequestBody ReportRequestDto dto) {
        return reportService.getMyReports(dto.getUserId());
    }
}

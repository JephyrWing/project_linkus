package com.my.project_linkus_back.reports.controller;

import com.my.project_linkus_back.reports.dto.ReportRequestDto;
import com.my.project_linkus_back.reports.dto.ReportResponseDto;
import com.my.project_linkus_back.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    //신고하기
    @PostMapping("/{userID}")
    public ReportResponseDto createReport(@PathVariable String userId, @RequestBody ReportRequestDto dto){
        return reportService.createReport(userId, dto);
    }

    // 전체 신고 조회
    @GetMapping
    public List<ReportResponseDto> getAllReports(){
        return reportService.getAllReports();
    }

    // 게시글 신고만 조회
    @GetMapping("/posts")
    public List<ReportResponseDto> getPostReports(){
        return reportService.getPostReport();
    }

    // 채팅 신고만 조회
    public List<ReportResponseDto> getChatReports(){
        return reportService.getChatReports();
    }

    // 내 신고 내역(추후 추가)
}

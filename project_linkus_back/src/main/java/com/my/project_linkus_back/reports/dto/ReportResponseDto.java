package com.my.project_linkus_back.reports.dto;

import com.my.project_linkus_back.reports.entity.Reports;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReportResponseDto {
    // 신고 id(private Long id;)
    private Long reportId;
    private Long userId;
    private Long postId;
    private Long chatId;
    private String text;
    private boolean processed;

    public static ReportResponseDto toDto(Reports report) {
        return ReportResponseDto.builder()
                .reportId(report.getId())
                .userId(report.getUser().getId())
                .postId(report.getPost() != null ? report.getPost().getId() : null)
                .chatId(report.getChat() != null ? report.getChat().getId() : null)
                .text(report.getText())
                .processed(report.isProcessed())
                .build();
    }

}

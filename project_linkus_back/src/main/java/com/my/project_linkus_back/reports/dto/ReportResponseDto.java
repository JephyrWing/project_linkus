package com.my.project_linkus_back.reports.dto;

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


}

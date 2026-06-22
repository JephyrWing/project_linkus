package com.my.project_linkus_back.reports.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportRequestDto {
    // 신고 내용
    private Long postId;

    // 신고 대상 유저
    private Long chatId;

    // 구분 (POST / CHAT)
    private String sortation;

    private String userId;
}

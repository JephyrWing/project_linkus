package com.my.project_linkus_back.chats.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatResponseDto {
    private Long id;
    private String text;
    private String UserId;
    private Double latitude;
    private Double longitude;
    private String createdAt;

}

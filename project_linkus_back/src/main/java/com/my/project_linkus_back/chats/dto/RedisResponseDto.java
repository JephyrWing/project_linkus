package com.my.project_linkus_back.chats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RedisResponseDto {
    private Long chatId;
    private String text;
    private String UserId;
    private String ip;
    private Double longitude;
    private Double latitude;
    private String createdAt;
}

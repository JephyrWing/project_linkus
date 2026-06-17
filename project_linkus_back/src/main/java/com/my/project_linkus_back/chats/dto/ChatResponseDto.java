package com.my.project_linkus_back.chats.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatResponseDto {
    private Long chatId;
    private String text;
    private String userId;
    private String ip;
    private Double longitude;
    private Double latitude;
    private LocalDateTime createdAt;
}

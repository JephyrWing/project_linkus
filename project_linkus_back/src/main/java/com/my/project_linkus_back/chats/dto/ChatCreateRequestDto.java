package com.my.project_linkus_back.chats.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatCreateRequestDto {
    private String text;
    private Double longitude;
    private Double latitude;
}

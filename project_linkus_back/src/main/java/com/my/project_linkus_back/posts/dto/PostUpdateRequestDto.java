package com.my.project_linkus_back.posts.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostUpdateRequestDto {
    private String text;
    private String userId;
    private String markerCustom;
    private String boxCustom;
}

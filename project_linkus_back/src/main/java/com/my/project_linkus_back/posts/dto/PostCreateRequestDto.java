package com.my.project_linkus_back.posts.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostCreateRequestDto {
    private String text;
    private Double latitude;
    private Double longitude;
    private Integer altitude;
    private String imageUrl;
    private String markerCustom;
    private String boxCustom;
}

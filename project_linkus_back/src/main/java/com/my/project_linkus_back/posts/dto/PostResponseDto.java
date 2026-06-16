package com.my.project_linkus_back.posts.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostResponseDto {
    private Long postId;
    private String text;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private Integer altitude;
    private Integer likeNum;
    private String markerCustom;
    private String boxCustom;
    private String userId;
}

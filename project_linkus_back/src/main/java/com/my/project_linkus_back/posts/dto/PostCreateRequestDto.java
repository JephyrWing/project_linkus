package com.my.project_linkus_back.posts.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class PostCreateRequestDto {
    private String text;
    private MultipartFile file;
    private Double longitude;
    private Double latitude;
    private Integer altitude;
    private String imageUrl;
    private String userId;
    private String markerCustom;
    private String boxCustom;
}

package com.my.project_linkus_back.posts.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostRequestDto {
    private Double swLatitude;
    private Double swLongitude;
    private Double neLatitude;
    private Double neLongitude;
}

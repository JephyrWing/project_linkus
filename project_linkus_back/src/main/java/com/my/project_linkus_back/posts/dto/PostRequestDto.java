package com.my.project_linkus_back.posts.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostRequestDto {
    private String swLatitude;
    private String swLongitude;
    private String neLatitude;
    private String neLongitude;
}

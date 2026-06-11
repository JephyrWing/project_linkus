package com.my.project_linkus_back.posts.dto;

import lombok.Getter;
import lombok.Setter;
import org.locationtech.jts.geom.Point;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class PostRequestDto {
    private String text;
    private String accountId;
    private MultipartFile file;
    private Point location;
    private Integer altitude;
    private String userId;
    private String markerCustom;
    private String boxCustom;
}

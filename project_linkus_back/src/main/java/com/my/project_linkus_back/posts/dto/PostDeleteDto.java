package com.my.project_linkus_back.posts.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostDeleteDto {
    private Long postId;
    private String userId;
}

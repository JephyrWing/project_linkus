package com.my.project_linkus_back.posts.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class PostUpdateRequestDto {
    private Long postId;
    private String text;
    private String userId;
    private Integer altitude;
    private String markerCustom;
    private String boxCustom;

    // 수정할 때 새로 업로드한 이미지 파일임
    // 프론트 FormData의 file 값이 여기로 들어옴
    private MultipartFile file;

    // S3 업로드 후 생성된 이미지 URL임
    // service에서 Posts.imageUrl에 저장할 값임
    private String imageUrl;
}

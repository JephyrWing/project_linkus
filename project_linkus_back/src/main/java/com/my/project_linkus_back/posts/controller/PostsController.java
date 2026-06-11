package com.my.project_linkus_back.posts.controller;

import com.my.project_linkus_back.common.service.S3Service;
import com.my.project_linkus_back.posts.dto.PostRequestDto;
import com.my.project_linkus_back.posts.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/posts")
public class PostsController {
    private final S3Service s3Service;
    private final PostService postService;

    @PostMapping("/api/upload")
    public String uploadPost(@ModelAttribute PostRequestDto dto) {
        String imageUrl = s3Service.uploadFile(dto.getFile());
        System.out.println(imageUrl);
        return "업로드 완료";
    }
}

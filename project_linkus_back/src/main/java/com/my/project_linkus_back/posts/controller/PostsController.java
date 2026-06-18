package com.my.project_linkus_back.posts.controller;

import com.my.project_linkus_back.common.service.S3Service;
import com.my.project_linkus_back.posts.dto.*;
import com.my.project_linkus_back.posts.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostsController {
    private final S3Service s3Service;
    private final PostService postService;

    @PostMapping("/upload")
    public PostResponseDto uploadPost(@ModelAttribute PostCreateRequestDto dto) {
        if (dto.getFile() != null) {
            dto.setImageUrl(s3Service.uploadFile(dto.getFile()));
        }
        return postService.create(dto);
    }

    @PostMapping
    public List<PostResponseDto> getPostsInCurrentMap(@RequestBody PostsRequestDto dto) {
        return postService.postsInCurrentMap(dto.getSwLatitude(), dto.getSwLongitude(), dto.getNeLatitude(), dto.getNeLongitude());
    }

    // 단건 조회
    @PostMapping("/findone")
    public PostResponseDto findById(@RequestBody Long id) {
        return postService.findById(id);
    }

    // 수정
    @PutMapping("/update")
    public PostResponseDto update(@RequestBody PostUpdateRequestDto dto) {
        return postService.update(dto);
    }

    // 삭제
    @DeleteMapping("/delete")
    public void delete(@RequestBody PostDeleteDto dto) {
        postService.delete(dto);
    }
}

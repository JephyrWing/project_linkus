package com.my.project_linkus_back.posts.controller;

import com.my.project_linkus_back.common.service.S3Service;
import com.my.project_linkus_back.posts.dto.PostCreateRequestDto;
import com.my.project_linkus_back.posts.dto.PostRequestDto;
import com.my.project_linkus_back.posts.dto.PostResponseDto;
import com.my.project_linkus_back.posts.dto.PostUpdateRequestDto;
import com.my.project_linkus_back.posts.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // 생성
    @PostMapping
    public PostResponseDto create(@RequestBody PostCreateRequestDto dto){
        return postService.create(dto);
    }

    // 전채 조회
    @GetMapping
    public List<PostResponseDto> findAll() {
        return postService.findAll();
    }
    // 단건 조회
    @GetMapping("/{id}")
    public PostResponseDto findById(@PathVariable Long id){
        return postService.findById(id);
    }

    // 수정
    @PutMapping("/{id}")
    public PostResponseDto update(@PathVariable Long id, @RequestBody PostUpdateRequestDto dto){
        return postService.update(id, dto);
    }

    // 삭제
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        postService.delete(id);
    }
}

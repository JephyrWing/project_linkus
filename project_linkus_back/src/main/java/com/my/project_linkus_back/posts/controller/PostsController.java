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

    // 현재 보고 있는 지도 좌표 내의 게시물 보기
    @PostMapping
    public List<PostResponseDto> getPostsInCurrentMap(@RequestBody PostRequestDto dto) {
        return postService.postsInCurrentMap(dto.getSwLatitude(), dto.getSwLongitude(), dto.getNeLatitude(), dto.getNeLongitude());
    }

    // 단건 조회
    @GetMapping("/{postId}")
    public PostResponseDto findById(@PathVariable Long postId) {
        return postService.findById(postId);
    }

    // 수정
    @PutMapping
    public PostResponseDto update(@RequestBody PostUpdateRequestDto dto) {
        return postService.update(dto);
    }

    // 삭제
    @DeleteMapping
    public String delete(@RequestBody PostDeleteDto dto) {
        postService.delete(dto);
        return "처리되었습니다.";
    }

    // 좋아요 처리
    @PostMapping("/postlikes")
    public void clickLike(@RequestBody PostLikeRequestDto dto) {
        postService.clickLike(dto);
    }

    // 좋아요 해제 처리
    @DeleteMapping("/postlikes")
    public void unClickLike(@RequestBody PostLikeRequestDto dto) {
        postService.unClickLike(dto);
    }

    // 특정 유저의 게시물 모아보기
    @GetMapping("/{userId}")
    public List<PostResponseDto> userPosts(@PathVariable String userId) {
        return postService.userPosts(userId);
    }

    // 유저가 좋아요한 게시물 모아보기
    @GetMapping("/postlikes/{userId}")
    public List<PostResponseDto> favoritePosts(@PathVariable String userId) {
        return postService.favoritePosts(userId);
    }
}

package com.my.project_linkus_back.posts.controller;

import com.my.project_linkus_back.common.dto.PageResponse;
import com.my.project_linkus_back.common.service.S3Service;
import com.my.project_linkus_back.posts.dto.*;
import com.my.project_linkus_back.posts.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

import java.util.Collections;
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
    // 게시글 수정
// 글만 수정할 수도 있고, 사진 파일까지 같이 수정할 수도 있어서 multipart/form-data로 받음
    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PostResponseDto update(@ModelAttribute PostUpdateRequestDto dto) {
        if (dto.getFile() != null && !dto.getFile().isEmpty()) {
            dto.setImageUrl(s3Service.uploadFile(dto.getFile()));
        }

        return postService.update(dto);
    }

    // 삭제
    @DeleteMapping
    public String delete(@RequestBody PostDeleteDto dto) {
        postService.delete(dto, false);
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
    @GetMapping("/user/{userId}")
    public PageResponse<PostResponseDto> userPosts(@PathVariable String userId,
                                                   @RequestParam(name = "page", defaultValue = "0") int page,
                                                   @RequestParam(name = "size", defaultValue = "10") int size) {
        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        List<PostResponseDto> results = postService.userPosts(userId);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<PostResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<PostResponseDto> resultpage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultpage);
    }

    // 유저가 좋아요한 게시물 모아보기
    @GetMapping("/postlikes/{userId}")
    public PageResponse<PostResponseDto> favoritePosts(@PathVariable String userId,
                                                       @RequestParam(name = "page", defaultValue = "0") int page,
                                                       @RequestParam(name = "size", defaultValue = "10") int size) {
        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        List<PostResponseDto> results = postService.favoritePosts(userId);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<PostResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<PostResponseDto> resultpage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultpage);
    }
}

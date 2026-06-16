package com.my.project_linkus_back.posts.service;

import com.my.project_linkus_back.common.utils.GeometryUtils;
import com.my.project_linkus_back.posts.dto.PostCreateRequestDto;
import com.my.project_linkus_back.posts.dto.PostResponseDto;
import com.my.project_linkus_back.posts.dto.PostUpdateRequestDto;
import com.my.project_linkus_back.posts.entity.Posts;
import com.my.project_linkus_back.posts.repository.PostLikesRepository;
import com.my.project_linkus_back.posts.repository.PostRepository;
import com.my.project_linkus_back.users.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final PostLikesRepository postLikesRepository;
    private final UsersRepository usersRepository;

    // Post 저장
    public PostResponseDto create(PostCreateRequestDto dto){
        Point point = GeometryUtils.createPoint(dto.getLongitude(), dto.getLatitude());

        Posts post = new Posts();

        post.setText(dto.getText());
        post.setLocation(point);
        post.setAltitude(dto.getAltitude());
        post.setImageUrl(dto.getImageUrl());
        post.setMarkerCustom(dto.getMarkerCustom());
        post.setBoxCustom(dto.getBoxCustom());
        post.setUser(usersRepository.findByUserId(dto.getUserId()).orElse(null));
        post.setLikeNum(0);

        return toDto(postRepository.save(post));
    }

    // 전체 조회
    public List<PostResponseDto> findAll() {
        return postRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    // PostId 조회
    public PostResponseDto findById(Long id){
        Posts post = postRepository.findById(id).orElseThrow(()->new RuntimeException("게시글이 존재하지 않습니다."));

        return toDto(post);
    }

    // 수정
    public PostResponseDto update(PostUpdateRequestDto dto) {
        Posts post = postRepository.findById(dto.getPostId()).orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));

        post.setText(dto.getText());
        post.setMarkerCustom(dto.getMarkerCustom());
        post.setBoxCustom(dto.getBoxCustom());

        Posts updatedPost = postRepository.save(post);

        return toDto(updatedPost);
    }

    // 삭제
    public void delete(Long id) {
        Posts post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));
        postRepository.delete(post);
    }

    // Entity -> DTO 변환해서 service에서 작동하는 메서드
    private PostResponseDto toDto(Posts post){
        return PostResponseDto.builder()
                .postId(post.getId())
                .text(post.getText())
                .imageUrl(post.getImageUrl())
                .latitude(post.getLocation().getY())
                .longitude(post.getLocation().getX())
                .altitude(post.getAltitude())
                .likeNum(post.getLikeNum())
                .markerCustom(post.getMarkerCustom())
                .boxCustom(post.getBoxCustom())
                .userId(post.getUser().getUserId())
                .build();
    }

}

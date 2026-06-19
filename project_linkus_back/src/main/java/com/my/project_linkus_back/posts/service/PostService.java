package com.my.project_linkus_back.posts.service;

import com.my.project_linkus_back.common.exception.BadAccessException;
import com.my.project_linkus_back.common.exception.BusinessException;
import com.my.project_linkus_back.common.service.CustomUserDetails;
import com.my.project_linkus_back.common.utils.AccountVerification;
import com.my.project_linkus_back.common.utils.GeometryUtils;
import com.my.project_linkus_back.posts.dto.PostCreateRequestDto;
import com.my.project_linkus_back.posts.dto.PostDeleteDto;
import com.my.project_linkus_back.posts.dto.PostResponseDto;
import com.my.project_linkus_back.posts.dto.PostUpdateRequestDto;
import com.my.project_linkus_back.posts.entity.Posts;
import com.my.project_linkus_back.posts.repository.PostLikesRepository;
import com.my.project_linkus_back.posts.repository.PostRepository;
import com.my.project_linkus_back.users.entity.Users;
import com.my.project_linkus_back.users.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final PostLikesRepository postLikesRepository;
    private final UsersRepository usersRepository;

    // Post 저장
    @Transactional
    public PostResponseDto create(PostCreateRequestDto dto) {

        // 로그인 중인 유저와 삭제를 원하는 계정이 같은 지 검증
        AccountVerification accountVerification = new AccountVerification();
        accountVerification.verfication(dto.getUserId());

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

        return PostResponseDto.toDto(postRepository.save(post));
    }

    // 전체 조회
    public List<PostResponseDto> findAll() {
        return postRepository.findAll()
                .stream()
                .map(x->PostResponseDto.toDto(x))
                .toList();
    }

    // PostId 조회
    public PostResponseDto findById(Long id) {
        Posts post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));

        return PostResponseDto.toDto(post);
    }

    // 수정
    @Transactional
    public PostResponseDto update(PostUpdateRequestDto dto) {
        Posts post = postRepository.findById(dto.getPostId()).orElseThrow(() -> new BadAccessException("게시글이 존재하지 않습니다."));

        Users loginedUser = post.getUser();
        if (loginedUser == null) {
            throw new BadAccessException("잘못된 게시물입니다.");
        } else {
            // 로그인 중인 유저와 삭제를 원하는 계정이 같은 지 검증
            AccountVerification accountVerification = new AccountVerification();
            accountVerification.verfication(loginedUser.getUserId());
        }
        post.setText(dto.getText());
        post.setMarkerCustom(dto.getMarkerCustom());
        post.setBoxCustom(dto.getBoxCustom());
        Posts updatedPost = postRepository.save(post);

        return PostResponseDto.toDto(updatedPost);
    }

    // 삭제
    @Transactional
    public void delete(PostDeleteDto dto) {
        Posts post = postRepository.findById(dto.getPostId()).orElseThrow(() -> new BadAccessException("게시글이 존재하지 않습니다."));
        Users loginedUser = post.getUser();
        if (loginedUser == null) {
            throw new BadAccessException("잘못된 게시물입니다.");
        } else {
            // 로그인 중인 유저와 삭제를 원하는 계정이 같은 지 검증
            AccountVerification accountVerification = new AccountVerification();
            accountVerification.verfication(loginedUser.getUserId());
        }
        postRepository.delete(post);
    }

    public List<PostResponseDto> postsInCurrentMap(String swLatitude, String swLongitude, String neLatitude, String neLongitude) {
        List<Posts> result = postRepository.postsContainedCurrentMap(swLatitude, swLongitude, neLatitude, neLongitude);
        return result.stream().map(x -> PostResponseDto.toDto(x)).toList();
    }

}

package com.my.project_linkus_back.posts.service;

import com.my.project_linkus_back.bans.service.BansService;
import com.my.project_linkus_back.common.exception.BadAccessException;
import com.my.project_linkus_back.common.exception.BusinessException;
import com.my.project_linkus_back.common.exception.UserNotFoundException;
import com.my.project_linkus_back.common.service.CustomUserDetails;
import com.my.project_linkus_back.common.utils.AccountVerification;
import com.my.project_linkus_back.common.utils.GeometryUtils;
import com.my.project_linkus_back.posts.dto.*;
import com.my.project_linkus_back.posts.entity.PostLikes;
import com.my.project_linkus_back.posts.entity.Posts;
import com.my.project_linkus_back.posts.repository.PostLikesRepository;
import com.my.project_linkus_back.posts.repository.PostRepository;
import com.my.project_linkus_back.reports.repository.ReportRepository;
import com.my.project_linkus_back.users.entity.Users;
import com.my.project_linkus_back.users.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {
    private static final String DEFAULT_MARKER_CUSTOM = "pin_brown";

    private final PostRepository postRepository;
    private final PostLikesRepository postLikesRepository;
    private final UsersRepository usersRepository;
    private final BansService bansService;
    private final ReportRepository reportRepository;

    // Post 저장
    @Transactional
    public PostResponseDto create(PostCreateRequestDto dto) {

        Users user = usersRepository.findByUserId(dto.getUserId())
                .orElseThrow(() -> new BusinessException("유저를 찾을 수 없습니다."));

        // 밴 유저인지 확인
        if (bansService.existsUserId(dto.getUserId())) {
            throw new BadAccessException("현재 정지 상태인 계정입니다.");
        }

        // 로그인 중인 유저와 게시를 원하는 계정이 같은 지 검증
        AccountVerification accountVerification = new AccountVerification(usersRepository);
        accountVerification.verfication(dto.getUserId());

        Point point = GeometryUtils.createPoint(dto.getLongitude(), dto.getLatitude());
        Posts post = new Posts();
        post.setText(dto.getText());
        post.setLocation(point);
        post.setAltitude(dto.getAltitude());
        post.setImageUrl(dto.getImageUrl());
        post.setMarkerCustom(defaultMarkerCustom(dto.getMarkerCustom()));
        post.setBoxCustom(dto.getBoxCustom());
        post.setUser(user);
        post.setLikeNum(0);
        Posts savedPost = postRepository.save(post);


        return PostResponseDto.toDto(savedPost, likeChecked(savedPost.getId()));
    }

    // 전체 조회
    public List<PostResponseDto> findAll() {
        return postRepository.findAll()
                .stream()
                .map(x -> PostResponseDto.toDto(x, likeChecked(x.getId())))
                .toList();
    }

    // PostId 조회
    public PostResponseDto findById(Long id) {
        Posts post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));

        return PostResponseDto.toDto(post, likeChecked(id));
    }

    // 수정
    @Transactional
    public PostResponseDto update(PostUpdateRequestDto dto) {
        Posts post = postRepository.findById(dto.getPostId()).orElseThrow(() -> new BadAccessException("게시글이 존재하지 않습니다."));

        Users postWriter = post.getUser();
        if (postWriter == null) {
            throw new BadAccessException("잘못된 게시물입니다.");
        } else {
            // 로그인 중인 유저와 수정을 원하는 계정이 같은 지 검증

            AccountVerification accountVerification = new AccountVerification(usersRepository);
            accountVerification.verfication(postWriter.getUserId());

        }
        post.setText(dto.getText());
        if (dto.getAltitude() != null) {
            post.setAltitude(dto.getAltitude());
        }
        post.setMarkerCustom(defaultMarkerCustom(dto.getMarkerCustom()));
        post.setBoxCustom(dto.getBoxCustom());
        // 수정 요청에서 새 이미지 URL이 넘어온 경우에만 게시글 이미지 URL을 교체함
        // 새 사진을 선택하지 않은 수정이면 기존 이미지가 그대로 유지됨
        if (dto.getImageUrl() != null) {
            post.setImageUrl(dto.getImageUrl());
        }
        Posts updatedPost = postRepository.save(post);

        return PostResponseDto.toDto(updatedPost, likeChecked(updatedPost.getId()));
    }

    // 삭제
    private String defaultMarkerCustom(String markerCustom) {
        return (markerCustom == null || markerCustom.isBlank())
                ? DEFAULT_MARKER_CUSTOM
                : markerCustom;
    }

    @Transactional
    public void delete(PostDeleteDto dto, boolean isAdmin) {

        Long postId = dto.getPostId();
        Posts post = postRepository.findById(dto.getPostId())
                .orElseThrow(() -> new BadAccessException("게시글이 존재하지 않습니다."));

        Users postWriter = post.getUser();

        if (!isAdmin) {
            if (postWriter == null) {
                throw new BadAccessException("잘못된 게시물입니다.");
            }
            // 로그인 중인 유저와 삭제를 원하는 계정이 같은 지 검증
            AccountVerification accountVerification = new AccountVerification(usersRepository);
            accountVerification.verfication(postWriter.getUserId());
        }

        reportRepository.nullifyPostId(postId);
        postLikesRepository.deleteByPostId(postId);
        postRepository.delete(post);
    }

    // 현재 보고 있는 지도 내의 게시물 조회
    public List<PostResponseDto> postsInCurrentMap(Double swLatitude, Double swLongitude, Double neLatitude, Double neLongitude) {
        List<Posts> result = postRepository.postsContainedCurrentMap(swLatitude, swLongitude, neLatitude, neLongitude);
        return result.stream().map(x -> PostResponseDto.toDto(x, likeChecked(x.getId()))).toList();
    }

    // 좋아요 처리
    @Transactional
    public void clickLike(PostLikeRequestDto dto) {
        Users user = usersRepository.findByUserId(dto.getUserId()).orElseThrow(() -> new UserNotFoundException());
        Posts post = postRepository.findById(dto.getPostId()).orElseThrow(() -> new BadAccessException("게시물이 없습니다."));
        if (!postLikesRepository.existsByPostAndUser(post, user)) {
            // 본인 검증
            AccountVerification accountVerification = new AccountVerification(usersRepository);
            accountVerification.verfication(user.getUserId());

            PostLikes postLikes = new PostLikes();
            postLikes.setPost(post);
            postLikes.setUser(user);
            postLikesRepository.save(postLikes);
            post.setLikeNum(postLikesRepository.countByPost(post));
            postRepository.save(post);
        }
    }

    // 좋아요 해제 처리
    @Transactional
    public void unClickLike(PostLikeRequestDto dto) {
        Users user = usersRepository.findByUserId(dto.getUserId()).orElseThrow(() -> new UserNotFoundException());
        Posts post = postRepository.findById(dto.getPostId()).orElseThrow(() -> new BadAccessException("게시물이 없습니다."));
        if (postLikesRepository.existsByPostAndUser(post, user)) {
            // 본인 검증
            AccountVerification accountVerification = new AccountVerification(usersRepository);
            accountVerification.verfication(user.getUserId());

            postLikesRepository.deleteByPost_IdAndUser_UserId(post.getId(), user.getUserId());
            postLikesRepository.flush();
            post.setLikeNum(postLikesRepository.countByPost(post));
            postRepository.save(post);
        }
    }

    // 특정 유저 게시물 모아보기
    public List<PostResponseDto> userPosts(String userId) {
        return postRepository.findByUser_UserId(userId).stream().map(x -> PostResponseDto.toDto(x, likeChecked(x.getId()))).toList();
    }

    // 유저가 좋아요한 게시물 모아보기
    public List<PostResponseDto> favoritePosts(String userId) {
        return postRepository.findPostsByUserId(userId).stream().map(x -> PostResponseDto.toDto(x, likeChecked(x.getId()))).toList();
    }

    // 현재 로그인 한 유저가 좋아요를 눌렀는지 여부
    public boolean likeChecked(Long postId) {
        // 현재 로그인 중인 유저 정보 확인
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // 현재 로그인 상태인지 확인
        if (authentication == null ||
                !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return false;
        }
        String currentUserId = userDetails.getUserId();
        return postLikesRepository.existsByPost_IdAndUser_UserId(postId, currentUserId);
    }

    // 특정 게시물의 작성자 ID 조회
    public String getAuthorId(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new BadAccessException("게시글 없음"))
                .getUser().getUserId();
    }

}

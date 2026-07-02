package com.my.project_linkus_back.posts.dto;

import com.my.project_linkus_back.posts.entity.Posts;
import com.my.project_linkus_back.posts.service.PostService;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostResponseDto {
    private Long postId;
    private String text;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private Integer altitude;
    private Integer likeNum;
    private String markerCustom;
    private String boxCustom;
    // 게시물의 게시자
    private String userId;
    private String nickName;

    // 현재 로그인 한 유저가 게시물에 좋아요를 눌렀는지 여부
    private boolean likeChecked;

    // Entity -> DTO 변환해서 service에서 작동하는 메서드
    public static PostResponseDto toDto(Posts post, boolean likeChecked) {

        var user = post.getUser();
        return PostResponseDto.builder()
                .postId(post.getId())
                .text(post.getText())
                .imageUrl(post.getImageUrl())
                .longitude(post.getLocation().getX())
                .latitude(post.getLocation().getY())
                .altitude(post.getAltitude())
                .likeNum(post.getLikeNum())
                .markerCustom(post.getMarkerCustom())
                .boxCustom(post.getBoxCustom())
                .userId(user != null ? user.getUserId() : "deleted")
                .nickName(user != null ? user.getNickName() : "탈퇴한 회원")
                .likeChecked(likeChecked)
                .build();
    }
}

package com.my.project_linkus_back.posts.dto;

import com.my.project_linkus_back.posts.entity.Posts;
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
    private String userId;

    // Entity -> DTO 변환해서 service에서 작동하는 메서드
    public static PostResponseDto toDto(Posts post) {
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

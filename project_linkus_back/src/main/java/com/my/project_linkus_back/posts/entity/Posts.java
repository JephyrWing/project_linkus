package com.my.project_linkus_back.posts.entity;

import com.my.project_linkus_back.common.entity.BaseEntity;
import com.my.project_linkus_back.users.entity.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.locationtech.jts.geom.Point;

@Entity
@Getter
@Setter
public class Posts extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "POINT")
    private Point location;

    private Integer altitude;

    @Column(length = 5000)
    private String text;

    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY) // 필요할 때(호출할 때)만 로딩, on delete나 on update 설정은 괄호 안에 cascade= 으로 설정
    @JoinColumn(name = "user_id")
    private Users user;

    @Column(name = "like_num")
    private Integer likeNum;

    @Column(name = "marker_custom")
    private String markerCustom;

    @Column(name = "box_custom")
    private String boxCustom;
}

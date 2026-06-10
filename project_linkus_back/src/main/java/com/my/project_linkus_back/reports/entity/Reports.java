package com.my.project_linkus_back.reports.entity;

import com.my.project_linkus_back.chats.entity.Chats;
import com.my.project_linkus_back.common.entity.BaseEntity;
import com.my.project_linkus_back.posts.entity.Posts;
import com.my.project_linkus_back.users.entity.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.locationtech.jts.geom.Point;


@Entity
@Getter
@Setter
public class Reports extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 1000)
    private String text;

    @ManyToOne(fetch = FetchType.LAZY) // 필요할 때(호출할 때)만 로딩, on delete나 on update 설정은 괄호 안에 cascade= 으로 설정
    @JoinColumn(name = "post_id")
    private Posts post;

    @ManyToOne(fetch = FetchType.LAZY) // 필요할 때(호출할 때)만 로딩, on delete나 on update 설정은 괄호 안에 cascade= 으로 설정
    @JoinColumn(name = "chat_id")
    private Chats chat;

    @ManyToOne(fetch = FetchType.LAZY) // 필요할 때(호출할 때)만 로딩, on delete나 on update 설정은 괄호 안에 cascade= 으로 설정
    @JoinColumn(name = "user_id")
    private Users user;
}

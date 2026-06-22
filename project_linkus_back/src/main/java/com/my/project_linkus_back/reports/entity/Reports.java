package com.my.project_linkus_back.reports.entity;

import com.my.project_linkus_back.chats.entity.Chats;
import com.my.project_linkus_back.common.entity.BaseEntity;
import com.my.project_linkus_back.posts.entity.Posts;
import com.my.project_linkus_back.users.entity.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Reports extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 신고 내용
    @Column(length = 1000)
    private String text;

    // 신고 대상- 게시글
    @ManyToOne(fetch = FetchType.LAZY) // 필요할 때(호출할 때)만 로딩, on delete나 on update 설정은 괄호 안에 cascade= 으로 설정
    @JoinColumn(name = "posts_id")
    private Posts post;

    // 신고 대상 - 채팅
    @ManyToOne(fetch = FetchType.LAZY) // 필요할 때(호출할 때)만 로딩, on delete나 on update 설정은 괄호 안에 cascade= 으로 설정
    @JoinColumn(name = "chats_id")
    private Chats chat;

    // 신고한 유저
    @ManyToOne(fetch = FetchType.LAZY) // 필요할 때(호출할 때)만 로딩, on delete나 on update 설정은 괄호 안에 cascade= 으로 설정
    @JoinColumn(name = "users_id")
    private Users user;

    // 처리 여부
    private boolean processed = false;
}

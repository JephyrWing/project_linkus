package com.my.project_linkus_back.chats.entity;

import com.my.project_linkus_back.common.entity.BaseEntity;
import com.my.project_linkus_back.users.entity.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.locationtech.jts.geom.Point;


@Entity
@Getter
@Setter
public class Chats extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500)
    private String text;

    @Column(columnDefinition = "POINT")
    private Point location;

    private String ip;

    @ManyToOne(fetch = FetchType.LAZY) // 필요할 때(호출할 때)만 로딩, on delete나 on update 설정은 괄호 안에 cascade= 으로 설정
    @JoinColumn(name = "users_id")
    private Users user;
}

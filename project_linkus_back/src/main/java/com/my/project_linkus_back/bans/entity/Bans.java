package com.my.project_linkus_back.bans.entity;

import com.my.project_linkus_back.common.entity.BaseEntity;
import com.my.project_linkus_back.users.entity.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
public class Bans extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reason;

    private String ip;

    // 재가입 방지용으로 이메일 남김
    private String bannedEmail;

    @ManyToOne(fetch = FetchType.LAZY) // 필요할 때(호출할 때)만 로딩, on delete나 on update 설정은 괄호 안에 cascade= 으로 설정
    @JoinColumn(name = "users_id", foreignKey = @ForeignKey(
            name = "fk_bans_users",
            foreignKeyDefinition = "FOREIGN KEY (users_id) REFERENCES users(id) ON DELETE SET NULL"
    ))
    private Users user;

    // 밴 유지 기간(시간 단위)
    private Long ttl;
}

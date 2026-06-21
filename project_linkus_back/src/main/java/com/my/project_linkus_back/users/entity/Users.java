package com.my.project_linkus_back.users.entity;

import com.my.project_linkus_back.common.entity.BaseEntity;
import com.my.project_linkus_back.common.entity.Gender;
import com.my.project_linkus_back.common.entity.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class Users extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;

    @Column(nullable = false)
    private String password;

    @Column(name = "nick_name", nullable = false)
    private String nickName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "call_num")
    private String callNum;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private Integer level;

    @Column(name = "chat_custom")
    private String chatCustom;

    @Column(name = "kakao_account_link")
    private String kakaoAccountLink;

    @Column(name = "google_account_link")
    private String googleAccountLink;

}

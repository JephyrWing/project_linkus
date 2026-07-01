package com.my.project_linkus_back.users.dto;

import com.my.project_linkus_back.common.entity.Gender;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UsersUpdateRequestDto {
    private String userId;
    private String nickName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String callNum;
    private String chatCustom;
    private String kakaoAccountLink;
    private String googleAccountLink;

    // 비밀번호 변경용
    private String currentPassword;
    private String newPassword;
}

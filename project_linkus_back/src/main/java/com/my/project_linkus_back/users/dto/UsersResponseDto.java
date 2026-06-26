package com.my.project_linkus_back.users.dto;

import com.my.project_linkus_back.common.entity.Gender;
import com.my.project_linkus_back.common.entity.UserRole;
import com.my.project_linkus_back.users.entity.Users;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class UsersResponseDto {
    private Long id;
    private String userId;
    private String email;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String callNum;

    private UserRole role;
    private Integer level;

    private String chatCustom;
    private String kakaoAccountLink;
    private String googleAccountLink;

    public static UsersResponseDto from(Users users) {
        return UsersResponseDto.builder()
                .id(users.getId())
                .userId(users.getUserId())
                .email(users.getEmail())
                .dateOfBirth(users.getDateOfBirth())
                .gender(users.getGender())
                .callNum(users.getCallNum())
                .role(users.getRole())
                .level(users.getLevel())
                .chatCustom(users.getChatCustom())
                .kakaoAccountLink(users.getKakaoAccountLink())
                .googleAccountLink(users.getGoogleAccountLink())
                .build();
    }
}

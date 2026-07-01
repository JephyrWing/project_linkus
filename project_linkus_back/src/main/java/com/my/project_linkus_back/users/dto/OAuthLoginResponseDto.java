package com.my.project_linkus_back.users.dto;

import com.my.project_linkus_back.common.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OAuthLoginResponseDto {
    private String accessToken;
    private String userId;
    private String nickName;
    private UserRole role;
}

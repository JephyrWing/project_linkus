package com.my.project_linkus_back.users.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponseDto {
    private Long Id;
    private String userId;
    private String nickName;
    private Integer level;
}

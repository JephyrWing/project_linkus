package com.my.project_linkus_back.users.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsersLoginRequestDto {
    private  String  userId;
    private String password;
}

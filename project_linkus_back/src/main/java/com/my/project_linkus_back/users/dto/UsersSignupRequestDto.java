package com.my.project_linkus_back.users.dto;

import com.my.project_linkus_back.common.entity.Gender;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UsersSignupRequestDto {
    // 로그인 아이디
    private String userId;
    // 비밀번호
    private  String  password;
    //닉네임
    private  String  nickName;
    //생년월일
    private LocalDate dateOfBirth;
    //성별
    private Gender gender;
    //연락처
    private  String callNum;

    public static Object builder() {
        return null;
    }
}

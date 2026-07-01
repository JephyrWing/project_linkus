package com.my.project_linkus_back.users.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.my.project_linkus_back.common.entity.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UsersSignupRequestDto {
    @NotBlank
    private String userId;

    private String nickName;

    @NotBlank
    private String password;

    @NotBlank
    @Email
    private String email;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    private Gender gender;

    private String callNum;
}

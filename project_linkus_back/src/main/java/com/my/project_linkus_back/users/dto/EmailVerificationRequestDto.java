package com.my.project_linkus_back.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmailVerificationRequestDto {
    @NotBlank
    @Email
    private String email;

    private String code;
}

package com.my.project_linkus_back.users.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GoogleLoginRequestDto {
    @NotBlank
    private String code;

    @NotBlank
    private String redirectUri;
}

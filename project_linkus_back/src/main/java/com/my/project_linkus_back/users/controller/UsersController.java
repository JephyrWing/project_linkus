package com.my.project_linkus_back.users.controlleer;

import com.my.project_linkus_back.users.dto.UsersSignupRequestDto;
import com.my.project_linkus_back.users.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
@RequiredArgsConstructor

public class UsersController {
    private final UsersService usersService;

     // 1. 회원가입
    @PostMapping("/signup")
    public ResponseEntity<UsersSignupRequestDto> signup(
            @RequestBody UsersSignupRequestDto dto
    )
    {
        return  ResponseEntity.ok(UsersService.signup(dto));
    }
}

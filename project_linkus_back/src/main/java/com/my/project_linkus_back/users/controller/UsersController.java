package com.my.project_linkus_back.users.controller;

import com.my.project_linkus_back.users.dto.*;
import com.my.project_linkus_back.users.service.GoogleOAuthService;
import com.my.project_linkus_back.users.service.KakaoOAuthService;
import com.my.project_linkus_back.users.service.UsersService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UsersController {
    private final UsersService usersService;
    private final KakaoOAuthService kakaoOAuthService;
    private final GoogleOAuthService googleOAuthService;

    // 아이디 중복 확인
    @GetMapping("/signup/idconfirm/{userId}")
    public boolean idConfirm(@PathVariable("userId") String tempId) {
       return usersService.idCheck(tempId);
    }

    // 이메일 중복 확인
    @GetMapping("/signup/emailconfirm/{email}")
    public boolean emailConfirm(@PathVariable String email) {
        return usersService.emailCheck(email);
    }

    // 회원가입
    @PostMapping("/signup")
    public UsersResponseDto signup(@Valid @RequestBody UsersSignupRequestDto dto) {
        return usersService.signup(dto);
    }

    @PostMapping("/oauth/kakao")
    public OAuthLoginResponseDto kakaoLogin(@Valid @RequestBody KakaoLoginRequestDto dto) {
        return kakaoOAuthService.login(dto);
    }

    @PostMapping("/oauth/google")
    public OAuthLoginResponseDto googleLogin(@Valid @RequestBody GoogleLoginRequestDto dto) {
        return googleOAuthService.login(dto);
    }

//     // 로그인
//    @PostMapping("/login")
//    public UsersResponseDto login(@RequestBody UsersLoginRequestDto dto) {
//          return  usersService.login(dto);
//    }

    //MyPage
    @GetMapping("/my/{userId}")
    public UsersResponseDto getMyInfo(@PathVariable String userId) {
        return usersService.getUser(userId);
    }

    // 회원탈퇴
    @DeleteMapping("/my/{userId}")
    public String deleteUser(@PathVariable String userId) {
        usersService.deleteUser(userId);
        return "회원 탈퇴 완료";
    }

    //회원정보 수정
    @PutMapping("/my/{userId}")
    public UsersResponseDto updateUser(@PathVariable String userId, @RequestBody UsersUpdateRequestDto dto) {
        return usersService.updateUser(dto);
    }

}

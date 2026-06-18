package com.my.project_linkus_back.users.controller;

import com.my.project_linkus_back.users.dto.*;
import com.my.project_linkus_back.users.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UsersController {
    private final UsersService usersService;

    // 아이디 중복 확인
    @GetMapping("/signup/idconfirm/{id}")
    public String idConfirm(@PathVariable String tempId) {
        if (usersService.idCheck(tempId)) {
            return "사용할 수 없는 아이디 입니다.";
        } else {
            return "사용 가능한 아이디 입니다.";
        }
    }

    // 회원가입
    @PostMapping("/signup")
    public UsersResponseDto signup(@RequestBody UsersSignupRequestDto dto) {
        return usersService.signup(dto);
    }

//     // 로그인
//    @PostMapping("/login")
//    public UsersResponseDto login(@RequestBody UsersLoginRequestDto dto) {
//          return  usersService.login(dto);
//    }

    //MyPage
    @GetMapping("/me")
    public UsersResponseDto getMyInfo(@RequestParam String userId) {
        return usersService.getUser(userId);
    }

    // 회원탈퇴
    @DeleteMapping("/me/delete/{userId}")
    public String deleteUser(@PathVariable String userId) {
        return "회원 탈퇴 완료";
    }

    //회원정보 수정
    @PutMapping("/me/update")
    public UsersResponseDto updateUser(@RequestBody UsersUpdateRequestDto dto) {
        return usersService.updateUser(dto);
    }

}

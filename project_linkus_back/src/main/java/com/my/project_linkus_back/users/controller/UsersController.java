package com.my.project_linkus_back.users.controller;

import com.my.project_linkus_back.users.dto.*;
import com.my.project_linkus_back.users.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/api")
@RequiredArgsConstructor
public class UsersController {
    private final UsersService usersService;

    // 회원가입
     @PostMapping("/signup")
     public UsersResponseDto  signup(@RequestBody UsersSignupRequestDto dto) {
         return usersService.signup(dto) ;
     }

//     // 로그인
//    @PostMapping("/login")
//    public UsersResponseDto login(@RequestBody UsersLoginRequestDto dto) {
//          return  usersService.login(dto);
//    }

    //MyPage
    @GetMapping("/me")
    public UsersResponseDto getMyInfo(@RequestParam String userId){
         return usersService.getUser(userId);
    }

    // 회원탈퇴
    @DeleteMapping("/me")
    public String deleteUser (@PathVariable String userId){
         usersService.deleteUser(userId);

         return "회원 탈퇴 완료";
    }

    //회원정보 수정
    @PutMapping("/me")
    public UsersResponseDto updateUser(@PathVariable String userId,@RequestBody UsersUpdateRequestDto dto){
         return usersService.updateUser(userId, dto);
    }

}

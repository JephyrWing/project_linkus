package com.my.project_linkus_back.users.controller;

import com.my.project_linkus_back.users.dto.LoginDto;
import com.my.project_linkus_back.users.dto.UserResponseDto;
import com.my.project_linkus_back.users.dto.UsersSignupRequestDto;
import com.my.project_linkus_back.users.repository.UsersRepository;
import com.my.project_linkus_back.users.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UsersController {
    private final UsersService usersService;

    // 회원가입
     @PostMapping("/signup")
    public String  signup(@RequestBody UsersSignupRequestDto dto) {
         usersService.signup(dto) ;

         return  "회원가입 성공";

     }
     // 로그인  API
    //POST / users/ Login
    @PostMapping("/login")
    public UserResponseDto login (@RequestBody LoginDto dto) {
          return  usersService.login(dto);

    }
    @DeleteMapping("/{id}")
    public String deleteUser (@PathVariable Long id){
         usersService.deleteUser(id);

         return "회원 탈퇴 완료";
    }

}

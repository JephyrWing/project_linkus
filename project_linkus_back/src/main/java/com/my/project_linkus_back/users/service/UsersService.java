package com.my.project_linkus_back.users.service;


import com.my.project_linkus_back.users.dto.UsersSignupRequestDto;
import com.my.project_linkus_back.users.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class UsersService {
    private final UsersRepository usersRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public static UsersSignupRequestDto signup(UsersSignupRequestDto dto) {


    }

    //회원가입
}

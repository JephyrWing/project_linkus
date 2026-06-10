package com.my.project_linkus_back.users.service;

import com.my.project_linkus_back.users.dto.LoginDto;
import com.my.project_linkus_back.users.dto.UserResponseDto;
import com.my.project_linkus_back.users.dto.UsersSignupRequestDto;
import com.my.project_linkus_back.users.entity.Users;
import com.my.project_linkus_back.users.repository.UsersRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class UsersService {
    private final UsersRepository usersRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    //회원가입
    public UsersSignupRequestDto signup(UsersSignupRequestDto dto) {

        // 아이디 중복 검사
        if(usersRepository.existsByNickName(dto.getNickName())) {
            throw new RuntimeException("이미 존재하는 아이디입니다. ");
        }

        //닉네임 중복 검사
        if (usersRepository.existsByNickName(dto.getNickName())) {
            throw new RuntimeException("이미 존재하는 닉네임 입니다");

        }
        Users user = new Users();

        user.setUserId(dto.getUserId());

        //비밀번호 암호화
        user.setPassword(
                passwordEncoder.encode(dto.getPassword())
        );

        user.setNickName(dto.getNickName());
        user.setDateOfBirth(dto.getDateOfBirth());
        user.setGender(dto.getGender());
        user.setCallNum(dto.getCallNum());

        // 기본 레벨
        user.setLevel(1);

        usersRepository.save(user);

        return dto;
    }
    // 로그인
    public UserResponseDto login(LoginDto dto) {

        Users user = usersRepository.findByUserId(dto.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("존재하지 않는 아이디 입니다."));

        boolean matches = passwordEncoder.matches(
                dto.getPassword(),
                user.getPassword()
        );

        if(!matches) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }
        return UserResponseDto.builder()
                .Id(user.getId())
                .userId(user.getUserId())
                .nickName(user.getNickName())
                .level(user.getLevel())
                .build();
    }
    //회원탈퇴
    public void deleteUser(Long id) {

        //회원 존재 여부 확인
        Users user = usersRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(" 회원을 찾을 수 없습니다."));
        //회원삭제
        usersRepository.delete(user);
    }
}

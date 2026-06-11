package com.my.project_linkus_back.users.service;

import com.my.project_linkus_back.common.entity.UserRole;
import com.my.project_linkus_back.users.dto.*;
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
    public UsersResponseDto signup(UsersSignupRequestDto dto) {

        // 아이디 중복 검사
        if (usersRepository.existsByUserId(dto.getUserId())) {
            throw new RuntimeException("이미 존재하는 아이디입니다. ");
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

        user.setRole(UserRole.ROLE_USER);
        // 기본 레벨
        user.setLevel(1);

        usersRepository.save(user);

        return UsersResponseDto.from(user);
    }

    // 로그인
    public UsersResponseDto login(UsersLoginRequestDto dto) {

        Users user = usersRepository.findByUserId(dto.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("존재하지 않는 아이디 입니다."));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        return UsersResponseDto.from(user);
    }

    //회원정보 수정
    public UsersResponseDto updateUser(String userId, UsersUpdateRequestDto dto) {
        Users user = usersRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("회원을 찾을 수 없습니다. "));

        user.setNickName(dto.getNickName());
        user.setDateOfBirth(dto.getDateOfBirth());
        user.setGender(dto.getGender());
        user.setCallNum(dto.getCallNum());
        user.setChatCustom(dto.getChatCustom());
        user.setKakaoAccountLink(dto.getKakaoAccountLink());
        user.setGoogleAccountLink(dto.getGoogleAccountLink());

        if(dto.getCurrentPassword() != null && !dto.getNewPassword().isBlank()){
            if(!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())){
                throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
            }
        }

        if(passwordEncoder.matches(dto.getNewPassword(), user.getPassword())){
            throw new RuntimeException("기존과 동일한 비밀번호입니다.");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));

        return UsersResponseDto.from(user);
    }

    // 회원조회
    public UsersResponseDto getUser(String userId) {
        Users user = usersRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("회원을 찾을 수 없습니다."));
        return UsersResponseDto.from(user);
    }

    //회원탈퇴
    public void deleteUser(String userId) {

        //회원 존재 여부 확인
        Users user = usersRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException(" 회원을 찾을 수 없습니다."));
        //회원삭제
        usersRepository.delete(user);
    }
}

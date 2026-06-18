package com.my.project_linkus_back.users.service;

import com.my.project_linkus_back.common.entity.UserRole;
import com.my.project_linkus_back.common.exception.BadAccessException;
import com.my.project_linkus_back.common.exception.UserNotFoundException;
import com.my.project_linkus_back.common.service.CustomUserDetails;
import com.my.project_linkus_back.common.utils.AccountVerification;
import com.my.project_linkus_back.users.dto.*;
import com.my.project_linkus_back.users.entity.Users;
import com.my.project_linkus_back.users.repository.UsersRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsersService {
    private final UsersRepository usersRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // 아이디 중복 검사
    public boolean idCheck(String tempId) {
        return usersRepository.existsByUserId(tempId);
    }

    //회원가입
    @Transactional
    public UsersResponseDto signup(UsersSignupRequestDto dto) {
        Users user = new Users();
        user.setUserId(dto.getUserId());
        user.setPassword(
                passwordEncoder.encode(dto.getPassword())
        );
        user.setNickName(dto.getNickName());
        user.setDateOfBirth(dto.getDateOfBirth());
        user.setGender(dto.getGender());
        user.setCallNum(dto.getCallNum());
        user.setRole(UserRole.ROLE_USER);
        user.setLevel(1);

        usersRepository.save(user);
        return UsersResponseDto.from(user);
    }

//    // 로그인
//    public UsersResponseDto login(UsersLoginRequestDto dto) {
//        Users user = usersRepository.findByUserId(dto.getUserId())
//                .orElseThrow(() ->
//                        new RuntimeException("존재하지 않는 아이디 입니다."));
//        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
//            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
//        }
//        return UsersResponseDto.from(user);
//    }

    //회원정보 수정
    @Transactional
    public UsersResponseDto updateUser(UsersUpdateRequestDto dto) {
        Users user = usersRepository.findByUserId(dto.getUserId())
                .orElseThrow(() ->
                        new UserNotFoundException());

        // 로그인 중인 유저와 삭제를 원하는 계정이 같은 지 검증
        AccountVerification accountVerification = new AccountVerification();
        accountVerification.verfication(user.getUserId());

        user.setNickName(dto.getNickName());
        user.setDateOfBirth(dto.getDateOfBirth());
        user.setGender(dto.getGender());
        user.setCallNum(dto.getCallNum());
        user.setChatCustom(dto.getChatCustom());
        user.setKakaoAccountLink(dto.getKakaoAccountLink());
        user.setGoogleAccountLink(dto.getGoogleAccountLink());
        if (passwordEncoder.matches(dto.getNewPassword(), user.getPassword())) {
            throw new BadAccessException("기존과 동일한 비밀번호입니다.");
        }
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));

        return UsersResponseDto.from(user);
    }

    // 회원조회
    public UsersResponseDto getUser(String userId) {
        Users user = usersRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new UserNotFoundException());
        return UsersResponseDto.from(user);
    }

    //회원탈퇴
    @Transactional
    public void deleteUser(String userId) {
        Users user = usersRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new UserNotFoundException());


        // 로그인 중인 유저와 삭제를 원하는 계정이 같은 지 검증
        AccountVerification accountVerification = new AccountVerification();
        accountVerification.verfication(userId);

        usersRepository.delete(user);
    }

    // 전체 회원 조회
    public List<UsersResponseDto> findAll() {
        return usersRepository.findAll().stream().map(x -> UsersResponseDto.from(x)).toList();
    }
}

package com.my.project_linkus_back.common.utils;

import com.my.project_linkus_back.common.entity.UserRole;
import com.my.project_linkus_back.common.exception.BadAccessException;
import com.my.project_linkus_back.common.service.CustomUserDetails;
import com.my.project_linkus_back.users.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

// 정보 수정을 요청하는 유저 ID와 현재 토큰 상의 유저 ID를 비교 검증
@RequiredArgsConstructor
public class AccountVerification {
    private final UsersRepository usersRepository;

    public void verfication(String requestUserId) {
        // 현재 로그인 중인 유저 정보 확인
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();
        String currentUserId = userDetails.getUserId();
        UserRole role = usersRepository.findRoleByUserId(currentUserId).orElseThrow(() -> new BadAccessException("계정의 권한 조회 불가");

        // 관리자는 패스
        if (role == UserRole.ROLE_ADMIN) {
            return;
        }

        // 로그인 중인 유저와 삭제를 원하는 계정이 같은 지 검증
        if (currentUserId != requestUserId) {
            throw new BadAccessException("잘못된 접근입니다.");
        }
    }

}

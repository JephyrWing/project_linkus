package com.my.project_linkus_back.common.utils;

import com.my.project_linkus_back.common.exception.BadAccessException;
import com.my.project_linkus_back.common.service.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

// 정보 수정을 요청하는 유저 ID와 현재 토큰 상의 유저 ID를 비교 검증
public class AccountVerification {
    public void verfication(String requestUserId) {
        // 현재 로그인 중인 유저 정보 확인
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();
        String currentUserId = userDetails.getUserId();

        // 로그인 중인 유저와 삭제를 원하는 계정이 같은 지 검증
        if (!currentUserId.equals(requestUserId)) {
            throw new BadAccessException("잘못된 접근입니다.");
        }
    }

}

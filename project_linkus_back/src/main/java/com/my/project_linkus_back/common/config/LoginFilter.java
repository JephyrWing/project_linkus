package com.my.project_linkus_back.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.my.project_linkus_back.common.dto.LoginRequest;
import com.my.project_linkus_back.common.entity.UserRole;
import com.my.project_linkus_back.common.service.CustomUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;

// 사용자가 로그인 요청 후에 url에 도착하기 전에 가로채는 필터
@RequiredArgsConstructor
public class LoginFilter extends UsernamePasswordAuthenticationFilter {
    private final AuthenticationManager authenticationManager;
    private final JWTUtil jwtUtil;

    @Override
    // 로그인 정보(이메일, pw : request로 들어옴)
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        try {
            // JSON으로 들어오는 email, password를 뽑아내는 작업
            ObjectMapper objectMapper = new ObjectMapper();
            LoginRequest loginRequest = objectMapper.readValue(
                    request.getInputStream(), LoginRequest.class
            );
            String userId = loginRequest.getUserId();
            String password = loginRequest.getPassword();
            System.out.println("===============================" + userId);
            // 스프링 시큐리티에 username(email), password 검증을 위해 토큰에 담아보냄
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userId, password, null);
            // 토큰에 담겨있는 자료를 검증하기 위해 매니저에게 보냄
            return authenticationManager.authenticate(authToken);
        } catch(IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    // 로그인 성공 시 토큰 발급
    protected void successfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain,
                                            Authentication authentication) throws IOException, ServletException {
        System.out.println("Success");

        //UserDetails
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();

        String userId = customUserDetails.getUserId();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();

        String role = auth.getAuthority();
        // 현재 36초로 셋팅
        // 이후에
        // public static final long ACCESS_TOKEN_EXPIRE = 1000L * 60 * 30; // 30분
        // String token = jwtUtil.createJwt(userEmail, role, ACCESS_TOKEN_EXPIRE);
        String token = jwtUtil.createJwt(userId, role, 1000L * 60 * 30);
        System.out.println("===============");
        System.out.println("생성된 토큰");
        System.out.println(token);
        System.out.println("===============");

        response.addHeader("Authorization", "Bearer " + token);
    }

    @Override
    // 로그인 실패시 처리
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException, ServletException {
        System.out.println("Fail!");
        // 로그인 실패시 401 코드 반환
        response.setStatus(401);
    }
}

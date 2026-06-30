package com.my.project_linkus_back.common.config;

import com.my.project_linkus_back.common.jwt.JWTFilter;
import com.my.project_linkus_back.common.jwt.JWTUtil;
import com.my.project_linkus_back.common.jwt.LoginFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final AuthenticationConfiguration authenticationConfiguration;
    // 토큰 유틸리티 가져오기
    private final JWTUtil jwtUtil;

    public SecurityConfig(AuthenticationConfiguration authenticationConfiguration, JWTUtil jwtUtil) {
        this.authenticationConfiguration = authenticationConfiguration;
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // csrf 대비 토큰 끄기
        http.csrf((auth) -> auth.disable());

        // Form Login 방식 끄기
        http.formLogin((auth) -> auth.disable());

        // http basic 인증방식 끄기
        http.httpBasic((auth) -> auth.disable());

        http.anonymous((anonymous) -> anonymous
                .principal("anonymousUser")
                .authorities("ROLE_ANONYMOUS")
        );

        http.authorizeHttpRequests((auth) ->
                auth.requestMatchers("/", "/api/users/login", "/api/users/oauth/kakao", "/api/users/oauth/google", "/api/users/signup", "/api/users/signup/idconfirm/*", "/api/users/signup/emailconfirm/*", "/api/chats", "/api/chats/*", "/error").permitAll()
                        .requestMatchers("/api/posts/*", "/api/users/*", "/api/posts", "/api/users", "/api/reports").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/admin", "/api/admin/*").hasRole("ADMIN")
                        .anyRequest().authenticated());

        // 들어오는  컨트롤러 요청 다음에 인증이 되면 토큰이 있는지 확인 작업하는 필터 실행
        http.addFilterBefore(new JWTFilter(jwtUtil), LoginFilter.class);

        //각 url에 들어갈지 말지 필터 후에 이메일과 패스워드 분리 작업과 토큰 생성 작업
        // 출입증 생성 이후에 jwt 토큰 생성 유틸리티를 쓸 수 있도록 지정
        http.addFilterAt(new LoginFilter(
                        authenticationManager(authenticationConfiguration), jwtUtil
                ),
                UsernamePasswordAuthenticationFilter.class);

        // Stateless 세션 설정
        http.sessionManagement((session) ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );

        // cors 설정 - security가 있을 땐 언제나 security config에 설정
        http
                .cors(cors -> cors.configurationSource(request -> {

                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(
                            List.of("http://localhost:3000")
                    );
                    config.setAllowedMethods(
                            List.of("*")
                    );
                    config.setAllowedHeaders(
                            List.of("*")
                    );
                    config.setExposedHeaders(
                            List.of("Authorization")
                    );
                    config.setAllowCredentials(true);
                    return config;
                }));

        return http.build();
    }
}

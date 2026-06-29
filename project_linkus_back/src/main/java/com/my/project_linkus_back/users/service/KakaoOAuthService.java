package com.my.project_linkus_back.users.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.my.project_linkus_back.common.entity.UserRole;
import com.my.project_linkus_back.common.exception.BadAccessException;
import com.my.project_linkus_back.common.jwt.JWTUtil;
import com.my.project_linkus_back.users.dto.KakaoLoginRequestDto;
import com.my.project_linkus_back.users.dto.OAuthLoginResponseDto;
import com.my.project_linkus_back.users.entity.Users;
import com.my.project_linkus_back.users.repository.UsersRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KakaoOAuthService {
    private static final long ACCESS_TOKEN_EXPIRE_MS = 1000L * 60 * 60 * 24 * 7;

    private final UsersRepository usersRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil;

    @Value("${kakao.oauth.rest-api-key}")
    private String restApiKey;

    @Value("${kakao.oauth.client-secret:}")
    private String clientSecret;

    @Value("${kakao.oauth.redirect-uri}")
    private String configuredRedirectUri;

    private final RestClient restClient = RestClient.create();

    @Transactional
    public OAuthLoginResponseDto login(KakaoLoginRequestDto dto) {
        validateConfiguration(dto.getRedirectUri());

        try {
            KakaoTokenResponse token = requestToken(dto.getCode());
            if (token == null || token.accessToken() == null) {
                throw new BadAccessException("카카오 액세스 토큰을 발급받지 못했습니다.");
            }

            KakaoUserResponse kakaoUser = requestUser(token.accessToken());
            if (kakaoUser == null || kakaoUser.id() == null) {
                throw new BadAccessException("카카오 사용자 정보를 확인하지 못했습니다.");
            }

            Users user = findOrCreateUser(kakaoUser);
            String jwt = jwtUtil.createJwt(user.getUserId(), user.getRole().name(), ACCESS_TOKEN_EXPIRE_MS);
            return new OAuthLoginResponseDto("Bearer " + jwt, user.getUserId(), user.getRole());
        } catch (BadAccessException e) {
            throw e;
        } catch (RestClientException e) {
            throw new BadAccessException("카카오 로그인 요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    private KakaoTokenResponse requestToken(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", restApiKey);
        form.add("redirect_uri", configuredRedirectUri);
        form.add("code", code);
        if (clientSecret != null && !clientSecret.isBlank()) {
            form.add("client_secret", clientSecret);
        }

        return restClient.post()
                .uri("https://kauth.kakao.com/oauth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(KakaoTokenResponse.class);
    }

    private KakaoUserResponse requestUser(String accessToken) {
        return restClient.get()
                .uri("https://kapi.kakao.com/v2/user/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(KakaoUserResponse.class);
    }

    private Users findOrCreateUser(KakaoUserResponse kakaoUser) {
        String kakaoId = kakaoUser.id().toString();
        return usersRepository.findByKakaoAccountLink(kakaoId)
                .orElseGet(() -> linkOrCreateUser(kakaoUser, kakaoId));
    }

    private Users linkOrCreateUser(KakaoUserResponse kakaoUser, String kakaoId) {
        KakaoAccount account = kakaoUser.kakaoAccount();
        String email = verifiedEmail(account);

        if (email != null) {
            Users existingUser = usersRepository.findByEmail(email).orElse(null);
            if (existingUser != null) {
                if (existingUser.getKakaoAccountLink() != null
                        && !existingUser.getKakaoAccountLink().equals(kakaoId)) {
                    throw new BadAccessException("이미 다른 카카오 계정과 연결된 회원입니다.");
                }
                existingUser.setKakaoAccountLink(kakaoId);
                return existingUser;
            }
        }

        Users user = new Users();
        user.setUserId(uniqueUserId("kakao_" + kakaoId));
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setEmail(email != null ? email : "kakao_" + kakaoId + "@social.linkus.local");
        user.setRole(UserRole.ROLE_USER);
        user.setLevel(1);
        user.setKakaoAccountLink(kakaoId);
        return usersRepository.save(user);
    }

    private String verifiedEmail(KakaoAccount account) {
        if (account == null || account.email() == null
                || !Boolean.TRUE.equals(account.emailValid())
                || !Boolean.TRUE.equals(account.emailVerified())) {
            return null;
        }
        return account.email().trim().toLowerCase();
    }

    private String uniqueUserId(String baseUserId) {
        String userId = baseUserId;
        int suffix = 1;
        while (usersRepository.existsByUserId(userId)) {
            userId = baseUserId + "_" + suffix++;
        }
        return userId;
    }

    private void validateConfiguration(String redirectUri) {
        if (restApiKey == null || restApiKey.isBlank()) {
            throw new BadAccessException("서버에 KAKAO_REST_API_KEY가 설정되지 않았습니다.");
        }
        if (!configuredRedirectUri.equals(redirectUri)) {
            throw new BadAccessException("등록되지 않은 카카오 로그인 리다이렉트 URI입니다.");
        }
    }

    private record KakaoTokenResponse(@JsonProperty("access_token") String accessToken) {}

    private record KakaoUserResponse(Long id,
                                     @JsonProperty("kakao_account") KakaoAccount kakaoAccount) {}

    private record KakaoAccount(String email,
                                @JsonProperty("is_email_valid") Boolean emailValid,
                                @JsonProperty("is_email_verified") Boolean emailVerified) {}
}

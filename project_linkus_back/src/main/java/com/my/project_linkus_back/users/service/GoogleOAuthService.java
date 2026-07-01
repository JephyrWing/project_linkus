package com.my.project_linkus_back.users.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.my.project_linkus_back.common.entity.UserRole;
import com.my.project_linkus_back.common.exception.BadAccessException;
import com.my.project_linkus_back.common.jwt.JWTUtil;
import com.my.project_linkus_back.users.dto.GoogleLoginRequestDto;
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
public class GoogleOAuthService {
    private static final long ACCESS_TOKEN_EXPIRE_MS = 1000L * 60 * 60 * 24 * 7;

    private final UsersRepository usersRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil;

    @Value("${google.oauth.client-id}")
    private String clientId;

    @Value("${google.oauth.client-secret}")
    private String clientSecret;

    @Value("${google.oauth.redirect-uri}")
    private String configuredRedirectUri;

    private final RestClient restClient = RestClient.create();

    @Transactional
    public OAuthLoginResponseDto login(GoogleLoginRequestDto dto) {
        validateConfiguration(dto.getRedirectUri());

        try {
            GoogleTokenResponse token = requestToken(dto.getCode());
            if (token == null || token.accessToken() == null) {
                throw new BadAccessException("구글 액세스 토큰을 발급받지 못했습니다.");
            }

            GoogleUserResponse googleUser = requestUser(token.accessToken());
            if (googleUser == null || googleUser.sub() == null || googleUser.sub().isBlank()) {
                throw new BadAccessException("구글 사용자 정보를 확인하지 못했습니다.");
            }

            Users user = findOrCreateUser(googleUser);
            ensureNickName(user);
            String jwt = jwtUtil.createJwt(user.getUserId(), user.getRole().name(), ACCESS_TOKEN_EXPIRE_MS);
            return new OAuthLoginResponseDto("Bearer " + jwt, user.getUserId(), user.getNickName(), user.getRole());
        } catch (BadAccessException e) {
            throw e;
        } catch (RestClientException e) {
            throw new BadAccessException("구글 로그인 요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    private GoogleTokenResponse requestToken(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", configuredRedirectUri);
        form.add("code", code);

        return restClient.post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(GoogleTokenResponse.class);
    }

    private GoogleUserResponse requestUser(String accessToken) {
        return restClient.get()
                .uri("https://openidconnect.googleapis.com/v1/userinfo")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(GoogleUserResponse.class);
    }

    private Users findOrCreateUser(GoogleUserResponse googleUser) {
        return usersRepository.findByGoogleAccountLink(googleUser.sub())
                .orElseGet(() -> linkOrCreateUser(googleUser));
    }

    private Users linkOrCreateUser(GoogleUserResponse googleUser) {
        String email = verifiedEmail(googleUser);

        if (email != null) {
            Users existingUser = usersRepository.findByEmail(email).orElse(null);
            if (existingUser != null) {
                if (existingUser.getGoogleAccountLink() != null
                        && !existingUser.getGoogleAccountLink().equals(googleUser.sub())) {
                    throw new BadAccessException("이미 다른 구글 계정과 연결된 회원입니다.");
                }
                existingUser.setGoogleAccountLink(googleUser.sub());
                return existingUser;
            }
        }

        Users user = new Users();
        String userId = uniqueUserId("google_" + googleUser.sub());
        user.setUserId(userId);
        user.setNickName(userId);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setEmail(email != null ? email : "google_" + googleUser.sub() + "@social.linkus.local");
        user.setRole(UserRole.ROLE_USER);
        user.setLevel(1);
        user.setGoogleAccountLink(googleUser.sub());
        return usersRepository.save(user);
    }

    private String verifiedEmail(GoogleUserResponse googleUser) {
        if (googleUser.email() == null || !Boolean.TRUE.equals(googleUser.emailVerified())) {
            return null;
        }
        return googleUser.email().trim().toLowerCase();
    }

    private String uniqueUserId(String baseUserId) {
        String userId = baseUserId;
        int suffix = 1;
        while (usersRepository.existsByUserId(userId)) {
            userId = baseUserId + "_" + suffix++;
        }
        return userId;
    }

    private void ensureNickName(Users user) {
        if (user.getNickName() == null || user.getNickName().isBlank()) {
            user.setNickName(user.getUserId());
        }
    }

    private void validateConfiguration(String redirectUri) {
        if (clientId == null || clientId.isBlank()) {
            throw new BadAccessException("서버에 GOOGLE_CLIENT_ID가 설정되지 않았습니다.");
        }
        if (clientSecret == null || clientSecret.isBlank()) {
            throw new BadAccessException("서버에 GOOGLE_CLIENT_SECRET이 설정되지 않았습니다.");
        }
        if (!configuredRedirectUri.equals(redirectUri)) {
            throw new BadAccessException("등록되지 않은 구글 로그인 리다이렉트 URI입니다.");
        }
    }

    private record GoogleTokenResponse(@JsonProperty("access_token") String accessToken) {}

    private record GoogleUserResponse(String sub,
                                      String email,
                                      @JsonProperty("email_verified") Boolean emailVerified) {}
}

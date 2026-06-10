package com.my.project_linkus_back.common.config;

import com.my.project_linkus_back.common.entity.UserRole;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JWTUtil {
    private SecretKey secretKey;

    public JWTUtil(@Value("${spring.jwt.secret}")String secret) {
        secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),
                Jwts.SIG.HS256.key().build().getAlgorithm());
    }

    public String getUserId(String token) {
        return Jwts.parser().verifyWith(secretKey).build().
                parseSignedClaims(token).getPayload().get("userId", String.class);
    }

    public UserRole getRole(String token) {
        return Jwts.parser().verifyWith(secretKey).build().
                parseSignedClaims(token).getPayload().get("role", UserRole.class);
    }

    public boolean isExpired(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);

            return false;

        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    public String createJwt(String userId, String role, Long expiredMs) {
        return Jwts.builder()
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(new Date(System.currentTimeMillis())) //토큰 생성 시각
                .expiration(new Date(System.currentTimeMillis() + expiredMs)) // 토큰 만료 시간
                .signWith(secretKey)
                .compact();
    }
}

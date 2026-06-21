package com.my.project_linkus_back.bans.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

import java.util.concurrent.TimeUnit;

@Getter
@Setter
@RedisHash(value = "ban") // key 값의 id 앞에 들어가는 거
public class RedisBans {
    @Id // 패키지 주의: org.springframework.data.annotation.Id
    private String id; // redis의 key는 String으로 다루는 것이 좋다, bans 테이블의 Id를 그대로 받아 사용

    private String reason;

    private String userId;

    private String ip;

    private String createdAt;

    @TimeToLive(unit = TimeUnit.HOURS) // 밴은 시간단위 설정
    private Long ttl;
}

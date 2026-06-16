package com.my.project_linkus_back.chats.entity;

import lombok.AllArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;
import lombok.Getter;

@Getter
@Setter
@RedisHash(value = "globalChat") // key 값의 id 앞에 들어가는 거
public class RedisChats {

    @Id // 패키지 주의: org.springframework.data.annotation.Id
    private String id; // redis의 key는 String으로 다루는 것이 좋다

    private String userId;
    private String ip;
    private String text;
    private Double latitude;
    private Double longitude;

    @TimeToLive
    private Long ttl = 60L; // 1분간 유지(초 단위)
}

package com.my.project_linkus_back.bans.dto;

import com.my.project_linkus_back.bans.entity.RedisBans;
import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public class BansRedisResponseDto {
    private String banId;
    private String userId;
    private String reason;
    private String ip;
    private Long ttl;
    private String CreatedAt;

    public static BansRedisResponseDto toDto(RedisBans redisBans) {
        return new BansRedisResponseDto(redisBans.getId(), redisBans.getUserId(),
                redisBans.getReason(), redisBans.getIp(),
                redisBans.getTtl(), redisBans.getCreatedAt());
    }
}

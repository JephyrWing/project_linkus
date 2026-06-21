package com.my.project_linkus_back.bans.dto;

import com.my.project_linkus_back.bans.entity.Bans;
import com.my.project_linkus_back.bans.entity.RedisBans;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class BansResponseDto {
    private Long banId;
    private String userId;
    private String reason;
    private String ip;
    private Long ttl;
    private LocalDateTime CreatedAt;

    public static BansResponseDto toDto(Bans bans) {
        String userId = null;
        if (bans.getUser() != null) {
            userId = bans.getUser().getUserId();
        }
        return new BansResponseDto(bans.getId(), userId,
                bans.getReason(), bans.getIp(),
                bans.getTtl(), bans.getCreatedAt());
    }
}

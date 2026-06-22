package com.my.project_linkus_back.bans.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BansRequestDto {
    private String reason;
    private String userId;
    private String ip;
    private Long ttl;
}

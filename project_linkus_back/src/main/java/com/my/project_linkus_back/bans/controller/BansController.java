package com.my.project_linkus_back.bans.controller;

import com.my.project_linkus_back.bans.dto.BansRedisResponseDto;
import com.my.project_linkus_back.bans.dto.BansRequestDto;
import com.my.project_linkus_back.bans.dto.BansResponseDto;
import com.my.project_linkus_back.bans.service.BansService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bans")
@RequiredArgsConstructor
public class BansController {
    private final BansService bansService;

    // 특정 유저 또는 ip 밴
    @PostMapping
    public String userBan(@RequestBody BansRequestDto dto) {
        bansService.saveBan(dto);
        return "저장되었습니다.";
    }

    // 현재 밴 상태인 목록 조회
    @GetMapping
    public List<BansRedisResponseDto> currentBanList() {
        return bansService.redisFindAll();
    }

    // 밴 상태 풀어주기 (redis에서만 삭제)
    @DeleteMapping("/{banId}")
    public String deleteRedisBan(@PathVariable String banId) {
        bansService.deleteBan(banId);
        return "처리되었습니다.";
    }

    // 모든 밴 내역 불러오기
    @GetMapping("/findall")
    public List<BansResponseDto> findBansAll() {
        return bansService.mysqlFindAll();
    }

    // 유저별 밴 내역 불러오기
    @GetMapping("/{userId}")
    public List<BansResponseDto> findUserBans(@PathVariable String userId) {
        return bansService.mysqlFindByUserId(userId);
    }
}

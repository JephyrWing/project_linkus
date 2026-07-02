package com.my.project_linkus_back.bans.controller;

import com.my.project_linkus_back.bans.dto.BansRedisResponseDto;
import com.my.project_linkus_back.bans.dto.BansRequestDto;
import com.my.project_linkus_back.bans.dto.BansResponseDto;
import com.my.project_linkus_back.bans.service.BansService;
import com.my.project_linkus_back.common.dto.PageResponse;
import com.my.project_linkus_back.posts.dto.PostResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
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
    public PageResponse<BansRedisResponseDto> currentBanList(@RequestParam(name = "page", defaultValue = "0") int page,
                                                             @RequestParam(name = "size", defaultValue = "10") int size) {
        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        List<BansRedisResponseDto> results = bansService.redisFindAll();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<BansRedisResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<BansRedisResponseDto> resultpage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultpage);
    }

    // 밴 상태 풀어주기 (redis에서만 삭제)
    @DeleteMapping("/{userId}")
    public String deleteRedisBan(@PathVariable String userId) {
        bansService.deleteBanByUserId(userId);
        return "처리되었습니다.";
    }

    // 모든 밴 내역 불러오기
    @GetMapping("/findall")
    public PageResponse<BansResponseDto> findBansAll(@RequestParam(name = "page", defaultValue = "0") int page,
                                                     @RequestParam(name = "size", defaultValue = "10") int size) {
        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        List<BansResponseDto> results = bansService.mysqlFindAll();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<BansResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<BansResponseDto> resultpage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultpage);
    }

    // 유저별 밴 내역 불러오기
    @GetMapping("/{userId}")
    public PageResponse<BansResponseDto> findUserBans(@PathVariable String userId,
                                                      @RequestParam(name = "page", defaultValue = "0") int page,
                                                      @RequestParam(name = "size", defaultValue = "10") int size) {
        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        List<BansResponseDto> results = bansService.mysqlFindByUserId(userId);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<BansResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<BansResponseDto> resultpage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultpage);
    }
}

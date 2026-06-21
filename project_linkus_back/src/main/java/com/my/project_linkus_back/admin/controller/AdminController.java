package com.my.project_linkus_back.admin.controller;

import com.my.project_linkus_back.bans.dto.BansRedisResponseDto;
import com.my.project_linkus_back.bans.dto.BansRequestDto;
import com.my.project_linkus_back.bans.dto.BansResponseDto;
import com.my.project_linkus_back.bans.service.BansService;
import com.my.project_linkus_back.chats.dto.ChatResponseDto;
import com.my.project_linkus_back.chats.service.ChatsService;
import com.my.project_linkus_back.posts.dto.PostResponseDto;
import com.my.project_linkus_back.posts.service.PostService;
import com.my.project_linkus_back.reports.dto.ReportResponseDto;
import com.my.project_linkus_back.reports.service.ReportService;
import com.my.project_linkus_back.users.dto.UsersResponseDto;
import com.my.project_linkus_back.users.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final ChatsService chatsService;
    private final PostService postService;
    private final UsersService usersService;
    private final ReportService reportService;
    private final BansService bansService;

    // 전체 게시글 조회
    @GetMapping("/posts/findall")
    public List<PostResponseDto> findPostsAll() {
        return postService.findAll();
    }

    // 전체 유저 조회
    @GetMapping("/users/findall")
    public List<UsersResponseDto> findUsersAll() {
        return usersService.findAll();
    }

    // 전체 채팅 조회
    @GetMapping("/chats/findall")
    public List<ChatResponseDto> findChatsAll() {
        return chatsService.findAll();
    }

    // 전체 신고 조회
    @GetMapping("/reports/findall")
    public List<ReportResponseDto> getAllReports() {
        return reportService.getAllReports();
    }

    // 게시글 신고만 조회
    @GetMapping("/reports/posts")
    public List<ReportResponseDto> getPostReports() {
        return reportService.getPostReport();
    }

    // 채팅 신고만 조회
    @GetMapping("/reports/chats")
    public List<ReportResponseDto> getChatReports() {
        return reportService.getChatReports();
    }

    // 특정 유저 또는 ip 밴
    @PostMapping("/bans")
    public String userBan(@RequestBody BansRequestDto dto) {
        bansService.saveBan(dto);
        return "저장되었습니다.";
    }

    // 현재 밴 상태인 목록 조회
    @GetMapping("/bans")
    public List<BansRedisResponseDto> currentBanList() {
        return bansService.redisFindAll();
    }

    // 밴 상태 풀어주기 (redis에서만 삭제)
    @DeleteMapping("/bans/{banId}")
    public String deleteRedisBan(@PathVariable String banId) {
        bansService.deleteBan(banId);
        return "처리되었습니다.";
    }

    // 모든 밴 내역 불러오기
    @GetMapping("/bans/findall")
    public List<BansResponseDto> findBansAll() {
        return bansService.mysqlFindAll();
    }

    // 유저별 밴 내역 불러오기
    @GetMapping("/bans/{userId}")
    public List<BansResponseDto> findUserBans(@PathVariable String userId) {
        return bansService.mysqlFindByUserId(userId);
    }
}

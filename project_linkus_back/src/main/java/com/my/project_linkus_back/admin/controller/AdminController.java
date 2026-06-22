package com.my.project_linkus_back.admin.controller;

import com.my.project_linkus_back.bans.service.BansService;
import com.my.project_linkus_back.chats.dto.ChatResponseDto;
import com.my.project_linkus_back.chats.service.ChatsService;
import com.my.project_linkus_back.posts.dto.PostDeleteDto;
import com.my.project_linkus_back.posts.dto.PostResponseDto;
import com.my.project_linkus_back.posts.service.PostService;
import com.my.project_linkus_back.reports.dto.ReportResponseDto;
import com.my.project_linkus_back.reports.service.ReportService;
import com.my.project_linkus_back.users.dto.UsersResponseDto;
import com.my.project_linkus_back.users.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    // 신고 게시글 삭제 처리
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deleteReportsPost(@PathVariable PostDeleteDto dto){
        postService.delete(dto);
        return ResponseEntity.ok().build();
    }
}

package com.my.project_linkus_back.admin.controller;

import com.my.project_linkus_back.bans.service.BansService;
import com.my.project_linkus_back.chats.dto.ChatResponseDto;
import com.my.project_linkus_back.chats.service.ChatsService;
import com.my.project_linkus_back.common.dto.PageResponse;
import com.my.project_linkus_back.posts.dto.PostDeleteDto;
import com.my.project_linkus_back.posts.dto.PostResponseDto;
import com.my.project_linkus_back.posts.service.PostService;
import com.my.project_linkus_back.reports.dto.ReportResponseDto;
import com.my.project_linkus_back.reports.entity.Reports;
import com.my.project_linkus_back.reports.repository.ReportRepository;
import com.my.project_linkus_back.reports.service.ReportService;
import com.my.project_linkus_back.users.dto.UsersResponseDto;
import com.my.project_linkus_back.users.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final ChatsService chatsService;
    private final PostService postService;
    private final UsersService usersService;
    private final ReportService reportService;


    // 전체 게시글 조회
    @GetMapping("/posts/findall")
    public PageResponse<PostResponseDto> findPostsAll(@RequestParam(name = "page", defaultValue = "0") int page,
                                                      @RequestParam(name = "size", defaultValue = "10") int size) {
        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        List<PostResponseDto> results = postService.findAll();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<PostResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<PostResponseDto> resultpage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultpage);
    }

    // 전체 유저 조회
    @GetMapping("/users/findall")
    public PageResponse<UsersResponseDto> findUsersAll(@RequestParam(name = "page", defaultValue = "0") int page,
                                                       @RequestParam(name = "size", defaultValue = "10") int size) {
        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        List<UsersResponseDto> results = usersService.findAll();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<UsersResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<UsersResponseDto> resultpage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultpage);
    }


    // 관리자 페이지용 특정 회원 상세 정보 조회
    @GetMapping("/users/info/{userId}")
    public ResponseEntity<UsersResponseDto> getUserInfo(@PathVariable String userId) {
        return ResponseEntity.ok(usersService.getAdminUserDetail(userId));
    }

    // 전체 채팅 조회
    @GetMapping("/chats/findall")
    public PageResponse<ChatResponseDto> findChatsAll(@RequestParam(name = "page", defaultValue = "0") int page,
                                                      @RequestParam(name = "size", defaultValue = "10") int size) {
        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        List<ChatResponseDto> results = chatsService.findAll();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<ChatResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<ChatResponseDto> resultpage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultpage);
    }

    // 전체 신고 조회
    @GetMapping("/reports/findall")
    public PageResponse<ReportResponseDto> getAllReports(@RequestParam(name = "page", defaultValue = "0") int page,
                                                         @RequestParam(name = "size", defaultValue = "10") int size) {
        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        List<ReportResponseDto> results = reportService.getAllReports();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<ReportResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<ReportResponseDto> resultpage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultpage);
    }

    // 게시글 신고만 조회
    @GetMapping("/reports/posts")
    public PageResponse<ReportResponseDto> getPostReports(@RequestParam(name = "page", defaultValue = "0") int page,
                                                          @RequestParam(name = "size", defaultValue = "10") int size) {
        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        List<ReportResponseDto> results = reportService.getPostReports();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<ReportResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<ReportResponseDto> resultpage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultpage);
    }

    // 채팅 신고만 조회
    @GetMapping("/reports/chats")
    public PageResponse<ReportResponseDto> getChatReports(@RequestParam(name = "page", defaultValue = "0") int page,
                                                          @RequestParam(name = "size", defaultValue = "10") int size) {
        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        List<ReportResponseDto> results = reportService.getChatReports();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<ReportResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<ReportResponseDto> resultpage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultpage);
    }

    // 미처리한 신고만 조회
    @GetMapping("/reports/unprocessed")
    public PageResponse<ReportResponseDto> getReportsFalse(@RequestParam(name = "page", defaultValue = "0") int page,
                                                           @RequestParam(name = "size", defaultValue = "10") int size) {
        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        List<ReportResponseDto> results = reportService.getFalseProcessed();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<ReportResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<ReportResponseDto> resultpage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultpage);
    }

    // 처리한 신고만 조회
    @GetMapping("/reports/processed")
    public PageResponse<ReportResponseDto> getReportsTrue(@RequestParam(name = "page", defaultValue = "0") int page,
                                                           @RequestParam(name = "size", defaultValue = "10") int size) {
        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        List<ReportResponseDto> results = reportService.getTrueProcessed();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<ReportResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<ReportResponseDto> resultpage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultpage);
    }

    // 게시글 작성자 ID 조회
    @GetMapping("/posts/author/{postId}")
    public ResponseEntity<String> getPostAuthor(@PathVariable Long postId) {
        String authorId = postService.getAuthorId(postId);
        return ResponseEntity.ok(authorId);
    }

    // 채팅 작성자 ID 조회
    @GetMapping("/chats/author/{chatId}")
    public ResponseEntity<String> getChatAuthor(@PathVariable Long chatId) {
        String authorId = chatsService.getAuthorId(chatId);
        return ResponseEntity.ok(authorId);
    }

    // 신고 처리 processed를 변경 false <-> true
    @PutMapping("/reports/{reportId}")
    public void changeReportState(@PathVariable Long reportId) {
        reportService.processedCheck(reportId);
    }
}

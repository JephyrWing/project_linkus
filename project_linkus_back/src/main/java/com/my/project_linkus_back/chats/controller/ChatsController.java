package com.my.project_linkus_back.chats.controller;

import com.my.project_linkus_back.bans.service.BansService;
import com.my.project_linkus_back.chats.dto.ChatCreateRequestDto;
import com.my.project_linkus_back.chats.dto.ChatResponseDto;
import com.my.project_linkus_back.chats.dto.ChatSearchRequestDto;
import com.my.project_linkus_back.chats.dto.RedisResponseDto;
import com.my.project_linkus_back.chats.service.ChatsRedisService;
import com.my.project_linkus_back.chats.service.ChatsService;
import com.my.project_linkus_back.common.dto.PageResponse;
import com.my.project_linkus_back.filters.service.FilterService;
import com.my.project_linkus_back.posts.dto.PostResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatsController {
    private final ChatsService chatsService;
    private final ChatsRedisService chatsRedisService;
    private final FilterService filterService;

    // 채팅 저장
    @PostMapping("/upload")
    public List<RedisResponseDto> createChat(@RequestBody ChatCreateRequestDto dto, HttpServletRequest request) {
        // 들어온 채팅 필터링
        dto.setText(filterService.filterAndReplace(dto.getText()));
        chatsService.createChat(dto, request);
        return chatsRedisService.searchChats(dto.getLongitude(), dto.getLatitude());
    }

    // 현 위치 반경 5km 내의 채팅 검색
    @PostMapping
    public List<RedisResponseDto> searchAround5Km(@RequestBody ChatSearchRequestDto dto) {
        return chatsRedisService.searchChats(dto.getLongitude(), dto.getLatitude());
    }

    // 특정 유저 채팅 모아보기
    @GetMapping("/user/{userId}")
    public PageResponse<ChatResponseDto> userChats(
            @PathVariable String userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {


        List<ChatResponseDto> results = chatsService.userChats(userId);

        // 페이징 작업
        Pageable pageable = PageRequest.of(page, size);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        // 만약 시작 위치가 전체 크기보다 크다면 빈 리스트를 반환
        List<ChatResponseDto> subList = (start > results.size()) ? Collections.emptyList() : results.subList(start, end);
        // PageImpl(하위 리스트, pageable 정보, 전체 리스트 크기)로 Page 객체를 생성해 반환
        Page<ChatResponseDto> resultPage = new PageImpl<>(subList, pageable, results.size());

        return new PageResponse<>(resultPage);
    }

    // 채팅 IP 가져오기
    @GetMapping("/admin/author-info/{chatId}")
    public ResponseEntity<Map<String, String>> getChatAuthorInfo(@PathVariable Long chatId) {
        return ResponseEntity.ok(chatsService.getAuthorInfo(chatId));
    }
}

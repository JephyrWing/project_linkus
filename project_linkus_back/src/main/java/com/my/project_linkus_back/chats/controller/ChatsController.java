package com.my.project_linkus_back.chats.controller;

import com.my.project_linkus_back.bans.service.BansService;
import com.my.project_linkus_back.chats.dto.ChatCreateRequestDto;
import com.my.project_linkus_back.chats.dto.ChatResponseDto;
import com.my.project_linkus_back.chats.dto.ChatSearchRequestDto;
import com.my.project_linkus_back.chats.dto.RedisResponseDto;
import com.my.project_linkus_back.chats.service.ChatsRedisService;
import com.my.project_linkus_back.chats.service.ChatsService;
import com.my.project_linkus_back.filters.service.FilterService;
import com.my.project_linkus_back.posts.dto.PostResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @GetMapping("/{chatId}")
    public List<ChatResponseDto> userChats(@PathVariable String userId) {
        return chatsService.userChats(userId);
    }
}

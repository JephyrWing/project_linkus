package com.my.project_linkus_back.chats.controller;

import com.my.project_linkus_back.chats.dto.ChatCreateRequestDto;
import com.my.project_linkus_back.chats.dto.ChatResponseDto;
import com.my.project_linkus_back.chats.service.ChatsService;
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

    //채팅 저장
    @PostMapping("/upload")
    public ChatResponseDto createChat(@RequestBody ChatCreateRequestDto dto, HttpServletRequest request){
        return chatsService.createChat(dto, request);
    }

    // 전채 조회
    @GetMapping
    public List<ChatResponseDto> findAll() {
        return chatsService.findAll();
    }
}

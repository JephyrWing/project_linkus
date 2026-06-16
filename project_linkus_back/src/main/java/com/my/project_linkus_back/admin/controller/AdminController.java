package com.my.project_linkus_back.admin.controller;

import com.my.project_linkus_back.chats.dto.ChatResponseDto;
import com.my.project_linkus_back.chats.service.ChatsService;
import com.my.project_linkus_back.posts.dto.PostResponseDto;
import com.my.project_linkus_back.posts.service.PostService;
import com.my.project_linkus_back.users.dto.UsersResponseDto;
import com.my.project_linkus_back.users.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final ChatsService chatsService;
    private final PostService postService;
    private final UsersService usersService;

    @GetMapping("/posts/findall")
    public List<PostResponseDto> findPostsAll() {
        return postService.findAll();
    }

    @GetMapping("/users/findall")
    public List<UsersResponseDto> findUsersAll() { return usersService.findAll(); }

    @GetMapping("/chats/findall")
    public List<ChatResponseDto> findChatsAll() { return chatsService.findAll(); }
}

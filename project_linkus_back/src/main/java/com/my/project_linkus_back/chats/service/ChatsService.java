package com.my.project_linkus_back.chats.service;

import com.my.project_linkus_back.bans.service.BansService;
import com.my.project_linkus_back.chats.dto.ChatCreateRequestDto;
import com.my.project_linkus_back.chats.dto.ChatResponseDto;
import com.my.project_linkus_back.chats.entity.Chats;
import com.my.project_linkus_back.chats.repository.ChatsRepository;
import com.my.project_linkus_back.common.exception.BadAccessException;
import com.my.project_linkus_back.common.utils.AccountVerification;
import com.my.project_linkus_back.common.utils.GeometryUtils;
import com.my.project_linkus_back.users.entity.Users;
import com.my.project_linkus_back.users.repository.UsersRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatsService {
    private final ChatsRepository chatsRepository;
    private final UsersRepository usersRepository;
    private final ChatsRedisService chatsRedisService;
    private final BansService bansService;

    //채팅 저장
    @Transactional
    public ChatResponseDto createChat(ChatCreateRequestDto dto, HttpServletRequest request) {
        // 접속 IP
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }

        // 이 유저 또는 ip가 밴 상태인지 확인
        if (dto.getUserId() == null) {
            if (bansService.existsIp(ip)) {
                throw new BadAccessException("현재 정지 중인 ip입니다.");
            }
        } else {
            if (bansService.existsUserId(dto.getUserId())) {
                throw new BadAccessException("현재 정지 중인 계정입니다.");
            }
        }

        // 위치 생성
        Point point = GeometryUtils.createPoint(dto.getLongitude(), dto.getLatitude());
        Chats chat = new Chats();
        chat.setIp(ip);
        chat.setText(dto.getText());
        chat.setLocation(point);
        if (dto.getUserId() != null) {
            // 로그인 중인 유저와 삭제를 원하는 계정이 같은 지 검증
            AccountVerification accountVerification = new AccountVerification();
            accountVerification.verfication(dto.getUserId());
            chat.setUser(usersRepository.findByUserId(dto.getUserId()).orElse(null));
        }
        Chats savedChat = chatsRepository.save(chat);

        // Redis geo set 생성
        chatsRedisService.addChatLocation(String.valueOf(savedChat.getId()), dto.getLongitude(), dto.getLatitude());

        // Redis에 저장
        chatsRedisService.saveChat(String.valueOf(savedChat.getId()), savedChat);

        ChatResponseDto result = ChatResponseDto.builder()
                .chatId(savedChat.getId())
                .text(savedChat.getText())
                .longitude(savedChat.getLocation().getX())
                .latitude(savedChat.getLocation().getY())
                .ip(savedChat.getIp())
                .createdAt(savedChat.getCreatedAt())
                .build();

        if (savedChat.getUser() != null) {
            result.setUserId(savedChat.getUser().getUserId());
        }
        return result;
    }

    //전체 조회
    public List<ChatResponseDto> findAll() {
        return chatsRepository.findAll()
                .stream()
                .map(chat -> ChatResponseDto.builder()
                        .chatId(chat.getId())
                        .text(chat.getText())
                        .userId(chat.getUser().getUserId())
                        .ip(chat.getIp())
                        .longitude(chat.getLocation().getX())
                        .latitude(chat.getLocation().getY())
                        .createdAt(chat.getCreatedAt())
                        .build())
                .toList();
    }
}

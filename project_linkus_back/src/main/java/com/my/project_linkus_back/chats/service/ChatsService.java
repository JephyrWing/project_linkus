package com.my.project_linkus_back.chats.service;

import com.my.project_linkus_back.bans.service.BansService;
import com.my.project_linkus_back.chats.dto.ChatCreateRequestDto;
import com.my.project_linkus_back.chats.dto.ChatResponseDto;
import com.my.project_linkus_back.chats.entity.Chats;
import com.my.project_linkus_back.chats.repository.ChatsRepository;
import com.my.project_linkus_back.common.exception.BadAccessException;
import com.my.project_linkus_back.common.exception.UserNotFoundException;
import com.my.project_linkus_back.common.utils.AccountVerification;
import com.my.project_linkus_back.common.utils.GeometryUtils;
import com.my.project_linkus_back.reports.repository.ReportRepository;
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
    private final ReportRepository reportRepository;
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
                throw new BadAccessException("현재 정지 상태인 ip입니다.");
            }
        } else {
            if (bansService.existsUserId(dto.getUserId())) {
                throw new BadAccessException("현재 정지 상태인 계정입니다.");
            }
        }

        // 위치 생성
        Point point = GeometryUtils.createPoint(dto.getLongitude(), dto.getLatitude());
        Chats chat = new Chats();
        chat.setIp(ip);
        chat.setText(dto.getText());
        chat.setLocation(point);
        if (dto.getUserId() != null) {
            // 로그인 중인 유저와 게시를 원하는 계정이 같은 지 검증
            AccountVerification accountVerification = new AccountVerification(usersRepository);
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
    // 채팅 삭제 위해 추가
    @Transactional
    public void delete(Long chatId) {
        // 1. DB에서 채팅 존재 확인
        Chats chat = chatsRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("채팅 없음"));

        // 2. DB에서 삭제
        reportRepository.nullifyChatId(chatId);
        chatsRepository.delete(chat);

        // 3. Redis에서도 삭제 (addChatLocation과 saveChat을 했던 데이터를 제거)
        chatsRedisService.deleteChat(String.valueOf(chatId));
    }

    //전체 조회
    public List<ChatResponseDto> findAll() {
        return chatsRepository.findAll()
                .stream()
                .map((chat) -> {
                    if (chat.getUser() == null) {
                        return ChatResponseDto.builder()
                                .chatId(chat.getId())
                                .text(chat.getText())
                                .ip(chat.getIp())
                                .longitude(chat.getLocation().getX())
                                .latitude(chat.getLocation().getY())
                                .createdAt(chat.getCreatedAt())
                                .build();
                    } else {
                        String userId = chat.getUser().getUserId();
                        return ChatResponseDto.builder()
                                .chatId(chat.getId())
                                .text(chat.getText())
                                .ip(chat.getIp())
                                .userId(userId)
                                .longitude(chat.getLocation().getX())
                                .latitude(chat.getLocation().getY())
                                .createdAt(chat.getCreatedAt())
                                .build();
                    }
                })
                .toList();
    }

    // 특정 유저 채팅 조회
    public List<ChatResponseDto> userChats(String userId) {
        return chatsRepository.findByUser_UserId(userId).stream().map(chat -> ChatResponseDto.builder()
                        .chatId(chat.getId())
                        .text(chat.getText())
                        .userId(userId)
                        .ip(chat.getIp())
                        .longitude(chat.getLocation().getX())
                        .latitude(chat.getLocation().getY())
                        .createdAt(chat.getCreatedAt())
                        .build())
                .toList();
    }

    // 특정 채팅의 유저 ID 조회
    public String getAuthorId(Long chatId) {
        return chatsRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("채팅 없음"))
                .getUser().getUserId();
    }
}

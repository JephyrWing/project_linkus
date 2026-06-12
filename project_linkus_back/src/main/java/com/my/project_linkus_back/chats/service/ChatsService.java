package com.my.project_linkus_back.chats.service;

import com.my.project_linkus_back.chats.dto.ChatCreateRequestDto;
import com.my.project_linkus_back.chats.dto.ChatResponseDto;
import com.my.project_linkus_back.chats.entity.Chats;
import com.my.project_linkus_back.chats.repository.ChatsRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatsService {
    private final ChatsRepository chatsRepository;
    private final GeometryFactory geometryFactory;

    //채팅 저장
    public ChatResponseDto createChat(ChatCreateRequestDto dto, HttpServletRequest request){
        // 접속 IP
        String ip = request.getHeader("X-Forwarded-For");
        if(ip == null || ip.isBlank()){
            ip = request.getRemoteAddr();
        }
        // 위치 생성
        Point point = geometryFactory.createPoint(
                new Coordinate(
                        dto.getLongitude(),
                        dto.getLatitude()
                )
        );
        Chats chat = new Chats();
        chat.setIp(ip);
        chat.setText(dto.getText());
        chat.setLocation(point);

        Chats savedChat = chatsRepository.save(chat);

        return ChatResponseDto.builder()
                .id(savedChat.getId())
                .text(savedChat.getText())
                .latitude(savedChat.getLocation().getY())
                .longitude(savedChat.getLocation().getX())
                .build();
    }

    //전체 조회
    public List<ChatResponseDto> findAll(){
        return chatsRepository.findAll()
                .stream()
                .map(chat -> ChatResponseDto.builder()
                        .id(chat.getId())
                        .text(chat.getText())
                        .latitude(chat.getLocation().getY())
                        .longitude(chat.getLocation().getX())
                        .build())
                .toList();
    }
}

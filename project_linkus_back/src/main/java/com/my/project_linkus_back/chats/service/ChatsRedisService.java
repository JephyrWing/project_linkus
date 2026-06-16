package com.my.project_linkus_back.chats.service;

import com.my.project_linkus_back.chats.dto.ChatCreateRequestDto;
import com.my.project_linkus_back.chats.entity.RedisChats;
import com.my.project_linkus_back.chats.repository.ChatsRedisRepository;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ChatsRedisService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ChatsRedisRepository chatsRedisRepository;
    private final String GEO_KEY = "global:chat:geo";

    public void addChatLocation(String chatId, double longitude, double latitude) {
        //  Redis 전용 Point 객체 생성
        Point point = new Point(longitude, latitude);
        // GEO 셋에 데이터 추가
        // opsForGeo().add(Key이름, 좌표객체, 외래키)
        redisTemplate.opsForGeo().add(GEO_KEY, point, chatId);
        // 만료 시간 설정 (글로벌 키 전체에 1분 TTL 부여)
        redisTemplate.expire(GEO_KEY, 60, TimeUnit.SECONDS);
    }

    public void saveChat(String chatId, ChatCreateRequestDto dto) {
        RedisChats chat = new RedisChats();
        chat.setId(chatId);
        chat.setIp(dto.getIp());
        chat.setText(dto.getText());
        chat.setLongitude(dto.getLongitude());
        chat.setLatitude(dto.getLatitude());
        chatsRedisRepository.save(chat);
    }
}

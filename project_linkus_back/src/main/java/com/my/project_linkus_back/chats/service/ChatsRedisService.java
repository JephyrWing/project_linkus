package com.my.project_linkus_back.chats.service;

import com.my.project_linkus_back.chats.dto.ChatCreateRequestDto;
import com.my.project_linkus_back.chats.dto.ChatResponseDto;
import com.my.project_linkus_back.chats.dto.RedisResponseDto;
import com.my.project_linkus_back.chats.entity.Chats;
import com.my.project_linkus_back.chats.entity.RedisChats;
import com.my.project_linkus_back.chats.repository.ChatsRedisRepository;
import com.my.project_linkus_back.users.repository.UsersRepository;
import org.springframework.data.geo.*;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ChatsRedisService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ChatsRedisRepository chatsRedisRepository;
    private final UsersRepository usersRepository;
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

    public void saveChat(String chatId, Chats chat) {
        RedisChats redisChat = new RedisChats();
        redisChat.setId(chatId);
        redisChat.setIp(chat.getIp());
        if (chat.getUser() != null) {
            redisChat.setUserId(chat.getUser().getUserId());
        }
        redisChat.setText(chat.getText());
        redisChat.setLongitude(chat.getLocation().getX());
        redisChat.setLatitude(chat.getLocation().getY());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        redisChat.setCreatedAt(chat.getCreatedAt().format(formatter));
        chatsRedisRepository.save(redisChat);
    }

    // 채팅삭제 위해 추가
    public void deleteChat(String chatId) {
        // 1. Redis DB에서 삭제
        chatsRedisRepository.deleteById(chatId);

        // 2. GEO 셋에서도 삭제
        redisTemplate.opsForGeo().remove(GEO_KEY, chatId);
    }

    public List<RedisResponseDto> searchChats(double longitude, double latitude) {

        // 중심점 설정
        Point center = new Point(longitude, latitude);
        // 반경 설정 (5 킬로미터)
        Distance radius = new Distance(5, Metrics.KILOMETERS);
        Circle circle = new Circle(center, radius);
        // Redis GEO셋에서 5km 반경 내 채팅 ID들 검색
        GeoResults<RedisGeoCommands.GeoLocation<Object>> results = redisTemplate.opsForGeo().radius(GEO_KEY, circle);

        List<RedisResponseDto> responseList = new ArrayList<>();

        if (results != null) {
            for (GeoResult<RedisGeoCommands.GeoLocation<Object>> result : results) {
                String chatId = (String) result.getContent().getName();

                // 알아낸 ID로 채팅 정보들 redis db에서 꺼내오기
                chatsRedisRepository.findById(chatId).ifPresent(redisChat -> {
                    // 1분이 지나서 데이터가 이미 삭제되었다면 empty 반환
                    // 1분이 안 지난 데이터만 리스트에 저장
                    String userId = redisChat.getUserId();
                    String chatCustom = (userId != null)
                            ? usersRepository.findChatCustomByUserId(userId).orElse(null) : null;
                    responseList.add(new RedisResponseDto(
                            Long.parseLong(redisChat.getId()),
                            redisChat.getText(),
                            userId,
                            redisChat.getIp(),
                            redisChat.getLongitude(),
                            redisChat.getLatitude(),
                            redisChat.getCreatedAt(),
                            chatCustom
                    ));
                });
            }
        }
        return responseList;
    }
}

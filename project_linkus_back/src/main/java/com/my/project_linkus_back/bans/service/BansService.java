package com.my.project_linkus_back.bans.service;

import com.my.project_linkus_back.bans.dto.BansRedisResponseDto;
import com.my.project_linkus_back.bans.dto.BansRequestDto;
import com.my.project_linkus_back.bans.dto.BansResponseDto;
import com.my.project_linkus_back.bans.entity.Bans;
import com.my.project_linkus_back.bans.entity.RedisBans;
import com.my.project_linkus_back.bans.repository.BansRedisRepository;
import com.my.project_linkus_back.bans.repository.BansRepository;
import com.my.project_linkus_back.chats.entity.RedisChats;
import com.my.project_linkus_back.common.exception.UserNotFoundException;
import com.my.project_linkus_back.users.entity.Users;
import com.my.project_linkus_back.users.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BansService {
    private final BansRepository bansRepository;
    private final BansRedisRepository bansRedisRepository;
    private final UsersRepository usersRepository;

    @Transactional
    public void saveBan(BansRequestDto dto) {
        //mysql 저장
        Bans ban = new Bans();
        ban.setIp(dto.getIp());
        if (dto.getUserId() != null || !dto.getUserId().isBlank()) {
            Users user = usersRepository.findByUserId(dto.getUserId()).orElseThrow(() -> new UserNotFoundException());
            ban.setUser(user);
        }
        ban.setReason(dto.getReason());
        ban.setTtl(dto.getTtl());
        Bans result = bansRepository.save(ban);

        // redis 저장
        RedisBans redisBan = new RedisBans();
        redisBan.setId(String.valueOf(result.getId()));
        redisBan.setIp(result.getIp());
        if (result.getUser() != null) {
            redisBan.setUserId(result.getUser().getUserId());
        }
        redisBan.setReason(result.getReason());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        redisBan.setCreatedAt(result.getCreatedAt().format(formatter));
        bansRedisRepository.save(redisBan);
    }

    // 밴 상태 해제, mysql에는 그대로 남아있음
    @Transactional
    public void deleteBan(String banId) {
        bansRedisRepository.deleteById(banId);
    }

    // 현재 유저가 밴 당한 상태인지 확인
    public boolean existsUserId(String userId) {
        return bansRedisRepository.existsByUserId(userId);
    }

    // 현재 ip가 밴 당한 상태인지 확인
    public boolean existsIp(String ip) {
        return bansRedisRepository.existsByIp(ip);
    }

    // 현재 밴 상태인 리스트 전체 불러오기
    public List<BansRedisResponseDto> redisFindAll() {
        List<BansRedisResponseDto> result = new ArrayList<>();
        bansRedisRepository.findAll().forEach(x -> result.add(BansRedisResponseDto.toDto(x)));
        return result;
    }

    // mysql 밴 테이블 전체 불러오기
    public List<BansResponseDto> mysqlFindAll() {
        return bansRepository.findAll().stream().map(x -> BansResponseDto.toDto(x)).toList();
    }

    // 유저 별 전체 밴 내역 불러오기
    public List<BansResponseDto> mysqlFindByUserId(String userId) {
        return bansRepository.findByUser_UserId(userId).stream().map(x -> BansResponseDto.toDto(x)).toList();
    }

}

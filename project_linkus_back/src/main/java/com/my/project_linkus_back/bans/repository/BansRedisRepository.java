package com.my.project_linkus_back.bans.repository;

import com.my.project_linkus_back.bans.entity.RedisBans;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

@EnableRedisRepositories
public interface BansRedisRepository extends CrudRepository<RedisBans, String> {
    boolean existsByUserId(String userId);

    boolean existsByIp(String ip);

    List<RedisBans> findByUserId(String userId);
}

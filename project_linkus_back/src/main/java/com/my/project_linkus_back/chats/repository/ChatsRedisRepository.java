package com.my.project_linkus_back.chats.repository;

import com.my.project_linkus_back.chats.entity.RedisChats;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.repository.CrudRepository;

@EnableRedisRepositories
public interface ChatsRedisRepository extends CrudRepository<RedisChats, String> {

}

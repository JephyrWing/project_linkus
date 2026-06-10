package com.my.project_linkus_back.chats.repository;

import com.my.project_linkus_back.chats.entity.Chats;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatsRepository extends JpaRepository<Chats, Long> {
}

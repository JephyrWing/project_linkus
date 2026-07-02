package com.my.project_linkus_back.chats.repository;

import com.my.project_linkus_back.chats.entity.Chats;
import com.my.project_linkus_back.users.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatsRepository extends JpaRepository<Chats, Long> {
    List<Chats> findByUser_UserId(String userId);

    void deleteByUser(Users user);
}

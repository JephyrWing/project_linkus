package com.my.project_linkus_back.chats.repository;

import com.my.project_linkus_back.chats.entity.Chats;
import com.my.project_linkus_back.users.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatsRepository extends JpaRepository<Chats, Long> {
    List<Chats> findByUser_UserId(String userId);

    @Modifying
    @Query("UPDATE Chats c SET c.user = null WHERE c.user = :user")
    void nullifyUserInChats(@Param("user") Users user);
}

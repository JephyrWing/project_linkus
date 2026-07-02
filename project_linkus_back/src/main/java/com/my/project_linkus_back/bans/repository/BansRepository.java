package com.my.project_linkus_back.bans.repository;

import com.my.project_linkus_back.bans.entity.Bans;
import com.my.project_linkus_back.users.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BansRepository extends JpaRepository<Bans, Long> {
    List<Bans> findByUser_UserId(String userId);
    List<Bans> findByIp(String ip);
    boolean existsByBannedEmail(String bannedEmail);
}

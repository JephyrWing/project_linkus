package com.my.project_linkus_back.users.repository;

import com.my.project_linkus_back.users.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {
    // 로그인 및 사용자 조회용
    Optional<Users> findByUserId (String userId);

    //  회원 가입 시 아이디 중복 체크용
    boolean existsByUserId(String  userId);

    // 회원 가입 시 닉네임 중복 체크용
    boolean existsByNickName(String nickName);

}

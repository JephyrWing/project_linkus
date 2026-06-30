package com.my.project_linkus_back.users.repository;

import com.my.project_linkus_back.common.entity.UserRole;
import com.my.project_linkus_back.users.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {
    // 로그인 및 사용자 조회용
    Optional<Users> findByUserId (String userId);

    Optional<Users> findByEmail(String email);

    Optional<Users> findByKakaoAccountLink(String kakaoAccountLink);

    Optional<Users> findByGoogleAccountLink(String googleAccountLink);

    //  회원 가입 시 아이디 중복 체크용
    boolean existsByUserId(String userId);

    boolean existsByEmail(String email);

    // 유저 role만 가져오기
    @Query("SELECT u.role FROM Users u WHERE u.userId = :userId")
    Optional<UserRole> findRoleByUserId(@Param("userId") String userId);
    
}

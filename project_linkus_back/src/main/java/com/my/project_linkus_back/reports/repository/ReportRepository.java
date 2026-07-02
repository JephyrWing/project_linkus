package com.my.project_linkus_back.reports.repository;

import com.my.project_linkus_back.reports.entity.Reports;
import com.my.project_linkus_back.users.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Reports, Long> {

    void deleteByUser(Users user);

    // 전체 신고 조회(최신순)
    List<Reports> findAllByOrderByCreatedAtDesc();
    // 미처리 신고 조회
    List<Reports> findByProcessedFalseOrderByCreatedAtDesc();
    // 처리 완료 신고 조회
    List<Reports> findByProcessedTrueOrderByCreatedAtDesc();
    // 특정 유저가 신고한 내역
    List<Reports> findByUserOrderByCreatedAtDesc(Users user);
    // 신고게시글 아이디 조회
    List<Reports> findByPost_Id(Long postId);

    // 게시글 신고만 조회
    @Query("""
    select r
    from Reports r
    where r.post is not null
    order by r.createdAt desc
    """)
    List<Reports> findPostReports();

    // 채팅 신고만 조회
    @Query("""
    select r
    from Reports r
    where r.chat is not null
    order by r.createdAt desc
    """)
    List<Reports> findChatReports();


    @Modifying
    @Query("UPDATE Reports r SET r.post = null WHERE r.post.id = :postId")
    void nullifyPostId(@Param("postId") Long postId);


    @Modifying
    @Query("UPDATE Reports r SET r.chat = null WHERE r.chat.id = :chatId")
    void nullifyChatId(@Param("chatId") Long chatId);
}

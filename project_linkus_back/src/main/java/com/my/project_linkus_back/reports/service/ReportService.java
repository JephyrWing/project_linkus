package com.my.project_linkus_back.reports.service;

import com.my.project_linkus_back.chats.entity.Chats;
import com.my.project_linkus_back.chats.repository.ChatsRepository;
import com.my.project_linkus_back.posts.entity.Posts;
import com.my.project_linkus_back.posts.repository.PostRepository;
import com.my.project_linkus_back.reports.dto.ReportRequestDto;
import com.my.project_linkus_back.reports.entity.Reports;
import com.my.project_linkus_back.reports.repository.ReportRepository;
import com.my.project_linkus_back.users.entity.Users;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final ChatsRepository chatsRepository;

    // 게시글 또는 채팅 신고
    private void createReport(ReportRequestDto dto,  Users user){
        Reports report = new Reports();
        report.setText(dto.getText());

        // 신고자 저장
        report.setUser(user);

        if ("POST".equalsIgnoreCase(dto.getType())) {

            Posts post = postRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

            report.setPost(post);

        } else if ("CHAT".equalsIgnoreCase(dto.getType())) {

            Chats chat = chatsRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("채팅을 찾을 수 없습니다."));

            report.setChat(chat);

        } else {
            throw new IllegalArgumentException("잘못된 신고 타입입니다.");
        }

        reportRepository.save(report);
    }

    //신고 목록 조회
    public List<Reports> getReports() {
        return reportRepository.findAll();
    }

    //처리 완료 체크
    public void markProcessed(Long reportId){
        Reports report = reportRepository.findById(reportId).orElseThrow();

        report.setProcessed(true);
    }
}

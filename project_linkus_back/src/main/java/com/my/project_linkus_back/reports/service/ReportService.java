package com.my.project_linkus_back.reports.service;

import com.my.project_linkus_back.chats.entity.Chats;
import com.my.project_linkus_back.chats.repository.ChatsRepository;
import com.my.project_linkus_back.common.exception.BadAccessException;
import com.my.project_linkus_back.common.exception.UserNotFoundException;
import com.my.project_linkus_back.common.utils.AccountVerification;
import com.my.project_linkus_back.posts.entity.Posts;
import com.my.project_linkus_back.posts.repository.PostRepository;
import com.my.project_linkus_back.reports.dto.ReportRequestDto;
import com.my.project_linkus_back.reports.dto.ReportResponseDto;
import com.my.project_linkus_back.reports.entity.Reports;
import com.my.project_linkus_back.reports.repository.ReportRepository;
import com.my.project_linkus_back.users.entity.Users;
import com.my.project_linkus_back.users.repository.UsersRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportService {
    private final ReportRepository reportRepository;
    private final UsersRepository usersRepository;
    private final PostRepository postRepository;
    private final ChatsRepository chatsRepository;

    // 게시글 또는 채팅 신고
    public ReportResponseDto createReport(ReportRequestDto dto) {
        Users user = usersRepository.findByUserId(dto.getUserId())
                .orElseThrow(() -> new UserNotFoundException());

        // 로그인 중인 유저와 삭제를 원하는 계정이 같은 지 검증
        AccountVerification accountVerification = new AccountVerification();
        accountVerification.verfication(user.getUserId());

        Reports report = new Reports();
        report.setUser(user);
        report.setText(dto.getSortation());
        report.setProcessed(false);
        if (dto.getPostId() != null) {
            Posts post = postRepository.findById(dto.getPostId())
                    .orElseThrow(() -> new BadAccessException("게시글을 찾을 수 없습니다"));
            report.setPost(post);
        }

        if (dto.getChatId() != null) {
            Chats chat = chatsRepository.findById(dto.getChatId())
                    .orElseThrow(() -> new BadAccessException("채팅을 찾을 수 없습니다"));
            report.setChat(chat);
        }
        Reports saved = reportRepository.save(report);
        return toDto(saved);
    }

    // 전체 신고 조회
    public List<ReportResponseDto> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    //게시글 신고 조회
    public List<ReportResponseDto> getPostReport() {
        return reportRepository.findPostReports()
                .stream()
                .map(this::toDto)
                .toList();
    }

    //채팅 신고 조회
    public List<ReportResponseDto> getChatReports() {
        return reportRepository.findChatReports()
                .stream()
                .map(this::toDto)
                .toList();
    }

    // 내 신고 내역 조회
    public List<ReportResponseDto> getMyReports(String userId) {
        Users user = usersRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException());

        // 로그인 중인 유저와 삭제를 원하는 계정이 같은 지 검증
        AccountVerification accountVerification = new AccountVerification();
        accountVerification.verfication(user.getUserId());

        return reportRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private ReportResponseDto toDto(Reports report) {
        return ReportResponseDto.builder()
                .reportId(report.getId())
                .userId(report.getUser().getId())
                .postId(report.getPost() != null ? report.getPost().getId() : null)
                .chatId(report.getChat() != null ? report.getChat().getId() : null)
                .text(report.getText())
                .processed(report.isProcessed())
                .build();
    }
}

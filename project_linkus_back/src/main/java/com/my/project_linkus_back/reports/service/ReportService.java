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

        // 로그인 중인 유저와 신고를 원하는 계정이 같은 지 검증
        AccountVerification accountVerification = new AccountVerification(usersRepository);
        accountVerification.verfication(user.getUserId());

        Reports report = new Reports();
        report.setUser(user);
        report.setText(dto.getText());
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
        return ReportResponseDto.toDto(saved);
    }

    //신고삭제
    @Transactional
    public void deleteReport(Long reportId, String userId) {
        Reports report = reportRepository.findById(reportId)
                .orElseThrow(() -> new BadAccessException("해당 신고 내역이 없습니다."));

        // 신고를 작성한 유저와 삭제하려는 유저가 같은지 확인
        if (!report.getUser().getUserId().equals(userId)) {
            throw new BadAccessException("본인의 신고 내역만 삭제할 수 있습니다.");
        }
        reportRepository.deleteById(reportId);
    }

    // 전체 신고 조회
    public List<ReportResponseDto> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(x->ReportResponseDto.toDto(x))
                .toList();
    }

    //게시글 신고 조회
    public List<ReportResponseDto> getPostReports() {
        return reportRepository.findPostReports()
                .stream()
                .map(x->ReportResponseDto.toDto(x))
                .toList();
    }

    //채팅 신고 조회
    public List<ReportResponseDto> getChatReports() {
        return reportRepository.findChatReports()
                .stream()
                .map(x->ReportResponseDto.toDto(x))
                .toList();
    }

    // 내 신고 내역 조회
    public List<ReportResponseDto> getMyReports(String userId) {
        Users user = usersRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException());

        // 로그인 중인 유저와 조회를 원하는 계정이 같은 지 검증
        AccountVerification accountVerification = new AccountVerification(usersRepository);
        accountVerification.verfication(user.getUserId());

        return reportRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(x->ReportResponseDto.toDto(x))
                .toList();
    }

    // 신고 처리
    public void processedCheck(Long reportId) {
        Reports report = reportRepository.findById(reportId).orElseThrow(()->new BadAccessException("해당 신고 게시물이 없습니다"));
        report.setProcessed(!report.isProcessed());
        reportRepository.save(report);
    }

    // 신고 미처리만 검색
    public List<ReportResponseDto> getFalseProcessed(){
        return reportRepository.findByProcessedFalseOrderByCreatedAtDesc()
                .stream()
                .map(x->ReportResponseDto.toDto(x))
                .toList();
    }

    // 신고 처리만 검색
    public List<ReportResponseDto> getTrueProcessed(){
        return reportRepository.findByProcessedTrueOrderByCreatedAtDesc()
                .stream()
                .map(x->ReportResponseDto.toDto(x))
                .toList();
    }

}

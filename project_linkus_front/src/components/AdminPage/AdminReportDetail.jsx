import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import getCommonApi from "../../utils/Axios/getCommonApi";

function AdminReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [report, setReport] = useState(state?.report || null);

  const handleGoToReportedUser = async () => {
    console.log("현재 report 객체 내용:", report);
    console.log("report.userId는 누구인가?:", report.userId);
    console.log("report.postId는 무엇인가?:", report.postId);

    
  try {
    let targetUserId = null;
    
    // 1. postId가 있으면 게시글 작성자 ID를 물어봄
    if (report.postId) {
      const res = await getCommonApi().get(`/admin/posts/author/${report.postId}`);
      targetUserId = res.data;
    } 
    // 2. chatId가 있으면 채팅 작성자 ID를 물어봄
    else if (report.chatId) {
      const res = await getCommonApi().get(`/admin/chats/author/${report.chatId}`);
      targetUserId = res.data;
    }

    // 3. 찾은 작성자 ID로 상세 페이지 이동
    if (targetUserId) {
      navigate(`/adminpage/user/${targetUserId}`, {
        state: { user: { userId: targetUserId } }
      });
    }
  } catch (e) {
    alert("작성자 정보를 가져올 수 없습니다.");
  }
};

  useEffect(() => {
    if (!report) {
      getCommonApi().get(`/admin/reports/detail/${reportId}`)
        .then(res => setReport(res.data))
        .catch(err => console.error(err));
    }
  }, [reportId, report]);

  if (!report) return <div>로딩 중...</div>;

  return (
    <div className="report-detail-container">
      <h3>신고 상세 정보 (신고번호: {report.reportId})</h3>
      <div className="info-box">
        <p><strong>신고 사유:</strong> {report.text}</p>
        <p><strong>유형:</strong> {report.postId ? "게시글" : "채팅"}</p>
        <p><strong>대상 ID:</strong> {report.postId || report.chatId}</p>
        <p><strong>신고자 ID:</strong> {report.userId}</p>
      </div>

      <div className="action-buttons">
        {/* 회원 상세보기로 (회원 상세 페이지에서 BAN 처리 가능) */}
        <button onClick={handleGoToReportedUser}>
          신고 대상 회원 상세보기
        </button>
        <button onClick={() => navigate(-1)}>목록으로 돌아가기</button>
      </div>
    </div>
  );
}

export default AdminReportDetail;
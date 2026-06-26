import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import getCommonApi from "../../utils/Axios/getCommonApi";

function AdminReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [report, setReport] = useState(state?.report || null);

  const handleGoToReportedUser = async () => {
      
  try {
    let targetUserId = null;
    
    // 1. postId가 있으면 게시글 작성자 ID 요청
    if (report.postId) {
      const res = await getCommonApi().get(`/admin/posts/author/${report.postId}`);
      targetUserId = res.data;
    } 
    // 2. chatId가 있으면 채팅 작성자 ID 요청
    else if (report.chatId) {
      const res = await getCommonApi().get(`/admin/chats/author/${report.chatId}`);
      targetUserId = res.data;
    }

    // 3. 둘 다 없으면 (이미 삭제된 상태)
    else {
      alert("게시글이나 채팅이 이미 삭제되어 작성자 정보를 확인할 수 없습니다.");
      return;
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


// 신고 당한 게시물,채팅 삭제
const handleDelete = async () => {
    const isPost = !!report.postId; // 게시글이면 true
    const targetId = report.postId || report.chatId;
    const confirmMsg = `${isPost ? "게시글" : "채팅"}을 정말 삭제하시겠습니까?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      // 1. 삭제 요청
      if (isPost) {
        await getCommonApi().delete(`/admin/posts/${targetId}`);
      } else {
        await getCommonApi().delete(`/admin/chats/${targetId}`);
      }

      // 2. 삭제 성공 후 신고 상태를 '처리 완료'로 변경
      await getCommonApi().put(`/admin/reports/${report.reportId}`);
      
      alert("삭제 처리가 완료되었습니다.");
      navigate(-1); // 이전 목록으로 복귀
    } catch (e) {
      alert("삭제 실패: " + e.message);
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
        {/* [삭제 버튼 추가] */}
        <button 
          onClick={handleDelete} 
          style={{ backgroundColor: "#ff4d4d", color: "white", marginLeft: "10px" }}
        >
          {report.postId ? "게시글 삭제" : "채팅 삭제"}
        </button>
        <button onClick={() => navigate(-1)}>목록으로 돌아가기</button>
      </div>
    </div>
  );
}

export default AdminReportDetail;
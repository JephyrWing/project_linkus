import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import getCommonApi from "../../utils/Axios/getCommonApi";

function AdminReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [report, setReport] = useState(state?.report || null);

  useEffect(() => {
    if (!report) {
      getCommonApi().get(`/admin/reports/detail/${reportId}`)
        .then(res => setReport(res.data))
        .catch(err => console.error(err));
    }
  }, [reportId, report]);

  // 게시글 작성자 ID 조회
  const getAuthorId = async () => {
    try {
      if (report.postId) {
        const res = await getCommonApi().get(`/admin/posts/author/${report.postId}`);
        return res.data;
      }
      
    } catch (e) {
      alert("작성자 정보 조회 실패");
    }
    return null;
  };

  // 채팅 작성자 ID 및 IP 조회
  const getChatAuthorInfo = async () => {
    try {
      if (report.chatId) {
        const res = await getCommonApi().get(`/chats/admin/author-info/${report.chatId}`);
        return res.data; 
      }
    } catch (e) {
      console.error(e);
    }
    return { userId: null, ip: null };
  };


  const handleProcessAll = async () => {
    const reason = prompt("처리 사유를 입력하세요.");
    if (!reason) return;

    const ttlInput = prompt("정지 시간을 시간(Hour) 단위로 입력하세요.");
    const ttl = parseInt(ttlInput);
    try {
      let requestData = { reason, ttl };

      // 1. 제재 대상 정보 수집
      if (report.postId) {
        requestData.userId = await getAuthorId();
      } else if (report.chatId) {
        const authorInfo = await getChatAuthorInfo();
        requestData.userId = authorInfo.userId;
        requestData.ip = authorInfo.ip;
      }

      // 2. 유저 정지 (IP 차단 포함)
      await getCommonApi().post("/admin/bans", requestData);

      // 3. 게시글/채팅 삭제
      const targetId = report.postId || report.chatId;
      if (report.postId) {
        await getCommonApi().delete(`/admin/posts/${targetId}`);
      } else if (report.chatId) {
        await getCommonApi().delete(`/admin/chats/${targetId}`);
      }

      // 4. 신고 처리 완료
      await getCommonApi().put(`/admin/reports/${report.reportId}`);

      alert("제재 및 삭제 처리가 완료되었습니다.");
      navigate("/adminpage/reports");
    } catch (e) {
      alert("처리 실패: " + e.message);
    }
  };

  // 신고 반려 (데이터 삭제 없이 처리 완료만)
  const handleReportReject = async () => {
    if (window.confirm("이 신고를 반려하시겠습니까?")) {
      try {
        await getCommonApi().put(`/admin/reports/${report.reportId}`);
        alert("신고가 반려되었습니다.");
        navigate("/adminpage/reports");
      } catch (e) {
        alert("반려 실패: " + e.message);
      }
    }
  };

  
  const handleGoToReportedUser = async () => {
    const userId = report.postId ? await getAuthorId() : (await getChatAuthorInfo()).userId;
    if (userId) {
      navigate(`/adminpage/user/${userId}`, {
        state: { user: { userId } }
      });
    } else {
      alert("게시글이나 채팅이 이미 삭제되어 작성자 정보를 확인할 수 없습니다.");
    }
  };


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
        <button onClick={handleGoToReportedUser}>회원 상세보기</button>
        
        <button onClick={handleProcessAll} style={{ backgroundColor: "#ff4d4d", color: "white", marginLeft: "10px" }}>
          통합 제재 (정지+삭제+완료)
        </button>

        <button onClick={handleReportReject} style={{ backgroundColor: "#6c757d", color: "white", marginLeft: "10px" }}>
          신고 반려
        </button>

        <button onClick={() => navigate(-1)} style={{ marginLeft: "10px" }}>목록으로</button>
      </div>
    </div>
  );
}

export default AdminReportDetail;
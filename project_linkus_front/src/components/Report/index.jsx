import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import getCommonApi from "../../utils/Axios/getCommonApi";
import { AiFillAlert } from "react-icons/ai"; // 신고 아이콘
import "./report.css";

function Report() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reportList, setReportList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // 신고 전송용 데이터
  const [newReport, setNewReport] = useState({ 
    text: "", 
    sortation: "POST", 
    postId: "", 
    chatId: "" 
  });

  // UI 표시용 데이터 (신고 대상 정보)
  const [reportedData, setReportedData] = useState({ 
    text: "", 
    type: "", 
    id: "" 
  });

  // 페이지 진입 시 다른 곳에서 넘겨준 데이터(state) 확인
  useEffect(() => {
    const state = location.state;
    if (state) {
      if (state.chatId) {
        setNewReport({ text: "", sortation: "CHAT", postId: "", chatId: state.chatId });
        setReportedData({ text: state.text, type: "CHAT", id: state.chatId });
      } else if (state.postId) {
        setNewReport({ text: "", sortation: "POST", postId: state.postId, chatId: "" });
        setReportedData({ text: state.text, type: "POST", id: state.postId });
      }
    }
  }, [location.state]);

  const fetchMyReports = async (pageNum = 0) => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await getCommonApi().post(`/reports/my/${userId}?page=${pageNum}&size=10`, {
        userId: userId
      });
      setReportList(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setPage(pageNum);
    } catch (error) {
      console.error("내 신고 내역 조회 실패: ", error);
    }
  };

  const handleAddReport = async () => {
    const reportData = {
      userId: localStorage.getItem("userId"),
      text: newReport.text,
      sortation: newReport.sortation,
      postId: newReport.sortation === "POST" ? (newReport.postId || null) : null,
      chatId: newReport.sortation === "CHAT" ? (newReport.chatId || null) : null
    };

    if (!reportData.text) {
        alert("신고 내용을 입력해주세요.");
        return;
    }

    try {
      await getCommonApi().post("/reports", reportData);
      alert("신고 접수 완료");
      // 입력창 초기화
      setNewReport({ text: "", sortation: "POST", postId: "", chatId: "" });
      setReportedData({ text: "", type: "", id: "" });
      await fetchMyReports(0);
    } catch (error) {
      console.error("신고 실패:", error.response?.data);
      alert(`신고 접수 실패: ${error.response?.data?.message || "서버 오류 발생"}`);
    }
  };

  const handleCancelReport = async (reportId) => {
  if (window.confirm("신고를 삭제하시겠습니까?")) {
    try {
      const userId = localStorage.getItem("userId");
      await getCommonApi().delete(`/reports/${reportId}?userId=${userId}`);
      alert("삭제되었습니다.");
      await fetchMyReports(0); // 목록 새로고침
    } catch (error) {
      alert("삭제 실패: " + (error.response?.data?.message || "서버 오류"));
    }
  }
};

  useEffect(() => {
    fetchMyReports(0);
  }, []);

  return (
    <div className="report-container">
      <h1 className="report-title">신고 페이지</h1>

      <section className="report-filter-section" style={{ marginBottom: "60px" }}>
        <h2 className="report-filter-title">신고 작성</h2>

        {reportedData.type ? (
          <div className="report-target-box">
            <p className="report-target-text">
              <strong>신고 대상 ({reportedData.type === "CHAT" ? "채팅" : "게시글"}):</strong> "{reportedData.text}"
            </p>
            <span className="report-target-id">(ID: {reportedData.id} 신고 중)</span>
          </div>
        ) : (
          /* 신고 대상이 없을 때 (메뉴로 직접 들어온 경우 -> 안내문구) */
          <div className="report-guide-box">
            <p className="report-guide-text">현재 신고하려는 대상이 선택되지 않았습니다.</p>
            <div className="report-guide-instruction">
              게시글이나 채팅방 내의
              <span className="report-guide-icon">
                <strong>신고하기</strong><AiFillAlert />
              </span>
              아이콘을 통해 신고를 진행해주세요.
            </div>            
          </div>
        )}

        {/* 신고 대상이 있을 때만 내용 입력창과 등록 버튼 노출 */}
        {reportedData.type && (
        <div className="report-input-container">
          <input 
            className="report-filter-input" 
            placeholder="신고 내용을 입력하세요" 
            value={newReport.text} 
            onChange={(e) => setNewReport({...newReport, text: e.target.value})} 
          />
          <button className="report-action-button" onClick={handleAddReport}>등록</button>
        </div>
      )}
    </section>

      {/* 내 신고 내역 */}
      <section className="report-user-section">
        <h2 className="report-user-title">내 신고 내역</h2>
        <table className="report-user-table">
          <thead>
            <tr><th>번호</th><th>구분</th><th>신고 내용</th><th>상태</th><th>관리</th></tr>
          </thead>
          <tbody>
            {reportList.map((report, index) => (
              <tr key={report.reportId || index}>
                <td>{index + 1 + (page * 10)}</td>
                <td>{report.postId ? "POST" : "CHAT"}</td>
                <td title={report.text}>{report.text}</td>
                <td>
                  <span style={{ 
                    color: report.processed ? "#28a745" : "#dc3545",
                    fontWeight: "bold" 
                  }}>
                    {report.processed ? "처리완료" : "미처리"}
                  </span>
                </td>                
                <td>
                  <button 
                    className="report-action-button" 
                    onClick={() => {
                      if (report.processed) {
                        alert("이미 처리 완료된 신고는 삭제할 수 없습니다.");
                      } else {
                        handleCancelReport(report.reportId);
                      }
                    }}
                    style={{ 
                      backgroundColor: report.processed ? "#ccc" : "#ff4d4d", // 처리 완료면 회색으로 표시
                      color: "white", 
                      border: "none", 
                      cursor: "pointer" 
                    }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination-container">
          <button disabled={page === 0} onClick={() => fetchMyReports(page - 1)}>이전</button>
          <span>{page + 1} / {totalPages || 1}</span>
          <button disabled={page >= totalPages - 1} onClick={() => fetchMyReports(page + 1)}>다음</button>
        </div>
      </section>
    </div>
  );
}

export default Report;
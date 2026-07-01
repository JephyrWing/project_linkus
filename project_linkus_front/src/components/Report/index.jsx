import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import getCommonApi from "../../utils/Axios/getCommonApi";
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

        {/* 신고 대상 정보 박스 */}
        {reportedData.type && (
          <div style={{ padding: "12px", backgroundColor: "#f9f9f9", marginBottom: "15px", borderRadius: "8px", border: "1px solid #eee" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
              <strong>신고 대상 ({reportedData.type === "CHAT" ? "채팅" : "게시글"}):</strong> "{reportedData.text}"
            </p>
            <span style={{ fontSize: "12px", color: "#888" }}>
              (ID: {reportedData.id} 신고 중)
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <input 
            className="report-filter-input" 
            placeholder="신고 내용을 입력하세요" 
            value={newReport.text} 
            onChange={(e) => setNewReport({...newReport, text: e.target.value})} 
          />
          
          {/* 외부 데이터가 없을 때만 수동 선택 가능 */}
          {!reportedData.type && (
            <>
              <select 
                className="report-filter-input" 
                style={{ width: "120px" }}
                value={newReport.sortation} 
                onChange={(e) => setNewReport({...newReport, sortation: e.target.value, postId:"", chatId:""})}
              >
                <option value="POST">게시글</option>
                <option value="CHAT">채팅</option>
              </select>
              {newReport.sortation === "POST" ? (
                <input className="report-filter-input" placeholder="게시글 ID" value={newReport.postId} onChange={(e) => setNewReport({...newReport, postId: e.target.value})} />
              ) : (
                <input className="report-filter-input" placeholder="채팅 ID" value={newReport.chatId} onChange={(e) => setNewReport({...newReport, chatId: e.target.value})} />
              )}
            </>
          )}

          <button className="report-action-button" onClick={handleAddReport}>등록</button>
        </div>
      </section>

      {/* 내 신고 내역 */}
      <section className="report-user-section">
        <h2 className="report-user-title">내 신고 내역</h2>
        <table className="report-user-table">
          <thead>
            <tr><th>번호</th><th>구분</th><th>신고 내용</th><th>상태</th><th>상세</th></tr>
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
                  {/* 미처리된 신고에 대해서만 삭제(취소) 버튼을 노출 */}
                  {!report.processed && (
                    <button 
                      className="report-action-button" 
                      onClick={() => handleCancelReport(report.reportId)}
                      style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", cursor: "pointer" }}
                    >
                      삭제
                    </button>
        )}
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
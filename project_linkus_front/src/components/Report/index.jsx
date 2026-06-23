import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import getCommonApi from "../../utils/Axios/getCommonApi";
import "./report.css";

function Report() {
  const navigate = useNavigate();
  const [reportList, setReportList] = useState([]);
  const [newReport, setNewReport] = useState({ 
    text: "", 
    sortation: "POST", 
    postId: "", 
    chatId: "" 
  });

  useEffect(() => {
    fetchMyReports();
  }, []);

 const fetchMyReports = async () => {
   try {
     const userId = localStorage.getItem("userId");
    
    
     const response = await getCommonApi().post(`/reports/my/${userId}`, {
       userId: userId // DTO로 잘 전달됩니다.
     });
    
     setReportList(response.data.content || response.data); 
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

    try {
      await getCommonApi().post("/reports", reportData);
      alert("신고 접수 완료");
      setNewReport({ text: "", sortation: "POST", postId: "", chatId: "" });
      await fetchMyReports();
    } catch (error) {
      console.error("신고 실패", error);
    }
  };

  return (
    <div className="report-container">
      <h1 className="report-title">신고 페이지</h1>

      {/* 신고 작성 섹션 */}
      <section className="report-filter-section" style={{ marginBottom: "60px" }}>
        <h2 className="report-filter-title">신고 작성</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input 
            className="report-filter-input" 
            placeholder="신고 내용을 입력하세요" 
            value={newReport.text} 
            onChange={(e) => setNewReport({...newReport, text: e.target.value})} 
          />
          <select 
            className="report-filter-input" 
            style={{ width: "120px" }}
            value={newReport.sortation} 
            onChange={(e) => setNewReport({...newReport, sortation: e.target.value})}
          >
            <option value="POST">게시글</option>
            <option value="CHAT">채팅</option>
          </select>
          <button className="report-action-button" onClick={handleAddReport}>등록</button>
        </div>
      </section>

      <section className="report-user-section">
        <h2 className="report-user-title">내 신고 내역</h2>
        <table className="report-user-table">
          <thead>
            <tr><th>번호</th><th>구분</th><th>신고 내용</th><th>상세</th></tr>
          </thead>
          
          <tbody>
            {reportList.map((report, index) => (
              <tr key={report.reportId || index}>
                <td>{index + 1}</td>
      
                {/* 1. 구분: postId가 있으면 POST, 없으면 CHAT */}
                <td>{report.postId ? "POST" : "CHAT"}</td>
      
                {/* 2. 내용: 백엔드에서 받은 text 출력 */}
                <td title={report.text}>{report.text}</td>
      
                <td>
                  <button className="report-action-button" onClick={() => navigate(`/report/detail/${report.reportId}`)}>→</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Report;
import { useEffect, useState } from "react";
import getCommonApi from "../../utils/Axios/getCommonApi";

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all"); 
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setPage(0);
    fetchReports(0);
  }, [filter]);

  const fetchReports = async (pageNum = 0) => {
    const baseMap = { 
      all: "findall", post: "posts", chat: "chats", 
      unprocessed: "unprocessed", processed: "processed" 
    };
    const url = `/admin/reports/${baseMap[filter]}?page=${pageNum}&size=20`;

    try {
      const res = await getCommonApi().get(url);
      setReports(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setPage(pageNum);
    } catch (error) { console.error(error); }
  };

  const toggleProcess = async (reportId, currentStatus) => {
    if (window.confirm(`신고를 ${currentStatus ? "미처리" : "처리 완료"} 상태로 변경하시겠습니까?`)) {
      try {
        await getCommonApi().put(`/admin/reports/${reportId}`);
        // 2. 상태 변경 후 현재 페이지 유지하며 새로고침
        fetchReports(page); 
      } catch (error) {
        alert("상태 변경 실패");
      }
    }
  };

  return (
    <div className="admin-container">
      <h3>신고 관리</h3>
      
      <div className="filter-buttons">
        <button onClick={() => setFilter("all")}>전체</button>
        <button onClick={() => setFilter("post")}>게시글 신고</button>
        <button onClick={() => setFilter("chat")}>채팅 신고</button>
        <button onClick={() => setFilter("unprocessed")}>미처리 신고</button>
        <button onClick={() => setFilter("processed")}>처리완료 신고</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>번호</th><th>신고자</th><th>유형</th><th>대상 ID</th><th>신고 사유</th><th>상태</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.reportId}>
              <td>{r.reportId}</td>
              <td>{r.userId}</td>
              <td>{r.postId ? "게시글" : "채팅"}</td>
              <td>{r.postId || r.chatId || "알수없음"}</td>
              <td>{r.text}</td>
              <td>
                <button 
                  onClick={() => toggleProcess(r.reportId, r.processed)}
                  style={{ color: r.processed ? "green" : "red" }}
                >
                  {r.processed ? "처리완료" : "미처리"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-container">
        <button 
          className="page-btn"
          disabled={page === 0} 
          onClick={() => fetchReports(page - 1)}
        >
          이전
        </button>
        
        <span className="page-info">{page + 1} / {totalPages}</span>
        
        <button 
          className="page-btn"
          disabled={page >= totalPages - 1} 
          onClick={() => fetchReports(page + 1)}
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default AdminReports;
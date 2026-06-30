import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import getCommonApi from "../../utils/Axios/getCommonApi";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all"); // all: 전체 회원, currentBan: 정지 중
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setPage(0);
    fetchUsers(0);
  }, [filter]);

  const fetchUsers = async (pageNum = 0) => {
    let url = "";
    if (filter === "currentBan") {
      url = `/admin/bans?page=${pageNum}&size=20`; // Redis (현재 정지 중)
    } else if (filter === "history") {
      url = `/admin/bans/findall?page=${pageNum}&size=20`; // MySQL 내역
    } else {
      url = `/admin/users/findall?page=${pageNum}&size=20`; // 전체 회원 조회
    }

    try {
      const res = await getCommonApi().get(url);
      setUsers(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setPage(pageNum);
    } catch (error) {
      console.error("회원 조회 실패", error);
    }
  };

  const handleUnban = async (banId) => {
    if (!window.confirm("정말 이 유저의 정지를 해제하시겠습니까?")) return;

    try {
      await getCommonApi().delete(`/admin/bans/${banId}`);
      
      alert("정지가 해제되었습니다.");
      
      fetchUsers(page);
    } catch (error) {
      console.error("밴 해제 실패", error);
      alert("밴 해제에 실패했습니다.");
    }
  };


  const renderHeader = () => {
  if (filter === "currentBan") 
    return <tr><th>번호</th><th>USER ID</th><th>IP</th><th>밴 사유</th><th>관리</th></tr>;
  if (filter === "history") 
    return <tr><th>번호</th><th>USER ID</th><th>IP</th><th>밴 사유</th><th>밴 기간</th></tr>;
  
  return <tr><th>번호</th><th>USER ID</th><th>밴 여부</th><th>상세보기</th></tr>;
};

  const renderRow = (user, index) => {
    const rowNumber = page * 20 + index + 1;

    // [현재 정지중 탭]
    if (filter === "currentBan") return (
      <tr key={`ban-${user.userId}-${index}`}>
        <td>{rowNumber}</td>
        <td>{user.userId}</td>
        <td>{user.ip}</td>
        <td>{user.reason || "사유 없음"}</td>
        <td>
        <button 
          className="btn-danger" 
          onClick={() => handleUnban(user.userId)}
        >
          밴 해제
        </button>
      </td>
      </tr>
    );

    // [정지 이력 탭]
    if (filter === "history") return (
      <tr key={`history-${index}`}>
        <td>{rowNumber}</td>
        <td>{user.userId}</td>
        <td>{user.ip}</td>
        <td>{user.reason || "사유 없음"}</td>
        <td>{user.ttl || "기록없음"}</td> 
      </tr>
    );

    // [전체 회원 탭]
    return (
      <tr key={`ban-${user.userId}-${index}`}>
        <td>{rowNumber}</td>
        <td>{user.userId}</td>
        <td>{user.banned ? "정지중" : "정상"}</td>
        <td>
          <button onClick={() => navigate(`/adminpage/user/${user.userId}`, { state: { user } })}>상세보기</button>
        </td>
      </tr>
    );

    
  };

  return (
    <div>
      <h3 className="mb-4" style={{ borderLeft: "5px solid #8e6e58", paddingLeft: "15px", color: "#333" }}>회원 관리</h3>
      <div className="filter-buttons">
        <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>전체 회원</button>
        <button onClick={() => setFilter("currentBan")} className={filter === "currentBan" ? "active" : ""}>현재 정지 중</button>
        <button onClick={() => setFilter("history")} className={filter === "history" ? "active" : ""}>정지 이력 전체조회</button>
      </div>

      <table>
        <thead>{renderHeader()}</thead>
        <tbody>{users.map((user, index) => renderRow(user, index))}</tbody>
      </table>

      <div className="pagination-container">
        <button 
          className="page-btn"
          disabled={page === 0} 
          onClick={() => fetchUsers(page - 1)}
        >
          이전
        </button>
        
        <span className="page-info">{page + 1} / {totalPages}</span>
        
        <button 
          className="page-btn"
          disabled={page >= totalPages - 1} 
          onClick={() => fetchUsers(page + 1)}
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default AdminUsers;
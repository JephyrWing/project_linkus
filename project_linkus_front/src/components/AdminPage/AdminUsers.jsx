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

  const renderHeader = () => {
    if (filter === "currentBan") 
      return <tr><th>번호</th><th>USER ID</th><th>남은 밴 기간</th><th>밴 사유</th><th>상세보기</th></tr>;
    
    // 전체 회원 탭 헤더
    return <tr><th>번호</th><th>USER ID</th><th>밴 여부</th><th>상세보기</th></tr>;
  };

  const renderRow = (user, index) => {
    const rowNumber = page * 20 + index + 1;

    // [현재 정지중 탭]
    if (filter === "currentBan") return (
      <tr key={`ban-${user.userId}-${index}`}>
        <td>{rowNumber}</td>
        <td>{user.userId}</td>
        <td>{user.ttl}초</td>
        <td>{user.reason || "사유 없음"}</td>
        <td>
          <button onClick={() => navigate(`/adminpage/user/${user.userId}`, { state: { user } })}>상세보기</button>
        </td>
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
      <h3>회원 관리</h3>
      <div className="filter-buttons">
        <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>전체 회원</button>
        <button onClick={() => setFilter("currentBan")} className={filter === "currentBan" ? "active" : ""}>현재 정지 중</button>
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
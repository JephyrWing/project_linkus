import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import getCommonApi from "../../utils/Axios/getCommonApi";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers(0);
  }, []);

  const fetchUsers = async (pageNum = 0) => {
    try {
      const res = await getCommonApi().get(`/admin/users/findall?page=${pageNum}&size=20`);
      setUsers(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setPage(pageNum);
    } catch (error) {
      console.error("회원 조회 실패", error);
    }
  };

  return (
    <div>
      <h3>전체 회원 목록</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>USER ID</th>
            <th>닉네임</th>
            <th>ROLE</th>
            <th>상세보기</th>            
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId}>
              <td>{user.id}</td>
              <td>{user.userId}</td>
              <td>{user.nickName}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => navigate(`/adminpage/user/${user.userId}`, { state : {user}})}>상세보기</button>
              </td>
            </tr>
          ))}
        </tbody>
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
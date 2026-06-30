import { useEffect, useState } from "react";
import getCommonApi from "../../utils/Axios/getCommonApi";

function AdminChats() {
  const [chats, setChats] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchChats(0);
  }, []);

  const fetchChats = async (pageNum = 0) => {
    try {
      const res = await getCommonApi().get(`/admin/chats/findall?page=${pageNum}&size=20`);
      
      setChats(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setPage(pageNum);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  const deleteChat = async (chatId) => {
    if (window.confirm(`${chatId}번 채팅을 정말 삭제하시겠습니까?`)) {
      try {
        await getCommonApi().delete(`/admin/chats/${chatId}`);
        alert("삭제되었습니다.");
        fetchChats(page); // 현재 페이지 유지하며 새로고침
      } catch (error) {
        alert("삭제 실패: " + error.message);
      }
    }
  };

  return (
    <div>
      <h3 className="title">전체 채팅</h3>
      <table>
        <thead>
          <tr>
            <th>번호</th>
            <th>보낸사람</th>
            <th>내용</th>
            <th>IP</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {chats.map((chat) => (
            <tr key={chat.chatId}>
              <td>{chat.chatId}</td>
              <td>{chat.userId}</td>
              <td>{chat.text}</td>
              <td>{chat.ip}</td>
              <td>                
                <button onClick={() => deleteChat(chat.chatId)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-container">
        <button 
          className="page-btn"
          disabled={page === 0} 
          onClick={() => fetchChats(page - 1)} 
        >
          이전
        </button>
        
        <span className="page-info">{page + 1} / {totalPages}</span>
        
        <button 
          className="page-btn"
          disabled={page >= totalPages - 1} 
          onClick={() => fetchChats(page + 1)}
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default AdminChats;
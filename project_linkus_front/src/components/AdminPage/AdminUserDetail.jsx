import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import getCommonApi from "../../utils/Axios/getCommonApi";

function AdminUserDetail() {
  const { userId } = useParams();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  
  const [isBan, setIsBan] = useState(false);

  const [userPosts, setUserPosts] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);


  const [postPage, setPostPage] = useState(0);
  const [postTotal, setPostTotal] = useState(0);
  const [chatPage, setChatPage] = useState(0);
  const [chatTotal, setChatTotal] = useState(0);
  const [likePage, setLikePage] = useState(0);
  const [likeTotal, setLikeTotal] = useState(0);
  const [penaltyForm, setPenaltyForm] = useState({ reason: "", ttl: "" });

  const [banHistory, setBanHistory] = useState([]);
  const navigate = useNavigate();

  const loadUserPosts = async (pageNum = 0) => {
    try {
      const res = await getCommonApi().get(`/posts/user/${userId}?page=${pageNum}&size=20`);
      setUserPosts(res.data.content || []);
      setPostTotal(res.data.totalPages || 0);
      setPostPage(pageNum);
    } catch (e) { console.error(e); }
  };

  const loadUserChats = async (pageNum = 0) => {
    try {
      const res = await getCommonApi().get(`/chats/user/${userId}?page=${pageNum}&size=20`);
      setUserChats(res.data.content || []);
      setChatTotal(res.data.totalPages || 0);
      setChatPage(pageNum);
    } catch (e) { console.error(e); }
  };

  const loadLikedPosts = async (pageNum = 0) => {
    try {
      const res = await getCommonApi().get(`/posts/postlikes/${userId}?page=${pageNum}&size=20`);
      setLikedPosts(res.data.content || []);
      setLikeTotal(res.data.totalPages || 0);
      setLikePage(pageNum);
    } catch (e) { console.error(e); }
  };

  const loadBanStatus = async () => {
    try {
      const res = await getCommonApi().get("/admin/bans");
      const found = (res.data.content || []).find(b => b.userId === userId);
      setIsBan(!!found);
    } catch (e) { console.error(e); }
  };

  const loadBanHistory = async () => {
  try {
    const res = await getCommonApi().get(`/admin/bans/${userId}`);
    setBanHistory(res.data.content || res.data || []);
  } catch (e) {
    console.error("정지 이력 조회 실패", e);
  }
};

 
  const deletePost = async (postId) => {
    if (window.confirm(`${postId}번 게시글을 정말 삭제하시겠습니까?`)) {
      try {
        await getCommonApi().delete(`/admin/posts/${postId}`);
        alert("삭제되었습니다.");
        loadUserPosts(postPage); 
      } catch (error) {
        alert("삭제 실패: " + error.message);
      }
    }
  };

  const deleteChat = async (chatId) => {
      if (window.confirm(`${chatId}번 채팅을 정말 삭제하시겠습니까?`)) {
        try {
          await getCommonApi().delete(`/admin/chats/${chatId}`);
          alert("삭제되었습니다.");
          loadUserChats(chatPage); // 현재 페이지 유지하며 새로고침
        } catch (error) {
          alert("삭제 실패: " + error.message);
        }
      }
    };



  useEffect(() => {
    console.log("useEffect가 실행되었습니다. userId:", userId);
    // 2. state(user)가 없을 경우에만 API로 유저 정보를 조회
    const fetchUser = async () => {
      try {
        const res = await getCommonApi().get(`/admin/users/info/${userId}`); 
        setUser(res.data);
      } catch (e) {
        console.error("유저 정보를 불러올 수 없습니다.", e);
      }
    };

    if (!user || !user.nickName) {
      fetchUser();
    }
    loadUserPosts(0);
    loadUserChats(0);
    loadLikedPosts(0);
    loadBanStatus();
    loadBanHistory();
  }, [userId]);

  // 유저 밴 처리
  const handleBanUser = async () => {
    if (!penaltyForm.reason.trim()) return alert("처리 사유를 입력하세요.");
    if (!penaltyForm.ttl || parseInt(penaltyForm.ttl) < 0) return alert("정지 시간을 입력하세요.");
  
    if (!window.confirm(`${user.nickName}님을 정지하시겠습니까?`)) return;

    try {
      await getCommonApi().post("/admin/bans", { 
        userId: user.userId, 
        reason: penaltyForm.reason, 
        ttl: penaltyForm.ttl 
      });
      alert("정지 처리되었습니다.");
      setPenaltyForm({ reason: "", ttl: "" }); // 입력창 초기화
      loadBanStatus(); 
      loadBanHistory(); 
    } catch (error) { 
      alert("정지 처리 실패: " + error.message); 
    }
  };


  if (!user) return <div>유저 정보를 불러올 수 없습니다.</div>;

  return (
    <div className="admin-container">
      <div className="user-info-card">
        <h2 className="mb-4">{user.userId}님의 상세 정보</h2>
        <table className="user-info-table">
          <tbody>
            <tr><th>아이디</th><td>{user.userId}</td><th>레벨</th><td>{user.level}</td></tr>
            <tr><th>이메일</th><td>{user.email || "미등록"}</td><th>전화번호</th><td>{user.callNum || "미등록"}</td></tr>
            <tr><th>성별</th><td>{user.gender || "미등록"}</td><th>생년월일</th><td>{user.dateOfBirth || "미등록"}</td></tr>
            <tr><th>구글</th><td >{user.googleAccountLink || "미등록"}</td><th>카카오</th><td>{user.kakaoAccountLink || "미등록"}</td></tr>
            <tr><th>권한</th><td colSpan="3">{user.role}</td></tr>
            
          </tbody>
        </table>

      
        <div style={{ marginTop: "20px" }}>
          {!isBan ? (
            <>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input 
                  placeholder="정지 사유" 
                  value={penaltyForm.reason} 
                  onChange={(e) => setPenaltyForm({...penaltyForm, reason: e.target.value})} 
                />
                <input 
                  type="number" 
                  placeholder="시간(Hour)" 
                  value={penaltyForm.ttl} 
                  onChange={(e) => setPenaltyForm({...penaltyForm, ttl: e.target.value})} 
                />
              
              <button onClick={handleBanUser} style={{ backgroundColor: "#ff4d4d", color: "white",borderRadius: "6px", border: "1px solid #d1d9e0", padding: "6px 12px"}}>
               BAN 처리
              </button>
            </div>
            </>
          ) : (
            <p style={{ color: "#ff4d4d", fontWeight: "bold" }}>현재 정지 중인 유저입니다.</p>
          )}
        </div>
      </div>

      <div className="ban-history-section" style={{ marginTop: "30px" }}>
      <h3 className="mb-4">정지 이력</h3>
      <table style={{ marginBottom: "30px" }}>
        <thead>
          <tr>
            <th>번호</th>
            <th>정지 사유</th>
            <th>정지 일자</th>
            <th>정지 기간</th>
          </tr>
        </thead>
        <tbody>
          {banHistory.length > 0 ? (
            banHistory.map((ban, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{ban.reason}</td>
                <td>{ban.createdAt ? ban.createdAt.substring(0, 10) : "기록없음"}</td>
                <td>{ban.ttl}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">정지 이력이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
      <hr />
    </div>


      <h3 className="mb-4">작성한 게시글</h3>
      <table>
        <thead><tr><th>게시글 ID</th><th>내용</th><th>관리</th></tr></thead>
        <tbody>
          {userPosts.map(p => <tr key={p.postId}><td>{p.postId}</td>
          <td 
            onClick={() => navigate(`/posts/${p.postId}`)} 
            style={{ cursor: "pointer"}}>
            {p.text}
          </td>
          <td>
          <button 
            onClick={() => deletePost(p.postId)}
            style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", cursor: "pointer" }}
          >
            삭제
          </button>
        </td>
        </tr>)}
        </tbody>
      </table>
      <div className="pagination-container">
        <button disabled={postPage === 0} onClick={() => loadUserPosts(postPage - 1)}>이전</button>
        <span>{postPage + 1} / {postTotal}</span>
        <button disabled={postPage >= postTotal - 1} onClick={() => loadUserPosts(postPage + 1)}>다음</button>
      </div>

      <h3 className="mb-4" style={{ borderLeft: "5px solid #8e6e58", paddingLeft: "15px", color: "#333" }}>작성한 채팅</h3>
      <table>
        <thead><tr><th>채팅 ID</th><th>내용</th><th>관리</th></tr></thead>
        <tbody>
          {userChats.map(p => <tr key={p.chatId}><td>{p.chatId}</td><td>{p.text}</td>
          <td>
          <button 
            onClick={() => deleteChat(p.chatId)}
            style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", cursor: "pointer" }}
          >
            삭제
          </button>
        </td>
        </tr>)}
        </tbody>
      </table>
      <div className="pagination-container">
        <button disabled={chatPage === 0} onClick={() => loadUserChats(chatPage - 1)}>이전</button>
        <span>{chatPage + 1} / {chatTotal}</span>
        <button disabled={chatPage >= chatTotal - 1} onClick={() => loadUserChats(chatPage + 1)}>다음</button>
      </div>

      <h3 className="mb-4" style={{ borderLeft: "5px solid #8e6e58", paddingLeft: "15px", color: "#333" }}>좋아요한 게시글</h3>
      <table>
        <thead><tr><th>게시글 ID</th><th>내용</th></tr></thead>
        <tbody>
          {likedPosts.map(p => <tr key={p.postId}><td>{p.postId}</td>
          <td 
            onClick={() => navigate(`/posts/${p.postId}`)} 
            style={{ cursor: "pointer"}}>
            {p.text}
          </td>
          </tr>)}
        </tbody>
      </table>
      <div className="pagination-container">
        <button disabled={likePage === 0} onClick={() => loadLikedPosts(likePage - 1)}>이전</button>
        <span>{likePage + 1} / {likeTotal}</span>
        <button disabled={likePage >= likeTotal - 1} onClick={() => loadLikedPosts(likePage + 1)}>다음</button>
      </div>
    </div>
  );
}

export default AdminUserDetail;
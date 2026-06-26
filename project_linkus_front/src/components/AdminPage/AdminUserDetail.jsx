import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import getCommonApi from "../../utils/Axios/getCommonApi";

function AdminUserDetail() {
  const { userId } = useParams();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  
  const [isBan, setIsBan] = useState(false);
  const [banId, setBanId] = useState(null);

  const [userPosts, setUserPosts] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);


  const [postPage, setPostPage] = useState(0);
  const [postTotal, setPostTotal] = useState(0);
  const [chatPage, setChatPage] = useState(0);
  const [chatTotal, setChatTotal] = useState(0);
  const [likePage, setLikePage] = useState(0);
  const [likeTotal, setLikeTotal] = useState(0);

  const [banHistory, setBanHistory] = useState([]);

  const loadUserPosts = async (pageNum = 0) => {
    try {
      const res = await getCommonApi().get(`/posts/user/${userId}?page=${pageNum}&size=20`);
      setUserPosts(res.data.content || []);
      setPostTotal(res.data.totalPages || 0);
      setPostPage(pageNum);
    } catch (e) { console.error(e); }
  };

  // const loadUserChats = async (pageNum = 0) => {
  //   try {
  //     const res = await getCommonApi().get(`/chats/${userId}?page=${pageNum}&size=20`);
  //     setUserChats(res.data.content || []);
  //     setChatTotal(res.data.totalPages || 0);
  //     setChatPage(pageNum);
  //   } catch (e) { console.error(e); }
  // };

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
      setBanId(found ? found.id : null);
    } catch (e) { console.error(e); }
  };

  const loadBanHistory = async () => {
  try {
    const res = await getCommonApi().get(`/admin/bans/${userId}`);
    // res.data가 PageResponse 형태라면 content를, 리스트라면 그대로 사용
    setBanHistory(res.data.content || res.data || []);
  } catch (e) {
    console.error("정지 이력 조회 실패", e);
  }
};

  useEffect(() => {
    console.log("useEffect가 실행되었습니다. userId:", userId);
    // 2. state(user)가 없을 경우에만 API로 유저 정보를 조회
    const fetchUser = async () => {
      try {
        const res = await getCommonApi().get(`/admin/users/info/${userId}`); 
        console.log("유저 상세 데이터:", res.data);
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
    const reason = prompt(`${user.nickName}님을 밴 처리하시겠습니까?\n밴 사유를 입력해주세요.`);
    if (!reason) return;
    try {
      await getCommonApi().post("/admin/bans", { userId: user.userId, reason, ttl: 24 });
      alert("밴 처리되었습니다.");
      loadBanStatus(); // 상태 새로고침
    } catch (error) { alert("밴 처리 실패: " + error.message); }
  };

  // 밴 해제
  const handleUnbanUser = async () => {
    if (window.confirm("밴을 해제하시겠습니까?")) {
      try {
        await getCommonApi().delete(`/admin/bans/${banId}`);
        alert("밴이 해제되었습니다.");
        loadBanStatus(); // 상태 새로고침
      } catch (e) { alert("해제 실패"); }
    }
  };

  if (!user) return <div>유저 정보를 불러올 수 없습니다.</div>;

  return (
    <div className="admin-container">
      <div className="user-info-card">
        <h2>{user.nickName}님의 상세 정보</h2>
        <div className="info-grid">
          <div><strong>아이디:</strong> {user.userId}</div>
          <div><strong>닉네임:</strong> {user.nickName}</div>
          <div><strong>레벨:</strong> {user.level}</div>
          <div><strong>전화번호:</strong> {user.callNum || "미등록"}</div>
          <div><strong>성별:</strong> {user.gender || "미등록"}</div>
          <div><strong>권한:</strong> {user.role}</div>
        </div>

        <div style={{ marginTop: "20px" }}>
          {isBan ? (
            <button onClick={handleUnbanUser} style={{ backgroundColor: "#28a745", color: "white", padding: "10px 10px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              BAN 해제
            </button>
          ) : (
            <button onClick={handleBanUser} style={{ backgroundColor: "#ff4d4d", color: "white", padding: "10px 10px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              BAN
            </button>
          )}
        </div>
      </div>

      <div className="ban-history-section" style={{ marginTop: "30px" }}>
      <h3>정지 이력</h3>
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
              <td colSpan="3">정지 이력이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
      <hr />
    </div>


      <h3>작성한 게시글</h3>
      <table>
        <thead><tr><th>번호</th><th>내용</th></tr></thead>
        <tbody>
          {userPosts.map(p => <tr key={p.postId}><td>{p.postId}</td><td>{p.text}</td></tr>)}
        </tbody>
      </table>
      <div className="pagination-container">
        <button disabled={postPage === 0} onClick={() => loadUserPosts(postPage - 1)}>이전</button>
        <span>{postPage + 1} / {postTotal}</span>
        <button disabled={postPage >= postTotal - 1} onClick={() => loadUserPosts(postPage + 1)}>다음</button>
      </div>

      <h3>작성한 채팅</h3>
      <table>
        <thead><tr><th>번호</th><th>내용</th></tr></thead>
        <tbody>
          {userChats.map(p => <tr key={p.chatId}><td>{p.chatId}</td><td>{p.text}</td></tr>)}
        </tbody>
      </table>
      <div className="pagination-container">
        <button disabled={chatPage === 0} onClick={() => loadUserChats(chatPage - 1)}>이전</button>
        <span>{chatPage + 1} / {chatTotal}</span>
        <button disabled={chatPage >= chatTotal - 1} onClick={() => loadUserChats(chatPage + 1)}>다음</button>
      </div>

      <h3>좋아요한 게시글</h3>
      <table>
        <thead><tr><th>번호</th><th>내용</th></tr></thead>
        <tbody>
          {likedPosts.map(p => <tr key={p.postId}><td>{p.postId}</td><td>{p.text}</td></tr>)}
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
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import getCommonApi from "../../utils/Axios/getCommonApi";

function AdminUserDetail() {
  const { userId } = useParams();
  const location = useLocation();
  const [user] = useState(location.state?.user || null);
  
  const [isBan, setIsBan] = useState(false);
  const [banId, setBanId] = useState(null);

  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);


  const [postPage, setPostPage] = useState(0);
  const [postTotal, setPostTotal] = useState(0);
  const [likePage, setLikePage] = useState(0);
  const [likeTotal, setLikeTotal] = useState(0);

  const loadUserPosts = async (pageNum = 0) => {
    try {
      const res = await getCommonApi().get(`/posts/user/${userId}?page=${pageNum}&size=20`);
      setUserPosts(res.data.content || []);
      setPostTotal(res.data.totalPages || 0);
      setPostPage(pageNum);
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
      setBanId(found ? found.id : null);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadUserPosts(0);
    loadLikedPosts(0);
    loadBanStatus();
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
            <button onClick={handleUnbanUser} style={{ backgroundColor: "#28a745", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              BAN 해제
            </button>
          ) : (
            <button onClick={handleBanUser} style={{ backgroundColor: "#ff4d4d", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              BAN
            </button>
          )}
        </div>
      </div>

      <hr />

      <h2>{user.nickName}님의 활동 상세</h2>
      
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
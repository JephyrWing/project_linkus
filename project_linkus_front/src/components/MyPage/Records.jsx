import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getCommonApi from "../../utils/Axios/getCommonApi";
import "./records.css";

function Records() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [myPosts, setMyPosts] = useState([]);
  const [postPage, setPostPage] = useState(0);
  const [postTotal, setPostTotal] = useState(0);

  const [likedPosts, setLikedPosts] = useState([]);
  const [likePage, setLikePage] = useState(0);
  const [likeTotal, setLikeTotal] = useState(0);

  // 작성한 글 조회
  const fetchMyPosts = async (pageNum = 0) => {
    try {
      const res = await getCommonApi().get(`/posts/user/${userId}?page=${pageNum}&size=10`);
      setMyPosts(res.data.content || []);
      setPostTotal(res.data.totalPages || 0);
      setPostPage(pageNum);
    } catch (error) {
      console.error("작성글 조회 실패: ", error);
    }
  };

  // 좋아요한 글 조회
  const fetchLikedPosts = async (pageNum = 0) => {
    try {
      const res = await getCommonApi().get(`/posts/postlikes/${userId}?page=${pageNum}&size=10`);
      setLikedPosts(res.data.content || []);
      setLikeTotal(res.data.totalPages || 0);
      setLikePage(pageNum);
    } catch (error) {
      console.error("좋아요글 조회 실패: ", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMyPosts(0);
      fetchLikedPosts(0);
    }
  }, [userId]);

  return (
    <div className="myrecord-container">
      <h1 className="myrecord-title">나의 활동 내역</h1>

      {/* 작성 글 섹션 */}
      <section className="posts-section">
        <h2 className="posts-title">내가 작성한 글</h2>
        <table className="posts-table">
          <thead>
            <tr><th>번호</th><th>작성자</th><th>내용</th><th>❤︎</th><th>위치</th></tr>
          </thead>
          <tbody>
            {myPosts.map((post, index) => (
              <tr key={post.id || index}>
                <td>{index + 1 + (postPage * 10)}</td>
                <td>{post.userId || ""}</td>
                <td>{post.text || ""}</td>
                <td>{post.likeNum ?? 0}</td>
                <td>
                  <button className="map-button" onClick={() => navigate(`/map/${post.id}`)}>지도 보기</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* 작성 글*/}
        <div className="pagination-container">
          <button disabled={postPage === 0} onClick={() => fetchMyPosts(postPage - 1)}>이전</button>
          <span>{postPage + 1} / {postTotal || 1}</span>
          <button disabled={postPage >= postTotal - 1} onClick={() => fetchMyPosts(postPage + 1)}>다음</button>
        </div>
      </section>

      {/* 좋아요 한 글 섹션 */}
      <section className="likes-section">
        <h2 className="likes-title">좋아요한 글</h2>
        <table className="likes-table">
          <thead>
            <tr><th>번호</th><th>작성자</th><th>내용</th><th>❤︎</th><th>위치</th></tr>
          </thead>
          <tbody>
            {likedPosts.map((post, index) => (
              <tr key={post.id || index}>
                <td>{index + 1 + (likePage * 10)}</td>
                <td>{post.userId}</td>
                <td>{post.text}</td>
                <td>{post.likeNum}</td>
                <td>
                  <button className="map-button" onClick={() => navigate(`/map/${post.id}`)}>지도 보기</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 좋아요 글*/}
        <div className="pagination-container">
          <button disabled={likePage === 0} onClick={() => fetchLikedPosts(likePage - 1)}>이전</button>
          <span>{likePage + 1} / {likeTotal || 1}</span>
          <button disabled={likePage >= likeTotal - 1} onClick={() => fetchLikedPosts(likePage + 1)}>다음</button>
        </div>
      </section>
    </div>
  );
}

export default Records;
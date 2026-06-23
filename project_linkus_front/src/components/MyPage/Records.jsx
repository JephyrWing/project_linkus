import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getCommonApi from "../../utils/Axios/getCommonApi";
import "./records.css";

function Records() {
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] =useState([]);

  const userId = localStorage.getItem("userId"); 

  useEffect(() => {
    const fetchPosts = async () => {
    console.log("백엔드로 보낼 userId:", userId);

    try {
      const myRecords = await getCommonApi().get(`/posts/user/${userId}`);
      setMyPosts(myRecords.data.content); 

      const mylikeRecords = await getCommonApi().get(`/posts/postlikes/${userId}`);
      setLikedPosts(mylikeRecords.data.content); 
    } catch (error) {
      console.error("데이터 조회 실패: ", error);
    }
  };

  if (userId) fetchPosts();
}, [userId]);


  return (
    <div className="myrecord-container">
      <h1 className="myrecord-title">나의 활동 내역</h1>

      {/* 작성 글 섹션 */}
      <section className="posts-section">
        <h2 className="posts-title">내가 작성한 글</h2>
        <table className="posts-table">
          <thead>
            <tr>
              <th>번호</th><th>작성자</th><th>내용</th><th>❤︎</th><th>위치</th>
            </tr>
          </thead>
          <tbody>
            {myPosts.map((post, index) => (
              <tr key={post.id}>
                <td>{index + 1}</td>
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
      </section>

      {/* 좋아요 한 글 섹션 */}
      <section className="likes-section">
        <h2 className="likes-title">좋아요한 글</h2>
        <table className="likes-table">
          <thead>
            <tr>
              <th>번호</th><th>작성자</th><th>내용</th><th>❤︎</th><th>위치</th>
            </tr>
          </thead>
          <tbody>
            {likedPosts.map((post, index) => (
              <tr key={post.id}>
                <td>{index + 1}</td>
                <td>{post.userId}</td>
                <td>{post.text}</td>
                <td>{post.likeNum}</td>
                <td>
                  <button 
                    className="map-button" 
                    onClick={() => navigate(`/map/${post.id}`)}
                  >
                    지도 보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Records;
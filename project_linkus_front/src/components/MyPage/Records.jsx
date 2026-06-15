import { Link, useNavigate } from "react-router-dom";
import "./records.css";

function Records() {
  const navigate = useNavigate();

  const myPosts = [
    { id: 1, userId: "asd", text: "첫번째 게시글 첫번째 게시글 첫번째 게시글 첫번째 게시글 첫번째 게시글 첫번째 게시글 첫번째 게시글", likeNum: 3, location: "dd" },
    { id: 2, userId: "asd", text: "두번째 게시글", likeNum: 9, location: "dd" },
    { id: 3, userId: "asd", text: "Encountered two children", likeNum: 9, location: "dd" },
    { id: 4, userId: "asd", text: "촉촉한 초코칩", likeNum: 4424, location: "dd" },

  ];

  const likedPosts = [
    { id: 101, nickName: "ddd", text: "Encountered two children", likeNum: 20, location: "dd" },
    { id: 500, nickName: "gfd", text: " with the same key, `101`. Keys should be unique so that components ", likeNum: 4, location: "dd" },
    { id: 455, nickName: "wsdfksdlfks", text: "@react-refresh:228 An error occurred in the <td> component.", likeNum: 1, location: "dd" },
    { id: 71, nickName: "asdalskd", text: "나의 활동 내역", likeNum: 77, location: "dd" },
    { id: 11, nickName: "sdffgf", text: "집갈래", likeNum: 175, location: "dd" }
  ];

  return (
    <div className="myrecord-container">
      <h1 className="myrecord-title">나의 활동 내역</h1>

      {/* 작성 글 섹션 */}
      <section className="posts-section">
        <h2 className="posts-title">내가 작성한 글</h2>
        <table className="posts-table">
          <thead>
            <tr>
              <th>번호</th><th>작성자</th><th>내용</th><th>🖤❤️♥🤍♡̇-`♡´-❤︎</th><th>위치</th>
            </tr>
          </thead>
          <tbody>
            {myPosts.map((post, index) => (
              <tr key={post.id}>
                <td>{index + 1}</td>
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
      </section>

      {/* 좋아요 한 글 섹션 */}
      <section className="likes-section">
        <h2 className="likes-title">좋아요한 글</h2>
        <table className="likes-table">
          <thead>
            <tr>
              <th>번호</th><th>작성자</th><th>내용</th><th>🖤❤️♥🤍♡̇-`♡´-❤︎</th><th>위치</th>
            </tr>
          </thead>
          <tbody>
            {likedPosts.map((post, index) => (
              <tr key={post.id}>
                <td>{index + 1}</td>
                <td>{post.nickName}</td>
                <td>{post.text}</td>
                <td>{post.likeNum}</td>
                <td>
                  <button className="map-button" onClick={() => navigate(`/map/${post.id}`)}>지도 보기</button>
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
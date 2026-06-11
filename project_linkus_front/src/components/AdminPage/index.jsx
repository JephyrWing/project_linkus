import { useNavigate } from "react-router-dom";
import "./adminpage.css";

function AdminPage() {
  const navigate = useNavigate();

  const myPosts = [
    {
      id: 1,
      userId: "asd",
      text: "첫번째 게시글 첫번째 게시글 첫번째 게시글 첫번째 게시글 첫번째 게시글 첫번째 게시글 첫번째 게시글",
      location: "dd",
    },
    {
      id: 2,
      userId: "asd",
      text: "두번째 게시글",
      location: "dd",
    },
    {
      id: 3,
      userId: "asd",
      text: "Encountered two children",
      location: "dd",
    },
    {
      id: 4,
      userId: "asd",
      text: "촉촉한 초코칩",
      location: "dd",
    },
  ];

  const likedPosts = [
    {
      id: 101,
      nickName: "ddd",
      text: "Encountered two children",
      likeNum: 20,
      location: "dd",
    },
    {
      id: 500,
      nickName: "gfd",
      text: "with the same key, `101`. Keys should be unique so that components",
      likeNum: 4,
      location: "dd",
    },
    {
      id: 455,
      nickName: "wsdfksdlfks",
      text: "@react-refresh:228 An error occurred in the <td> component.",
      likeNum: 1,
      location: "dd",
    },
    {
      id: 71,
      nickName: "asdalskd",
      text: "나의 활동 내역",
      likeNum: 77,
      location: "dd",
    },
    {
      id: 11,
      nickName: "sdffgf",
      text: "집갈래",
      likeNum: 175,
      location: "dd",
    },
  ];

  return (
    <div className="admin-container">
      <h1 className="admin-title">관리자 페이지</h1>

      <section className="admin-posts-section">
        <h2 className="admin-posts-title">회원 목록 및 회원 관리</h2>

        <table className="admin-posts-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>회원</th>
              <th>내용</th>
              <th>세부사항</th>
            </tr>
          </thead>

          <tbody>
  {myPosts.map((post, index) => (
    <tr key={post.id}>
      <td>{index + 1}</td>
      <td>{post.userId}</td>
      <td>{post.text}</td>
      <td>
        <button
          className="admin-map-button"
          onClick={() => navigate(`/map/${post.id}`)}
        >
          click
        </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </section>

      <section className="admin-likes-section">
        <h2 className="admin-likes-title">필터링 추가</h2>

        <table className="admin-likes-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>작성자</th>
              <th>내용</th>
              <th>좋아요</th>
              <th>위치</th>
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
                  <button
                    className="admin-map-button"
                    onClick={() => navigate(`/map/${post.id}`)}
                  >
                    추가하기
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

export default AdminPage;
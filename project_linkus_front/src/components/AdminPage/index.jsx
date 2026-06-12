import { useNavigate } from "react-router-dom";
import "./adminpage.css";

function AdminPage() {
  const navigate = useNavigate();

  const myPosts = [
    {
      id: 1,
      userId: "asd",
      text: "회원 정보",
    },
    {
      id: 2,
      userId: "asd",
      text: "회원 정보",
    },
    {
      id: 3,
      userId: "asd",
      text: "회원 정보",
    },
    {
      id: 4,
      userId: "asd",
      text: "회원 정보",
    },
  ];

  const filterPosts = [
    {
      id: 101,
      text: "filter_text",
    },
  ];

  return (
    <div className="admin-container">
      <h1 className="admin-title">관리자 페이지</h1>

      <section className="admin-user-section">
        <h2 className="admin-user-title">회원 목록 및 회원 관리</h2>

        <table className="admin-user-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>회원</th>
              <th>내용</th>
              <th>세부사항</th>
            </tr>
          </thead>

          <tbody>
            {myPosts.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.userId}</td>
                <td>{user.text}</td>
                <td>
                  <button
                    className="admin-action-button"
                    onClick={() => navigate(`/adminpage/user/${user.id}`)}
                  >
                    click
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-filterPosts">
        <h2 className="admin-filter-title">필터링 추가</h2>

        <table className="admin-filter-table">
          <thead>
            <tr>
              <th>내용</th>
              <th>등록</th>
            </tr>
          </thead>

          <tbody>
            {filterPosts.map((filter_text, index) => (
              <tr key={filter_text.id}>
                {/* 필터링 문구를 입력하는 input */}
                <td>
                  <input
                    type="text"
                    className="admin-filter-input"
                    placeholder="filter_text"
                  />
                </td>
                 {/* 등록 버튼 칸 */}
                <td>
                  <button
                    className="admin-action-button"
                    onClick={() => navigate(`/map/${filter_text.id}`)}
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

// 신고 페이지
import { useNavigate } from "react-router-dom";
import "./report.css";

function Report() {
  const navigate = useNavigate();

   const reportFilterPosts = [
    {
      id: 101,
      text: "filter_text"
    },
  ];

  const reportMyPosts = [
    {
      id: 1,
      userId: "asd",
      text: "콩순이컴퓨터",
      type: "P"
    },

    {
      id: 2,
      userId: "asd",
      text: "최종학력 와플대학",
      type: "P"
    },
    {
      id: 3,
      userId: "asd",
      text: "트리케라톱스 같은 게",
      type: "C"
    },
    {
      id: 4,
      userId: "asd",
      text: "브라키오사우르스 같은 게",
      type: "C"
    }
  ];

  return (
    <div className="report-container">
      <h1 className="report-title">신고 페이지</h1>
      <section className="report-filterPosts">
        <h2 className="report-filter-title">신고 추가</h2>

        <table className="report-filter-table">
          <thead>
            <tr>
              <th>내용</th>
              <th>등록</th>
            </tr>
          </thead>

          <tbody>
            {reportFilterPosts.map((report_filter_text, index) => (
              <tr key={report_filter_text.id}>
                {/* 필터링 문구를 입력하는 input */}
                <td>
                  <input
                    type="text"
                    className="report-filter-input"
                    placeholder="report_text"
                  />
                </td>
                {/* 등록 버튼 칸 */}
                <td>
                  <button
                    className="report-action-button"
                    onClick={() => navigate(`/map/${report_filter_text.id}`)}
                  >
                    add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="report-user-section">
        <h2 className="report-user-title">신고 목록</h2>

        <table className="report-user-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>회원</th>
              <th>CHAT/POST</th>
              <th>신고 내용</th>
              <th>해당 내역</th>
            </tr>
          </thead>

          <tbody>
            {reportMyPosts.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.userId}</td>
                <td>{user.type}</td>
                <td>{user.text}</td>
                <td>
                  <button
                    className="report-action-button"
                    onClick={() => navigate(`/report/user/${user.id}`)}
                  >
                    →
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

export default Report;

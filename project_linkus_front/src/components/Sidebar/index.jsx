import "./sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import { AiFillAlert } from "react-icons/ai"; // 신고페이지 아이콘

function Sidebar({ isOpen, onClose, user, setUser }) {
  const navigate = useNavigate(); // 클릭 시 해당 링크로 바로 이동시키기 위해 쓰는 함수

  const handleLogout = () => {
    setUser({ isLogIn: false, role: "guest" }); // 상태 초기화
    navigate("/"); // 홈으로 이동
    onClose();
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>LinkUs</h2>
        </div>

        <nav className="sidebar-menu">
          <Link to="/" onClick={onClose}>
            Home
          </Link>

          {user.isLogIn ? (
            <>
              <span className="logout-btn" onClick={handleLogout}>
                Logout
              </span>
              <Link to="/mypage">My Page</Link>

              {/* 관리자 권한 체크 */}
              {user.role === "admin" && <Link to="/adminpage">Admin Page</Link>}
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </nav>
        {/* 신고 버튼 */}
        <button
          className="sidebar-report-btn"
          onClick={() => {
            navigate("/report"); // 누르면 바로 신고 페이지로 이동하게 하기
            onClose();
          }}
        >
          <AiFillAlert />
        </button>
      </aside>
    </>
  );
}

export default Sidebar;

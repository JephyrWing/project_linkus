import "./sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import { AiFillAlert } from "react-icons/ai"; // 신고 아이콘
import { MdOutlineLogout } from "react-icons/md"; // 로그아웃 아이콘

function Sidebar({ isOpen, onClose, user, setUser }) {
  const navigate = useNavigate(); // 클릭 시 해당 링크로 바로 이동시키기 위해 쓰는 함수

  const handleLogout = () => {
    setUser({ isLogIn: false, role: "guest" }); // 상태 초기화, 즉 로그아웃 상태로 변환
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
              {/* 로그아웃 버튼 */}
              {/* onClick={handleLogout} : 클릭 이벤트 처리 */}
              <button className="sidebar-logout-btn" onClick={handleLogout}>
                <MdOutlineLogout />
              </button>
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
        {/* user.isLogIn이 true면: 신고 버튼이 로그인 위치
        user.isLogIn이 false면: 신고 버튼이 로그아웃 위치 */}
        <button
          className={`sidebar-report-btn ${
            user.isLogIn ? "login-position" : "logout-position"
          }`}
          onClick={() => {
            navigate("/report");
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

import "./sidebar.css";
import {Link, useNavigate} from "react-router-dom";

function Sidebar({ isOpen, onClose, user, setUser}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser({ isLogIn: false, role: 'guest' }); // 상태 초기화
    navigate('/'); // 홈으로 이동
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
          <button className="sidebar-close" onClick={onClose}>
          </button>
        </div>

        <nav className="sidebar-menu" onClick={onClose}>
          <Link to="/">Home</Link>

          {user.isLogIn ? (
            <>
              <span className="logout-btn" onClick={handleLogout}>Logout
              </span>
              <Link to="/mypage">My Page</Link>
              
              {/* 관리자 권한 체크 */}
              {user.role === 'admin' && (
                <Link to="/adminpage">Admin Page</Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
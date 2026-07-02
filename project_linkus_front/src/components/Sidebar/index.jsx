import "./sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AiFillAlert } from "react-icons/ai"; // 신고 아이콘
import { MdOutlineLogout } from "react-icons/md"; // 로그아웃 아이콘
import { CgProfile } from "react-icons/cg"; // 프로필 아이콘
import getCommonApi from "../../utils/Axios/getCommonApi";

function Sidebar({ isOpen, onClose, user, setUser }) {
  const navigate = useNavigate(); // 클릭 시 해당 링크로 바로 이동시키기 위해 쓰는 함수
  const location = useLocation();
  const isPostMode = location.pathname.startsWith("/roadpost");
  const displayName = user.nickName || user.userId || "사용자";

  useEffect(() => {
    if (!isOpen || !user.isLogIn || !user.userId) return;

    getCommonApi().get(`/users/my/${user.userId}`)
      .then(({ data }) => {
        const nickName = data.nickName || data.userId || "";
        localStorage.setItem("nickName", nickName);
        setUser((prev) => ({ ...prev, nickName }));
      })
      .catch((error) => {
        console.error("사용자 정보 조회 실패", error);
      });
  }, [isOpen, user.isLogIn, user.userId, setUser]);

  // 로그아웃 버튼을 눌렀을 때 실행되는 함수
  const handleLogout = () => {
    // 로그인 상태를 false로 바꾸고, 권한을 guest로 초기화
    // 상태 초기화, 즉 로그아웃 상태로 변환
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("nickName");
    localStorage.removeItem("selectedMarkerCustom");
    localStorage.removeItem("selectedBoxCustom");
    localStorage.removeItem("chatCustom");

    setUser({ isLogIn: false, role: "guest", userId: "", nickName: "" });
    alert("로그아웃되었습니다.");
    navigate("/"); // 홈으로 이동
    onClose(); // 사이드 바 닫기
  };

  // 마커 꾸미기 메뉴를 눌렀을 때 실행됨
  // 로그인 사용자는 RoadPost의 마커 꾸미기 창으로 이동함
  // 비로그인 사용자는 안내 후 로그인 화면으로 보냄
  const handleCustomClick = () => {
    navigate(isPostMode ? "/roadpost?markerCustom=open" : "/?chatCustom=open");
    onClose();
  };

  return (
    <>
      {/* 사이드바 바깥 어두운 배경 */}
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      {/* 실제 사이드바 */}
      <aside
        className={`sidebar ${isOpen ? "open" : ""}`}
        data-tutorial="sidebar-panel"
      >
        <div className="sidebar-header">
          <h2>LinkUs</h2>
        </div>

        {/* 사이드바 메뉴 영역 */}
        <nav className="sidebar-menu">
          {/* 프로필 버튼: 로그인 상태일 때만 보임 */}
          {user.isLogIn && (
            <button
              className="sidebar-profile-btn"
              data-tutorial="sidebar-profile"
              onClick={() => {
                navigate("/mypage");
                onClose();
              }}
            >
              <CgProfile className="profile-icon" />

              <div className="profile-text">
                <span className="profile-name" title={displayName}>
                  {displayName}
                </span>
                <span className="profile-desc">내 정보 보기</span>
              </div>
            </button>
          )}

          <Link to="/" onClick={onClose}>
            Home
          </Link>
          {user.isLogIn && (
            <button
              type="button"
              className="sidebar-menu-button"
              data-tutorial="sidebar-custom"
              onClick={handleCustomClick}
            >
              {isPostMode ? "Decorating Markers" : "Decorating Chat"}
            </button>
          )}
          {user.isLogIn ? (
            <>
              {/* 로그아웃 버튼 */}

              {/* onClick={handleLogout} : 클릭 이벤트 처리 */}
              <button
                className="sidebar-logout-btn"
                onClick={handleLogout}
                data-tutorial="sidebar-logout"
              >
                <MdOutlineLogout />
              </button>

              {/* 마이페이지 */}
              <Link to="/mypage" onClick={onClose} data-tutorial="sidebar-mypage">
                My Page
              </Link>

              {/* 관리자 권한 체크 */}
              {/* 관리자일 때만 Admin Page 보임 */}
              {user.role === "ROLE_ADMIN" && (
                <Link to="/adminpage" onClick={onClose}>
                  Admin Page
                </Link>
              )}
            </>
          ) : (
            <>
              {/* 로그아웃 상태일 때 보이는 메뉴 */}
              <Link to="/login" onClick={onClose} data-tutorial="sidebar-login">
                Login
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                data-tutorial="sidebar-signup"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* 신고 버튼: 로그인 상태일 때만 보임 */}
        {user.isLogIn && (
          <button
            className="sidebar-report-btn login-position"
            data-tutorial="sidebar-report"
            onClick={() => {
              navigate("/report");
              onClose();
            }}
          >
            <AiFillAlert />
          </button>
        )}
      </aside>
    </>
  );
}

export default Sidebar;

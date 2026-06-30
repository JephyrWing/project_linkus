// Link: 페이지 이동을 위한 React Router 컴포넌트
// useNavigate: 버튼 클릭 등 특정 동작이 발생했을 때 코드로 페이지 이동시키는 함수
// useLocation: 현재 사용자가 보고 있는 주소 정보를 가져오는 함수
import { Link, useNavigate, useLocation } from "react-router-dom";

// React Bootstrap의 Button 컴포넌트
import Button from "react-bootstrap/Button";

// Navbar 전용 CSS
import "./navbar.css";

function Navbar({ onMenuClick }) {
  // navigate는 특정 경로로 이동시킬 때 사용
  // 예: navigate("/roadpost") → /roadpost 페이지로 이동
  const navigate = useNavigate();

  // location은 현재 주소 정보를 담고 있음
  // 예: location.pathname이 "/"이면 현재 홈 화면
  // 예: location.pathname이 "/roadpost"이면 현재 roadpost 화면
  const location = useLocation();

  /*
    turn 버튼을 보여줄 페이지를 정하는 변수

    현재 주소가 아래 셋 중 하나일 때만 true가 됨
    1. "/"         → 홈 화면
    2. "/mappost"  → 기본 지도 + 채팅 화면
    3. "/roadpost" → 게시글 지도 화면

    true이면 turn 버튼을 화면에 보여주고,
    false이면 turn 버튼을 숨김
  */
  const showTurnButton =
    location.pathname === "/" ||
    location.pathname === "/mappost" ||
    location.pathname === "/roadpost";

  /*
    turn 버튼을 클릭했을 때 실행되는 함수

    현재 /roadpost 페이지에 있다면:
    → /mappost로 이동

    그 외의 경우라면:
    → /roadpost로 이동

    즉,
    홈("/")에서 처음 turn을 누르면 /roadpost로 이동
    /roadpost에서 turn을 누르면 /mappost로 이동
    /mappost에서 turn을 누르면 /roadpost로 이동
  */
  const handleTurnClick = () => {
    if (location.pathname === "/roadpost") {
      navigate("/mappost");
    } else {
      navigate("/roadpost");
    }
  };

  return (
    <nav className="navbar">
      {/* 로고 영역 */}
      {/* Link to="/"이므로 로고를 클릭하면 홈 화면으로 이동 */}
      <Link to="/" className="logo" style={{ marginLeft: "30px" }}>
        LinkUs
      </Link>

      {/* 
        turn 버튼 영역

        showTurnButton이 true일 때만 렌더링됨
        즉 홈, mappost, roadpost에서만 보임

        로그인, 회원가입, 마이페이지, 신고 페이지 등에서는 보이지 않음
      */}
      {showTurnButton && (
        <div className="nav-button">
          {/* 버튼 클릭 시 handleTurnClick 함수 실행 */}
          <Button variant="outline-light" onClick={handleTurnClick}>
            turn
          </Button>
        </div>
      )}

      {/* 오른쪽 메뉴 영역 */}
      <ul className="nav-menu" style={{ marginRight: "30px" }}>
        {/* 
          햄버거 버튼

          onClick={onMenuClick}
          → App.jsx에서 전달받은 사이드바 열기 함수 실행
          → 버튼 클릭 시 오른쪽 사이드바가 열림
        */}
        <button className="hamburger" type="button" onClick={onMenuClick}>
          {/* 햄버거 아이콘의 첫 번째 줄 */}
          <span></span>

          {/* 햄버거 아이콘의 두 번째 줄 */}
          <span></span>

          {/* 햄버거 아이콘의 세 번째 줄 */}
          <span></span>
        </button>
      </ul>
    </nav>
  );
}

export default Navbar;
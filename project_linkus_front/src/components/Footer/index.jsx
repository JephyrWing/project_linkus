import { Link } from "react-router-dom";
import "./footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Footer 왼쪽 로고 영역 */}
        <div className="footer-logo-area">
          <Link to="/" className="footer-logo">
            LinkUs
          </Link>
        </div>

        {/* Footer 오른쪽 메뉴 영역 */}
        <nav className="footer-menu">
          <Link to="/service-intro">서비스 소개</Link>
          <Link to="/terms">이용약관</Link>
          <Link to="/privacy-policy">개인정보 처리방침</Link>
          <Link to="/report-guide">신고가이드</Link>
          <Link to="/linkus-pro">LinkUs PRO</Link>
        </nav>
      </div>

      <div className="footer-bottom">
        <span>Copyright ©LinkUs All rights reserved.</span>
        <span>Made by.LinkUs</span>
      </div>
    </footer>
  );
}

export default Footer;
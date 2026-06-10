import { Link } from "react-router-dom";
import "./footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <Link to="/" className="footer-logo" style={{marginLeft :"30px"}}>LinkUs</Link>
        </div>

        <div className="footer-right">
          <ul className="footer-menu">
            <li><Link to="/">서비스 소개</Link></li>
            <li><Link to="/">이용약관</Link></li>
            <li><Link to="/">개인정보 처리방침</Link></li>
            <li><Link to="/">신고가이드</Link></li>
            <li><Link to="/">LinkUs PRO</Link></li>
          </ul>

          <div className="footer-info">
            <span>Copyright ©LinkUs All rights reserved.</span>
            <span>Made by.LinkUs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;


import { Login, SignUp, MyPage } from 'react';
import { Link } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import './navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">LinkUs</div>

      <div className="nav-button">
        <Button variant="outline-light">Light</Button>
      </div>

      <ul className="nav-menu">
        <li><Link to = "/">홈</Link></li>
        <li><Link to = "/login">로그인</Link></li>
        <li><Link to = "/signup">회원가입</Link></li>
        <li><Link to = "/mypage">마이페이지</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
import { Login, SignUp, MyPage } from 'react';
import './navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">LinkUs</div>

      <ul className="nav-menu">
        <li>홈</li>
        <li>로그인</li>
        <li>회원가입</li>
        <li>마이페이지</li>
      </ul>
    </nav>
  );
}

export default Navbar;
import { Login, SignUp, MyPage } from 'react';
import { Link } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import './navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">LinkUs</Link>

      <div className="nav-button">
        <Button variant="outline-light">turn</Button>
      </div>

      <ul className="nav-menu">
        <li><Link to = "/">Home</Link></li>
        <li><Link to = "/login">Login</Link></li>
        <li><Link to = "/signup">Sign</Link></li>
        <li><Link to = "/mypage">My</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
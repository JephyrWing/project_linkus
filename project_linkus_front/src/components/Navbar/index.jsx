import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "react-bootstrap/Button";
import "./navbar.css";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTurnClick = () => {
    // /에서 눌러도 else로 들어가서 /roadpost로 가는 구조
    if (location.pathname === "/roadpost") {
      navigate("/mappost");
    } else {
      navigate("/roadpost");
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo" style={{ marginLeft: "30px" }}>
        LinkUs
      </Link>

      <div className="nav-button">
        <Button variant="outline-light" onClick={handleTurnClick}>
          turn
        </Button>
      </div>

      <ul className="nav-menu" style={{ marginRight: "30px" }}>
        <button className="hamburger" type="button" onClick={onMenuClick}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </ul>
    </nav>
  );
}

export default Navbar;
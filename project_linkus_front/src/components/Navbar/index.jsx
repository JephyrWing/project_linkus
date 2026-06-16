import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "react-bootstrap/Button";
import "./navbar.css";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTurnClick = () => {
    if (location.pathname === "/mappost") {
      navigate("/roadpost");
    } else {
      navigate("/mappost");
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
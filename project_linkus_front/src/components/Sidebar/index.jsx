import "./sidebar.css";

function Sidebar({ isOpen, onClose }) {
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

        <nav className="sidebar-menu">
          <a href="/">Home</a>
          <a href="/login">Login</a>
          <a href="/signup">Sign Up</a>
          <a href="/mypage">My Page</a>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
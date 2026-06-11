import "./livechat.css"

function LiveChat({ isOpen, onClose }) {
  return (
    <>
      <div
        className={`livechat-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`livechat ${isOpen ? "open" : ""}`}>
        <div className="livechat-header">
          <h2>LinkUs</h2>
          <button className="livechat-close" onClick={onClose}></button>
        </div>

        <nav className="livechat-menu">
          <a href="/">Home</a>
          <a href="/login">Login</a>
          <a href="/signup">Sign Up</a>
          <a href="/mypage">My Page</a>
        </nav>
      </aside>
    </>
  );
}

export default LiveChat;
import { Link } from "react-router-dom";
import "./records.css";

function Records() {
  return (
    <div className="myrecord-container">
      <h1 className="myrecord-title">나의 활동 내역</h1>

      {/* 게시글 */}
      <section className="posts-section">
        <h2 className="posts-title">작성 글</h2>
        <table className="posts-table">

        </table>
      </section>

      {/* 좋아요 */}
      <section className="likes-section">
        <h2 className="likes-title">좋아요한 글</h2>
        <table className="likes-table">

        </table>
      </section>
    </div>
  );
}

export default Records;
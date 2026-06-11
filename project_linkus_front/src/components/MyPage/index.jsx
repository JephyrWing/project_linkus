import { Link, Routes, Route } from "react-router-dom";
import "./mypage.css";


function MyPage() {


  return (
  <div className="mypage-container">
    <h1 className="mypage-title">MY PAGE</h1>
    
    <div className="mypage-menu-wrapper">
      <Link to="/mypage/update" className="menu-box">
      <div className="icon-circle">
        <i class="bi bi-person-fill-gear"></i>
      </div>
      <h3>회원 정보 수정</h3>
      </Link>

      <Link to="/mypage/records" className="menu-box">
        <div className="icon-circle"> 
          <i className="bi bi-file-text"></i>
        </div>
        <h3>내 게시글 보기</h3>
      </Link>
    </div>    
  </div> 
);
}

export default MyPage;
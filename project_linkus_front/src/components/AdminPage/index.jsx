import { useState } from "react";
import "./adminpage.css";
import AdminPosts from "./AdminPosts";
import AdminUsers from "./AdminUsers";
import AdminChats from "./AdminChats";
import AdminReports from "./AdminReports";
import AdminUserDetail from "./AdminUserDetail";
import { Routes, Route, useNavigate } from "react-router-dom";

function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className="admin-container">
      <h1 className="admin-title">관리자 페이지</h1>
      
      <nav className="admin-tabs">
        <button onClick={() => navigate("/adminpage/posts")}>전체 게시글</button>
        <button onClick={() => navigate("/adminpage/users")}>전체 회원</button>
        <button onClick={() => navigate("/adminpage/chats")}>전체 채팅</button>
        <button onClick={() => navigate("/adminpage/reports")}>신고 관리</button>
      </nav>

      <div className="admin-content">
        <Routes>
          <Route path="posts" element={<AdminPosts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="chats" element={<AdminChats />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="user/:userId" element={<AdminUserDetail />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminPage;
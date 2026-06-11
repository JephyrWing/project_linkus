import "./App.css";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import Navbar from "./components/Navbar";
import Main from "./components/Main";
import Footer from "./components/Footer";
import MyPage from "./components/MyPage";
import Update from "./components/MyPage/Update";
import Records from "./components/MyPage/Records";
import Sidebar from "./components/Sidebar";

import 'bootstrap-icons/font/bootstrap-icons.css';

import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useState } from "react";

function App() {
  /* isSidebarOpen =  사이드바가 열려 있는지 아닌지 저장하는 값*/
  /* setIsSidebarOpen = 그 값을 바꾸는 함수 */
  /* useState(false) =  처음에는 사이드바 닫힘*/
  const [ isSidebarOpen, setIsSidebarOpen ] = useState(false);

  return (
    <>
    {/* 사이드바 만들기 */}
    {/* ()=>setIsSidebarOpen(true) : 실행되면 isSidebarOpen 값을 true로 바꾼다 */}
    {/* isSidebarOpen = true : 사이드바 열림 */}
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)} 
        />

      <main>
      <Routes>
        /* 네브바에 링크 연결하기 위해 라우트 사용 */
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/update" element={<Update />} />
        <Route path="/mypage/records" element={<Records />} />
      </Routes>
      </main>

      <footer style={{ marginTop: "auto" }}>
        <Footer />
      </footer>
    </>
  );
}

export default App;

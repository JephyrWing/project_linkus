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
import AdminPage from "./components/AdminPage";
import Report from "./components/Report";
import MapPost from "./components/MapPost";
import RoadPost from "./components/MapPost/RoadPost";
import LiveChat from "./components/LiveChat";
import AdminReportDetail from "./components/AdminPage/AdminReportDetail.jsx";
import AdminPostDetail from "./components/AdminPage/AdminPostDetail.jsx";
import AdminFilters from "./components/AdminPage/AdminFilters.jsx";
import KakaoCallback from "./components/Login/KakaoCallback.jsx";
import GoogleCallback from "./components/Login/GoogleCallback.jsx";
import ServiceIntro from "./components/Footer/serviceIntro";
import Terms from "./components/Footer/terms";
import PrivacyPolicy from "./components/Footer/privacyPolicy";
import ReportGuide from "./components/Footer/reportGuide";
import LinkUsPro from "./components/Footer/linkUsPro";

// Splash 폴더 안의 index.jsx를 정확히 불러오기
import Splash from "./components/Splash/index.jsx";

import "bootstrap-icons/font/bootstrap-icons.css";

import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

function App() {
  /* isSidebarOpen =  사이드바가 열려 있는지 아닌지 저장하는 값 */
  /* setIsSidebarOpen = 그 값을 바꾸는 함수 */
  /* useState(false) =  처음에는 사이드바 닫힘 */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /*
    스플래시 페이지 도입

    새로고침할 때마다 App 컴포넌트가 처음부터 다시 실행되므로
    showSplash의 초기값이 true가 됨

    즉:
    새로고침 → showSplash true → Splash 표시
    2.5초 뒤 → showSplash false → 현재 주소의 페이지 표시

    여기서는 navigate("/")를 사용하지 않음
    이유:
    navigate("/")를 쓰면 roadpost, mappost, mypage 등
    다른 페이지에 있다가도 스플래시 종료 후 무조건 home으로 이동하는 문제가 생김
  */
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      // 스플래시 화면만 종료
      // 현재 URL은 그대로 유지됨
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // 로그인 상태 초기값
  const [user, setUser] = useState({
    isLogIn: !!localStorage.getItem("accessToken"),
    role: "guest",
    userId: localStorage.getItem("userId") || "",
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    if (token) {
      try {
        const decoded = jwtDecode(token.replace(/^Bearer\s+/i, ""));

        setUser({
          isLogIn: true,
          role: decoded.role,
          userId: userId,
        });
      } catch (e) {
        console.error("토큰해석실패", e);
        localStorage.removeItem("accessToken");
      }
    }
  }, []);

  /*
    showSplash가 true인 동안에는 Splash만 보여줌

    이 return이 실행되면 아래의 Navbar, Routes, Footer는 아직 렌더링되지 않음

    2.5초 뒤 showSplash가 false가 되면
    현재 주소에 맞는 Route가 그대로 나타남

    예:
    현재 주소가 /roadpost면 RoadPost 표시
    현재 주소가 /mypage면 MyPage 표시
    현재 주소가 /면 Main 표시
  */
  if (showSplash) return <Splash />;

  return (
    <>
      {/* 사이드바 만들기 */}
      {/* () => setIsSidebarOpen(true) : 실행되면 isSidebarOpen 값을 true로 바꾼다 */}
      {/* isSidebarOpen = true : 사이드바 열림 */}
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        setUser={setUser}
      />

      <main>
        <Routes>
          {/* 네브바에 링크 연결하기 위해 라우트 사용 */}
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route
            path="/oauth/kakao/callback"
            element={<KakaoCallback setUser={setUser} />}
          />
          <Route
            path="/oauth/google/callback"
            element={<GoogleCallback setUser={setUser} />}
          />
          <Route path="/signup" element={<Signup />} />

          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/update" element={<Update />} />
          <Route path="/mypage/records" element={<Records />} />

          <Route
            path="/adminpage/*"
            element={user.role === "ROLE_ADMIN" ? <AdminPage /> : <Main />}
          />

          <Route path="/report" element={<Report />} />
          <Route path="/mappost" element={<MapPost />} />
          <Route path="/map/:id" element={<MapPost />} />
          <Route path="/roadpost" element={<RoadPost />} />
          <Route path="/roadpost/:postId" element={<RoadPost />} />
          <Route path="/livechat" element={<LiveChat />} />
          <Route path="report/:reportId" element={<AdminReportDetail />} />
          <Route path="/posts/:postId" element={<AdminPostDetail />} />

          {/* Footer 하단 메뉴 페이지 */}
          <Route path="/service-intro" element={<ServiceIntro />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/report-guide" element={<ReportGuide />} />
          <Route path="/linkus-pro" element={<LinkUsPro />} />
        </Routes>
      </main>

      <footer style={{ marginTop: "auto" }}>
        <Footer />
      </footer>
    </>
  );
}

export default App;

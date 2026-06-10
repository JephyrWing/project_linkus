import "./App.css";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import Navbar from "./components/Navbar";
import Main from "./components/Main";
import Footer from "./components/Footer";
import MyPage from "./components/MyPage";
import Update from "./components/MyPage/Update";
import Records from "./components/MyPage/Records";

import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/update" element={<Update />} />
        <Route path="/mypage/records" element={<Records />} />
      </Routes>
      <footer style={{ marginTop: "auto" }}>
        <Footer />
      </footer>
    </>
  );
}

export default App;

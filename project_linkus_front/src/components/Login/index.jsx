import React, { useState } from 'react';
import "./login.css";
import {Link, useNavigate} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import getCommonApi from "../../utils/Axios/getCommonApi";

import kakaoLogo from "../../asserts/kakao.png"
import googleLogo from "../../asserts/google.png";



function Login({setUser}) {
  const navigate = useNavigate();
  const [ formData, setFormData ] = useState({
    userId: "",
    password: ""
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  const loginSubmit = async () => {
      try {
        const response = await getCommonApi().post(
          "/users/login",
          {
            userId: formData.userId,
            password: formData.password,
          },
        );
        
        const token = response.headers.authorization || response.headers["authorization"];
  

        if (token) {
          localStorage.setItem("accessToken", token);
          

          // 1. 토큰 해석해서 role 추출
          const decoded = jwtDecode(token.replace(/^Bearer\s+/i, ""));
          const userId =decoded.sub || decoded.userId;
          localStorage.setItem("userId", userId);
        
          // 2. App.jsx의 상태를 업데이트하여 앱 전체에 로그인 알림
          setUser({
            isLogIn: true,
            role: decoded.role,
            userId:userId
          });
          navigate("/");
        }
      } catch (error) {
        console.log("로그인실패: ", error);
        alert("로그인에 실패했습니다. 아이디, 비밀번호를 확인해주세요.");
      }
  };

  // 입력 후 엔터키로 로그인
  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      loginSubmit();
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === "google") {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI
        || `${window.location.origin}/oauth/google/callback`;

      if (!clientId) {
        alert("VITE_GOOGLE_CLIENT_ID 환경변수를 설정해주세요.");
        return;
      }

      const state = crypto.randomUUID();
      sessionStorage.setItem("googleOAuthState", state);

      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "openid email profile",
        state,
        prompt: "select_account",
      });

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      return;
    }

    if (provider !== "kakao") {
      return;
    }

    const restApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;
    const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI
      || `${window.location.origin}/oauth/kakao/callback`;

    if (!restApiKey) {
      alert("VITE_KAKAO_REST_API_KEY 환경변수를 설정해주세요.");
      return;
    }

    const state = crypto.randomUUID();
    sessionStorage.setItem("kakaoOAuthState", state);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: restApiKey,
      redirect_uri: redirectUri,
      state,
    });

    window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  };





  return (
    <div className="container">
      <div className="login-wrapper">
        <h1 className="logo">LinkUs</h1>

        <form className="login-form">
          {/* 아이디 입력 */}
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}            
            placeholder="아이디"
            className="login-Input"
          />

          {/* 비밀번호 입력 */}
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onKeyDown={handleEnterKey}
            placeholder="비밀번호"
            className="login-Input"
          />

          {/* 로그인 버튼 */}
          <button 
          type="button" 
          className="loginBtn"
          onClick={()=>{loginSubmit()}}          
          >로그인</button>
        </form>

        {/* 소셜 로그인 버튼 추가 */}
        <div className="social-login-container">
          <button className="social-btn btn-kakao" onClick={() => handleSocialLogin("kakao")}>
            <img src={kakaoLogo} alt="카카오" style={{ width: '20px' }} />
            카카오로 계속하기
          </button>
          <button className="social-btn btn-google" onClick={() => handleSocialLogin("google")}>
            <img src={googleLogo} alt="구글" style={{ width: '20px' }} />
            구글로 계속하기
          </button>
        </div>

        {/* 회원가입 하기 */}
        <div className="signupLinkContainer">
          <Link to ="/signup" className="signupLink">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

import React, { useState } from 'react';
import "./login.css";
import {Link} from "react-router-dom";
import axios from 'axios';

import kakaoLogo from "../../asserts/kakao.png"
import googleLogo from "../../asserts/google.png";



function Login() {
  const [ formData, setFormData ] = useState({
    userId: "",
    password: ""
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  const loginSubmit = () => {
    const loginData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/users/login",
          {
            userId: formData.userId,
            password: formData.password,
          },
        );
        
        const token = response.headers["authorization"];

        if (token) {
          localStorage.setItem("accessToken", token);
          console.log("Token : ", token);
        }
      } catch (error) {
        console.log("Error : ", error);
      }
    };
    loginData();
  };


  // ===================================================================
  // 소셜로그인 (수정 필요)
  // const handleSoialLogin = () => {};
  // ===================================================================





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
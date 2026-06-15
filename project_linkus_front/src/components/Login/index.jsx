import React, { useState } from 'react';
import "./login.css";
import {Link} from "react-router-dom";
import axios from 'axios';



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
import React, {useState} from "react";
import "./signup.css";
import {Link} from "react-router-dom"
import getCommonApi from "../../utils/Axios/getCommonApi";
import axios from 'axios';

import kakaoLogo from "../../asserts/kakao.png"
import googleLogo from "../../asserts/google.png";

function SignUp() {
  const [ formData, setFormData ] = useState({
    userId: "",
    password: "",
    nickName: "",
    dateOfBirth: "",
    gender: "select",
    callNum: ""
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const signupSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await getCommonApi().post("/users/signup", formData)
      alert("회원가입 성공")
      window.location.href = "/login";
    } catch(error){
      console.error("진짜 원인:", error)
      alert("회원가입 실패")
    }
    console.log('회원가입 정보:', formData);
  };


  // ===================================================================
  // 소셜회원가입 (수정 필요)
  // const handleSoialSignup = () => {};
  // ===================================================================


  return (
    <div className="container">
      <div className="signupBox">
        <h2 className="signupTitle">회원가입</h2>
        <form onSubmit={signupSubmit} className="signupForm">
          
          <div className="signup-Input">
            <label className="signupLabel">아이디</label>
            <input type="text" name="userId" value={formData.userId} onChange={handleChange} placeholder='아이디 입력' className="inputBox" />
          </div>
          
          <div className="signup-Input">
            <label className="signupLabel">비밀번호</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder='비밀번호 입력' className="inputBox" />
          </div>
          
          <div className="signup-Input">
            <label className="signupLabel">닉네임</label>
            <input type="text" name="nickName" value={formData.nickName} onChange={handleChange} placeholder='닉네임 입력' className="inputBox" />
          </div>
          
          <div className="signup-Input">
            <label className="signupLabel">생년월일</label>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="inputBox" />
          </div>
          
          <div className="signup-Input">
            <label className="signupLabel">성별</label>
            <div className="gender-Option">
              <label className="genderFont">
                <input type="radio" name="gender" value="Male" checked={formData.gender === "Male"}
                onChange={handleChange}
                /> 남자
             </label>

             <label className="genderFont">
                <input type="radio" name="gender" value="Female" checked={formData.gender === "Female"}
                onChange={handleChange}
                /> 여자
             </label>
             </div>
          </div>
          
          <div className="signup-Input">
            <label className="signupLabel">전화번호</label>
            <input type='tel' name='callNum' value={formData.callNum} onChange={handleChange} placeholder="010-XXXX-XXXX" className="inputBox"/>
          </div>
          
          <button type='submit' className="signupSubmitBtn">회원가입하기</button>
          <Link to = "/login" className="loginLink"> 로그인하러 가기 </Link>


          {/* 소셜 로그인 버튼 추가 */}
          
          <button type="button" className="social-Sign-btn btn-Sign-kakao" onClick={() => handleSocialSignup("kakao")}>
            <img src={kakaoLogo} alt="카카오" style={{ width: '20px' }} />
            카카오로 회원가입하기
          </button>
          <button type="button" className="social-Sign-btn btn-Sign-google" onClick={() => handleSocialSignup("google")}>
            <img src={googleLogo} alt="구글" style={{ width: '20px' }} />
            구글로 회원가입하기
          </button>              
        </form>
      </div>
    </div>
  );
}

export default SignUp;
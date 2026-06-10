import React, {useState} from "react";
import "./signup.css";
import {Link} from "react-router-dom"

function SignUp() {
  const [ formData, setFormData ] = useState({
    userId: "",
    password: "",
    nickname: "",
    birthdate: "",
    gender: "select",
    phoneNumber: ""
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const signupSubmit = (e) => {
    e.preventDefault();
    console.log('회원가입 정보:', formData);
  };


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
            <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} placeholder='닉네임 입력' className="inputBox" />
          </div>
          
          <div className="signup-Input">
            <label className="signupLabel">생년월일</label>
            <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} className="inputBox" />
          </div>
          
          <div className="signup-Input">
            <label className="signupLabel">성별</label>
            <div className="gender-Option">
              <label className="genderFont">
                <input type="radio" name="gender" value="male" checked={formData.gender === "male"}
                onChange={handleChange}
                /> 남자
             </label>

             <label className="genderFont">
                <input type="radio" name="gender" value="female" checked={formData.gender === "female"}
                onChange={handleChange}
                /> 여자
             </label>
             </div>
          </div>
          
          <div className="signup-Input">
            <label className="signupLabel">전화번호</label>
            <input type='tel' name='phoneNumber' value={formData.phoneNumber} onChange={handleChange} placeholder="010-XXXX-XXXX" className="inputBox"/>
          </div>
          
          <button type='submit' className="signupSubmitBtn">회원가입하기</button>
          <Link to = "/login" className="loginLink"> 로그인하러 가기 </Link>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
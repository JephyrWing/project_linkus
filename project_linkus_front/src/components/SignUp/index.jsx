import React, {useState} from "react";
import "./signup.css";

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
            <input type="text" name="userId" value={formData.userId} onChange={handleChange} placeholder='아이디 입력' className="regInput" />
          </div>
          
          <div className="signup-Input">
            <label className="signupLabel">비밀번호</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder='비밀번호 입력' className="regInput" />
          </div>
          
          <div className="signup-Input">
            <label className="signupLabel">닉네임</label>
            <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} placeholder='닉네임 입력' className="regInput" />
          </div>
          
          <div className="signup-Input">
            <label className="signupLabel">생년월일</label>
            <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} className="regInput" />
          </div>
          
          <div className="signup-Input">
            <label className="signupLabel">성별</label>
            <select name='gender' value={formData.gender} onChange={handleChange} className="regInput">
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>
          
          <div className="signup-Input">
            <label className="signupLabel">전화번호</label>
            <input type='tel' name='phoneNumber' value={formData.phoneNumber} onChange={handleChange} placeholder="010-XXXX-XXXX" className="regInput"/>
          </div>
          
          <button type='submit' className="signupSubmitBtn">회원가입하기</button>
          <button type='button' className="cancelBtn">로그인으로 돌아가기</button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
import React, { useState } from "react";
import { Link } from "react-router-dom";
import getCommonApi from "../../utils/Axios/getCommonApi";
import "./signup.css";

import kakaoLogo from "../../asserts/kakao.png";
import googleLogo from "../../asserts/google.png";

function SignUp() {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    email: "",
    dateOfBirth: "",
    gender: "select",
    callNum: "",
  });
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [confirmedUserId, setConfirmedUserId] = useState("");
  const [generatedEmailCode, setGeneratedEmailCode] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const makeEmailCode = () => String(Math.floor(100000 + Math.random() * 900000));

  const handleConfirmId = async (e) => {
    e.preventDefault();
    if (!formData.userId.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    try {
      const confirmResult = await getCommonApi().get(`/users/signup/idconfirm/${formData.userId}`);
      if (confirmResult.data === true) {
        alert("이미 존재하는 아이디입니다.");
        setConfirmedUserId("");
      } else {
        alert("사용 가능한 아이디입니다.");
        setConfirmedUserId(formData.userId);
      }
    } catch (error) {
      console.error("아이디 중복 확인 실패:", error);
      alert("아이디 중복 확인에 실패했습니다.");
    }
  };

  const handleSendEmailCode = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    const code = makeEmailCode();
    setIsSendingEmail(true);
    try {
      await getCommonApi().post("/users/signup/email/send", {
        email: formData.email,
        code,
      });
      setGeneratedEmailCode(code);
      setVerifiedEmail("");
      setEmailCode("");
      alert("인증 코드가 발송되었습니다.");
    } catch (error) {
      console.error("이메일 인증 코드 발송 실패:", error);
      alert(error.response?.data?.message || "이메일 인증 코드 발송에 실패했습니다.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleConfirmEmailCode = async (e) => {
    e.preventDefault();
    if (!generatedEmailCode) {
      alert("먼저 이메일 인증 코드를 받아주세요.");
      return;
    }
    if (emailCode.trim() !== generatedEmailCode) {
      alert("인증 코드가 일치하지 않습니다.");
      setVerifiedEmail("");
      return;
    }

    try {
      const response = await getCommonApi().get(`/users/signup/emailconfirm/${encodeURIComponent(formData.email)}`);
      if (response.data === true) {
        alert("이미 존재하는 회원입니다.");
        setVerifiedEmail("");
        return;
      }

      alert("이메일 인증이 완료되었습니다.");
      setVerifiedEmail(formData.email);
    } catch (error) {
      console.error("이메일 중복 확인 실패:", error);
      alert("이메일 중복 확인에 실패했습니다.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "userId") {
      setConfirmedUserId("");
    }
    if (name === "email") {
      setGeneratedEmailCode("");
      setVerifiedEmail("");
      setEmailCode("");
    }
  };

  const signupSubmit = async (e) => {
    e.preventDefault();
    if (formData.userId !== confirmedUserId) {
      alert("아이디 중복 확인을 완료해주세요.");
      return;
    }
    if (formData.email !== verifiedEmail) {
      alert("이메일 인증을 완료해주세요.");
      return;
    }
    if (formData.password !== passwordConfirm) {
      alert("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      await getCommonApi().post("/users/signup", formData);
      alert("회원가입에 성공했습니다.");
      window.location.href = "/login";
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert(error.response?.data?.message || "회원가입에 실패했습니다.");
    }
  };

  const handleSocialSignup = (provider) => {
    alert(`${provider} 회원가입은 아직 준비 중입니다.`);
  };

  return (
    <div className="container">
      <div className="signupBox">
        <h2 className="signupTitle">회원가입</h2>
        <form onSubmit={signupSubmit} className="signupForm">
          <div className="signup-Input">
            <label className="signupLabel">아이디</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="아이디 입력"
              className="inputBox"
            />
            <button onClick={handleConfirmId} className="signupSubmitBtn" style={{ height: "35px" }}>
              아이디 중복 확인
            </button>
          </div>

          <div className="signup-Input">
            <label className="signupLabel">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호 입력"
              className="inputBox"
            />
          </div>

          <div className="signup-Input">
            <label className="signupLabel">비밀번호 확인</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 재입력"
              className="inputBox"
            />
          </div>

          <div className="signup-Input">
            <label className="signupLabel">이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              className="inputBox"
            />
            <button
              onClick={handleSendEmailCode}
              className="signupSubmitBtn"
              style={{ height: "35px" }}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? "발송 중..." : "이메일 인증 코드 받기"}
            </button>
          </div>

          <div className="signup-Input">
            <label className="signupLabel">인증 코드</label>
            <input
              type="text"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              placeholder="6자리 인증 코드"
              className="inputBox"
            />
            <button onClick={handleConfirmEmailCode} className="signupSubmitBtn" style={{ height: "35px" }}>
              이메일 인증 확인
            </button>
          </div>

          <div className="signup-Input">
            <label className="signupLabel">생년월일</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="inputBox"
            />
          </div>

          <div className="signup-Input">
            <label className="signupLabel">성별</label>
            <div className="gender-Option">
              <label className="genderFont">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={formData.gender === "Male"}
                  onChange={handleChange}
                />{" "}
                남자
              </label>

              <label className="genderFont">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={formData.gender === "Female"}
                  onChange={handleChange}
                />{" "}
                여자
              </label>
            </div>
          </div>

          <div className="signup-Input">
            <label className="signupLabel">전화번호</label>
            <input
              type="tel"
              name="callNum"
              value={formData.callNum}
              onChange={handleChange}
              placeholder="010-XXXX-XXXX"
              className="inputBox"
            />
          </div>

          <button type="submit" className="signupSubmitBtn">
            회원가입하기
          </button>
          <Link to="/login" className="loginLink">
            로그인하러 가기
          </Link>

          <button
            type="button"
            className="social-Sign-btn btn-Sign-kakao"
            onClick={() => handleSocialSignup("kakao")}
          >
            <img src={kakaoLogo} alt="카카오" style={{ width: "20px" }} />
            카카오로 회원가입하기
          </button>
          <button
            type="button"
            className="social-Sign-btn btn-Sign-google"
            onClick={() => handleSocialSignup("google")}
          >
            <img src={googleLogo} alt="구글" style={{ width: "20px" }} />
            구글로 회원가입하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;

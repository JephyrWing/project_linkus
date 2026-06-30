import React, { useState } from "react";
import { Link } from "react-router-dom";
import getCommonApi from "../../utils/Axios/getCommonApi";
import "./signup.css";
import kakaoLogo from "../../asserts/kakao.png";
import googleLogo from "../../asserts/google.png";
import emailjs from '@emailjs/browser'

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
  const [verifingEmail, setVerifingEmail] = useState("");
  const emailjsSId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const emailjsTId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const emailjsPKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  
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

    // EmailJS 템플릿으로 보낼 변수 설정
    const templateParams = {
      to_email: formData.email,
      code: code,
    };
    setIsSendingEmail(true);

    // EmailJS로 전송
    emailjs
      .send(
        emailjsSId, // EmailJS에서 복사한 Service ID
        emailjsTId, // EmailJS에서 복사한 Template ID
        templateParams,
        emailjsPKey, // EmailJS에서 복사한 Public Key
      )
      .then((response) => {
        alert("인증 코드가 발송되었습니다.");
        setIsSendingEmail(false);
        setGeneratedEmailCode(code);
        setVerifingEmail(templateParams.to_email);
      })
      .catch((err) => {
        console.error("실패:", err);
        alert(
          err.response?.data?.message ||
            "이메일 인증 코드 발송에 실패했습니다.",
        );
        setIsSendingEmail(false);
      });
  }

  const handleConfirmEmailCode = async (e) => {
    e.preventDefault();
    if (!generatedEmailCode || verifingEmail !== formData.email) {
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

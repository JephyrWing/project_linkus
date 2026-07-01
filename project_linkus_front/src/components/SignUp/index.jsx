import React, { useState } from "react";
import { Link } from "react-router-dom";
import getCommonApi from "../../utils/Axios/getCommonApi";
import "./signup.css";
import kakaoLogo from "../../asserts/kakao.png";
import googleLogo from "../../asserts/google.png";
import emailjs from "@emailjs/browser";

function SignUp() {
  const [formData, setFormData] = useState({
    userId: "",
    nickName: "",
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

  // 아이디 중복 확인까지 끝났는지 확인함
  // 아이디를 바꾸면 confirmedUserId가 비워지므로 다시 중복 확인해야 함
  const isIdConfirmed =
    formData.userId.trim() !== "" && formData.userId === confirmedUserId;

  // 아이디 확인이 끝나야 비밀번호 입력 가능함
  const canInputPassword = isIdConfirmed;

  // 비밀번호를 입력해야 비밀번호 확인 입력 가능함
  const canInputPasswordConfirm =
    canInputPassword && formData.password.trim() !== "";

  // 비밀번호와 비밀번호 확인이 같아야 이메일 입력 가능함
  const isPasswordConfirmed =
    formData.password.trim() !== "" &&
    passwordConfirm.trim() !== "" &&
    formData.password === passwordConfirm;

  // 비밀번호 확인까지 끝나야 이메일 입력 가능함
  const canInputEmail = isPasswordConfirmed;

  // 이메일을 입력해야 인증 코드 받기 가능함
  const canSendEmailCode = canInputEmail && formData.email.trim() !== "";

  // 인증 코드가 발송된 이메일과 현재 입력된 이메일이 같아야 인증 코드 입력 가능함
  const canInputEmailCode =
    generatedEmailCode !== "" && verifingEmail === formData.email;

  // 이메일 인증이 끝나야 생년월일 입력 가능함
  const isEmailVerified =
    formData.email.trim() !== "" && formData.email === verifiedEmail;

  // 이메일 인증까지 끝나야 생년월일 입력 가능함
  const canInputDateOfBirth = isEmailVerified;

  // 생년월일을 입력해야 성별 선택 가능함
  const canInputGender = canInputDateOfBirth && formData.dateOfBirth !== "";

  // 성별을 선택해야 전화번호 입력 가능함
  const canInputCallNum = canInputGender && formData.gender !== "select";

  // 모든 순서가 끝나야 회원가입 버튼 클릭 가능함
  const canSubmitSignup = canInputCallNum && formData.callNum.trim() !== "";

  const makeEmailCode = () =>
    String(Math.floor(100000 + Math.random() * 900000));

  const handleConfirmId = async (e) => {
    e.preventDefault();
    if (!formData.userId.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    try {
      const confirmResult = await getCommonApi().get(
        `/users/signup/idconfirm/${formData.userId}`,
      );
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
  };

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
      const response = await getCommonApi().get(
        `/users/signup/emailconfirm/${encodeURIComponent(formData.email)}`,
      );
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

    setFormData((prev) => {
      const nextData = {
        ...prev,
        [name]: value,
      };

      // 아이디를 바꾸면 아이디 확인 이후 입력했던 값 전부 초기화함
      // 새 아이디 기준으로 다시 순서대로 입력하게 만들기 위함
      if (name === "userId") {
        setConfirmedUserId("");
        setPasswordConfirm("");
        setGeneratedEmailCode("");
        setEmailCode("");
        setVerifiedEmail("");
        setVerifingEmail("");

        return {
          ...nextData,
          password: "",
          email: "",
          dateOfBirth: "",
          gender: "select",
          callNum: "",
        };
      }

      // 비밀번호를 바꾸면 비밀번호 확인과 그 아래 단계 전부 다시 입력해야 함
      if (name === "password") {
        setPasswordConfirm("");
        setGeneratedEmailCode("");
        setEmailCode("");
        setVerifiedEmail("");
        setVerifingEmail("");

        return {
          ...nextData,
          email: "",
          dateOfBirth: "",
          gender: "select",
          callNum: "",
        };
      }

      // 이메일을 바꾸면 기존 인증 코드는 더 이상 유효하지 않음
      if (name === "email") {
        setGeneratedEmailCode("");
        setVerifiedEmail("");
        setEmailCode("");
        setVerifingEmail("");

        return {
          ...nextData,
          dateOfBirth: "",
          gender: "select",
          callNum: "",
        };
      }

      // 생년월일을 바꾸면 성별, 전화번호를 다시 입력하게 함
      if (name === "dateOfBirth") {
        return {
          ...nextData,
          gender: "select",
          callNum: "",
        };
      }

      // 성별을 바꾸면 전화번호를 다시 입력하게 함
      if (name === "gender") {
        return {
          ...nextData,
          callNum: "",
        };
      }

      return nextData;
    });
  };

  const handlePasswordConfirmChange = (e) => {
    const nextPasswordConfirm = e.target.value;

    setPasswordConfirm(nextPasswordConfirm);

    // 비밀번호 확인값이 바뀌면 이메일 인증 이후 단계는 다시 진행해야 함
    setFormData((prev) => ({
      ...prev,
      email: "",
      dateOfBirth: "",
      gender: "select",
      callNum: "",
    }));

    setGeneratedEmailCode("");
    setEmailCode("");
    setVerifiedEmail("");
    setVerifingEmail("");
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
      const redirectUri =
        import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
        `${window.location.origin}/oauth/google/callback`;

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
    const redirectUri =
      import.meta.env.VITE_KAKAO_REDIRECT_URI ||
      `${window.location.origin}/oauth/kakao/callback`;

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
            <button
              onClick={handleConfirmId}
              className="signupSubmitBtn"
              style={{ height: "35px" }}
              disabled={!formData.userId.trim()}
            >
              아이디 중복 확인
            </button>
          </div>

          <div className="signup-Input">
            <label className="signupLabel">닉네임</label>
            <input
              type="text"
              name="nickName"
              value={formData.nickName}
              onChange={handleChange}
              placeholder="닉네임 입력"
              className="inputBox"
              disabled={!canInputPassword}
            />
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
              disabled={!canInputPassword}
            />
          </div>

          <div className="signup-Input">
            <label className="signupLabel">비밀번호 확인</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={handlePasswordConfirmChange}
              placeholder="비밀번호 재입력"
              className="inputBox"
              disabled={!canInputPasswordConfirm}
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
              disabled={!canInputEmail}
            />
            <button
              onClick={handleSendEmailCode}
              className="signupSubmitBtn"
              style={{ height: "35px" }}
              disabled={!canSendEmailCode || isSendingEmail}
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
              disabled={!canInputEmailCode}
            />
            <button
              onClick={handleConfirmEmailCode}
              className="signupSubmitBtn"
              style={{ height: "35px" }}
              disabled={!canInputEmailCode || !emailCode.trim()}
            >
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
              disabled={!canInputDateOfBirth}
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
                  disabled={!canInputGender}
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
                  disabled={!canInputGender}
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
              disabled={!canInputCallNum}
            />
          </div>

          <button
            type="submit"
            className="signupSubmitBtn"
            disabled={!canSubmitSignup}
          >
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

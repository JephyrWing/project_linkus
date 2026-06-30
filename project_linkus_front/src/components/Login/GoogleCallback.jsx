import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function GoogleCallback({ setUser }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requested = useRef(false);
  const [message, setMessage] = useState("구글 계정을 확인하고 있습니다...");

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const savedState = sessionStorage.getItem("googleOAuthState");
    sessionStorage.removeItem("googleOAuthState");

    if (error || !code) {
      setMessage("구글 로그인이 취소되었거나 인증에 실패했습니다.");
      return;
    }

    if (!state || state !== savedState) {
      setMessage("유효하지 않은 구글 로그인 요청입니다. 다시 시도해주세요.");
      return;
    }

    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI
      || `${window.location.origin}/oauth/google/callback`;

    axios.post("http://localhost:8080/api/users/oauth/google", { code, redirectUri })
      .then(({ data }) => {
        const token = data.accessToken;
        const decoded = jwtDecode(token.replace(/^Bearer\s+/i, ""));

        localStorage.setItem("accessToken", token);
        localStorage.setItem("userId", data.userId);
        setUser({
          isLogIn: true,
          role: decoded.role,
          userId: data.userId,
        });
        navigate("/", { replace: true });
      })
      .catch((errorResponse) => {
        setMessage(
          errorResponse.response?.data?.message
          || "구글 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
        );
      });
  }, [navigate, searchParams, setUser]);

  return (
    <div className="container">
      <div className="login-wrapper kakao-callback">
        <h1 className="logo">LinkUs</h1>
        <p>{message}</p>
        {message !== "구글 계정을 확인하고 있습니다..." && (
          <button type="button" className="loginBtn" onClick={() => navigate("/login", { replace: true })}>
            로그인으로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
}

export default GoogleCallback;

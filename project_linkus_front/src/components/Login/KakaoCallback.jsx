import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import getCommonApi from "../../utils/Axios/getCommonApi";

function KakaoCallback({ setUser }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requested = useRef(false);
  const [message, setMessage] = useState("카카오 계정을 확인하고 있습니다...");

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const savedState = sessionStorage.getItem("kakaoOAuthState");
    sessionStorage.removeItem("kakaoOAuthState");

    if (error || !code) {
      setMessage("카카오 로그인이 취소되었거나 인증에 실패했습니다.");
      return;
    }

    if (!state || state !== savedState) {
      setMessage("유효하지 않은 카카오 로그인 요청입니다. 다시 시도해주세요.");
      return;
    }

    const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI
      || `${window.location.origin}/oauth/kakao/callback`;

    getCommonApi().post("/users/oauth/kakao", { code, redirectUri })
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
          || "카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
        );
      });
  }, [navigate, searchParams, setUser]);

  return (
    <div className="container">
      <div className="login-wrapper kakao-callback">
        <h1 className="logo">LinkUs</h1>
        <p>{message}</p>
        {message !== "카카오 계정을 확인하고 있습니다..." && (
          <button type="button" className="loginBtn" onClick={() => navigate("/login", { replace: true })}>
            로그인으로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
}

export default KakaoCallback;

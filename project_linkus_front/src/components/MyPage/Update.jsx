import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import getCommonApi from "../../utils/Axios/getCommonApi";
import "./update.css";

function Update() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    userId: "",
    currentPassword: "",
    newPassword: "",
    nickName: "",
    dateOfBirth: "",
    gender: "Female",
    callNum: "",
    level: "",
    kakaoAccountLink: "", // 추가
    googleAccountLink: ""
  });

  const userId = localStorage.getItem("userId"); // 저장된 아이디 가져오기
  const isSocialUser = userInfo.kakaoAccountLink || userInfo.googleAccountLink;

  useEffect(() => {
    if (!userId) return; // 아이디 없으면 실행X

    const fetchUserData = async () => {
      try {
        const response = await getCommonApi().get(`/users/my/${userId}`);
        setUserInfo(response.data);
      } catch (error) {
        console.error("정보 조회 실패: ", error);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 입력 값 확인
    if (!userInfo.dateOfBirth || !userInfo.gender) {
      alert("생년월일, 성별은 필수 입력 항목입니다.");
      return;
    }


    const updateData = {
      userId: userInfo.userId,
      nickName: userInfo.nickName,
      email: userInfo.email,
      dateOfBirth: userInfo.dateOfBirth,
      gender: userInfo.gender,
      callNum: userInfo.callNum,      
      kakaoAccountLink: userInfo.kakaoAccountLink || "",
      googleAccountLink: userInfo.googleAccountLink || "",
      currentPassword: userInfo.currentPassword,
      newPassword: userInfo.newPassword,
    };

    try {
      await getCommonApi().put(`/users/my/${userId}`, updateData);
      localStorage.setItem("nickName", userInfo.nickName || userInfo.userId);

      // alert 확인 버튼을 누른 다음 홈 화면으로 이동함
      alert("수정이 완료되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("수정 실패: ", error);
      alert(error.response?.data?.message || "수정에 실패했습니다.");
    }
  };

  // 탈퇴하기
  const handleDelete = async () => {
    if (!window.confirm("정말 탈퇴하시겠습니까?")) {
      return;
    }

    try {
      // 백으로 요청
      await getCommonApi().delete(`/users/my/${userId}`);

      localStorage.removeItem("userId");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("nickName");
      localStorage.removeItem("selectedMarkerCustom");
      localStorage.removeItem("chatCustom");

      alert("탈퇴가 완료되었습니다.");
      window.location.href = "/"; // 메인페이지로 이동
    } catch (error) {
      console.error("탈퇴 실패: ", error);
      alert("탈퇴 실패했습니다.");
    }
  };

  return (
    <div className="update-container">
      <h1 className="update-title">회원 정보 조회/수정</h1>

      <form onSubmit={handleSubmit}>
        {/* 읽기 전용 영역 */}
        <div className="info-readonly">
          <p>
            <span>아이디: </span> {userInfo.userId}
          </p>
          <p>
            <span>이메일: </span> {userInfo.email}
          </p>
          <p>
            <span>레벨: </span> {userInfo.level}
          </p>
          <p>
            <span>카카오 연동: </span> {userInfo.kakaoAccountLink}
          </p>
          <p>
            <span>구글 연동: </span> {userInfo.googleAccountLink}
          </p>
        </div>

        {/* 수정 가능 영역 */}
        <div className="update-input-group">
          <label>현재 비밀번호</label>
          <input
            type="password"
            name="currentPassword"
            className="input-field"
            value={userInfo.currentPassword || ""}
            onChange={handleChange}
            disabled={!!isSocialUser} // 소셜 유저면 입력 불가
            placeholder={isSocialUser ? "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다." : ""}
          />
        </div>
        <div className="update-input-group">
          <label>새 비밀번호</label>
          <input
            type="password"
            name="newPassword"
            className="input-field"
            value={userInfo.newPassword}
            onChange={handleChange}
            disabled={!!isSocialUser} // 소셜 유저면 입력 불가
            placeholder={isSocialUser ? "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다." : ""}
          />
        </div>
        <div className="update-input-group">
          <label>닉네임</label>
          <input
            type="text"
            name="nickName"
            className="input-field"
            value={userInfo.nickName || ""}
            onChange={handleChange}
            placeholder="닉네임 입력"
          />
        </div>
        <div className="update-input-group">
          <label>생년월일</label>
          <input
            type="date"
            name="dateOfBirth"
            className="input-field"
            value={userInfo.dateOfBirth}
            onChange={handleChange}
          />
        </div>
        <label className="update-label">성별</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={userInfo.gender === "Male"}
              onChange={handleChange}
            />{" "}
            남자
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={userInfo.gender === "Female"}
              onChange={handleChange}
            />{" "}
            여자
          </label>
        </div>
        <div className="update-input-group">
          <label>전화번호</label>

          <input
            type="tel"
            name="callNum"
            className="input-field"
            value={userInfo.callNum}
            onChange={handleChange}
            placeholder="010-XXXX-XXXX"
          />
        </div>

        <button type="submit" className="submit-btn">
          수정 완료
        </button>

        <button type="button" className="delete-btn" onClick={handleDelete}>
          탈퇴하기
        </button>
      </form>
    </div>
  );
}
export default Update;

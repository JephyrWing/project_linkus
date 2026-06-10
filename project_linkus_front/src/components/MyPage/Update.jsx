import { Link } from "react-router-dom";
import { useState } from "react";


function Update() {
  const [userInfo, setUserInfo] = useState({
    userId: "asd",
    password: "1234",
    nickName: "asdd",
    dateOfBirth: "2020-04-01",
    gender: "Female",
    callNum: "010-1234-1234",
    level: "5",
    chatCustom: "a"
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({...userInfo, [name]: value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('회원정보 수정:', userInfo);
  };


 return (
    <div className="update-container">
      <h1 className="update-title">회원 정보 조회/수정</h1>
      
      <form onSubmit={handleSubmit}>
        {/* 읽기 전용 영역 */}
        <div className="info-readonly">
          <p><span>아이디:</span> {userInfo.userId}</p>
          <p><span>레벨:</span> {userInfo.level}</p>
        </div>

        {/* 수정 가능 영역 */}
        <div className="input-group">
          <label>비밀번호</label>
          <input type="password" name="password" className="input-field" value={userInfo.password} onChange={handleChange} />
        </div>  
        <div className="input-group">
          <label>닉네임</label>
          <input type="text" name="nickName" className="input-field" value={userInfo.nickName} onChange={handleChange} />
        </div>  
        <div className="input-group">
          <label>생년월일</label>
          <input type="date" name="dateOfBirth" className="input-field" value={userInfo.dateOfBirth} onChange={handleChange} />
        </div>  
          <label>성별</label>
          <div className="radio-group">
            <label><input type="radio" name="gender" value="Male" checked={userInfo.gender === "Male"} onChange={handleChange} /> 남성</label>
            <label><input type="radio" name="gender" value="Female" checked={userInfo.gender === "Female"} onChange={handleChange} /> 여성</label>
          </div>
        <div className="input-group">
          <label>전화번호</label>
          <input type="tel" name="callNum" className="input-field" value={userInfo.callNum} onChange={handleChange} />
        </div>  
        <div className="input-group">
          <label>말풍선 커스텀</label>
          {/* <input type="text" name="chatCustom" className="input-field" value={userInfo.chatCustom} onChange={handleChange} /> */}
        </div>

        <button type="submit" className="submit-btn">수정 완료</button>
      </form>
    </div>
  );

}
export default Update;
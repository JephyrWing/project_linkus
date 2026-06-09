import React, { useState } from 'react';

export default function Login() {
  // 현재 화면 모드 login or 회원가입
  const [viewMode, setViewMode] = useState('login');

  // 회원가입 시 입력 데이터
  const [ formData, setFormData ] = useState({
    userId: "",
    password: "",
    nickname: "",
    birthdate: "",
    gender: "",
    phoneNumber: ""
  });
  
  // 테스트
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value // name이 "userId"인 인풋의 값을 실시간으로 반영
    });
  };


  // 로그인하기
  const loginSubmit = (e) => {
    e.preventDefault();
    console.log('로그인 정보 : ' , { userId : formData.userId, password : formData.password });
  };

  // 회원가입하기
  const signupSubmit = (e) => {
    e.preventDefault();
    console.log('회원가입 정보 : ', formData)
  };

  return (
    <div style={style.container}>
      {viewMode === 'login' ? (
        <div style={style.wrapper}>
          <h1 style={style.logo}>LinkUs</h1>

          <form onSubmit={loginSubmit} style={style.form}>
            {/* 아이디 입력 */}
            <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            placeholder="아이디"
            style={style.loginInput}
            />

            {/* 비밀번호 입력 */}
            <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호"
            style={style.loginInput}
            />

            {/* 로그인 버튼 */}
            <button type= "submit" style={style.loginBtn}>로그인</button>
          </form>

          {/*  회원가입 하기  */}
          <div style={style.signupLinkContainer}>
            <span style={style.signupLink} onClick={() => setViewMode('signup')}>
              회원가입
            </span>
          </div>
    </div>
  ) : (
    //  회원가입 화면
    <div style={style.signupBox}>
      <h2 style={style.signupTitle}>회원가입</h2>
      <form onSubmit={signupSubmit} style={style.signupForm}>
        <div style={style.signupInput}>
          <label>아이디</label>
          <input type="text" name="userId" value={formData.userId} onChange={handleChange} placeholder='아이디 입력' />
        </div>
        <div style={style.signupInput}>
          <label>비밀번호</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder='비밀번호 입력' />
        </div>
        <div style={style.signupInput}>
          <label>닉네임</label>
          <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} placeholder='닉네임 입력' />
        </div>
        <div style={style.signupInput}>
          <label>생년월일</label>
          <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} />
        </div>
        <div style={style.signupInput}>
          <label>성별</label>
          <select name='gender' value={formData.gender} onChange={handleChange}>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>
        <div style={style.signupInput}>
          <label>전화번호</label>
          <input type='tel' name='phoneNumber' value={formData.phoneNumber} onChange={handleChange}/>
        </div>
        
        <button type='submit' style={style.signupSubmitBtn}>회원가입하기</button>
        <button type='button' onClick={() => setViewMode('login')} style={style.cancelBtn}>로그인으로 돌아가기</button>
        
      </form>
    </div>
  )}
 </div>
);
}

const style = {
  // 가장 바깥 상자
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    boxSizing: 'border-box',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  wrapper:{
    width: '100%',  
    maxWidth: '350px',
    display: 'flex',
    backgroundColor: '#fcf4e9',
    flexDirection: 'column',
    borderRadius: '8px',
    padding: '60px 40px',
    alignItems: 'center',
    textAlign: 'center',
    boxSizing: 'border-box'
  },

  logo:{
    fontSize: '60px',
    fontWeight: 'bold',
    color: '#92715c',
    margin: '0 0 40px 0',
  },

  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  loginInput:{
    width: '100%',
    padding: '12px',
    fontsize: '15px',
    color: '#555555',
    backgroundColor: 'white',
    border: '1px solid #969696',
    borderRadius: '5px',
    boxSizing: 'border-box',
    outline: 'none'
  },

  loginBtn:{
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#555555',
    border: '1px solid #92715c',
    cursor: 'pointer',
    borderRadius: '8px',
    backgroundColor: 'white',
    // display: 'flex',
    // alignItems: 'center',
    marginTop: '12px',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  signupLinkContainer:{
    marginTop: '20px',
    width: '100%',
    textAlign: 'center'
  },

  signupLink:{
    fontSize: '14px',
    color: '#666666',
    cursor: 'pointer',
  },


  // 회원가입 화면
  signupBox:{
    width: '100%',
    maxWidth: '450px',
    display: 'flex',
    backgroundColor: '#fcf4e9',
    flexDirection: 'column',
    boxSizing: 'border-box',
    padding: '50px 40px',
    borderRadius: '8px',

  },

  signupTitle:{
    fontSize: '40px',
    fontWeight: 'bold',
    color: '#92715c',
    textAlign: 'center',
    margin: '30px 0 30px 0'
     

  },
  signupForm:{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

 
  signupInput:{

  },
  signupSubmitBtn:{

  },
  cancelBtn:{

  }
}

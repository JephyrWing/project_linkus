import { useState } from "react";
import "./livechat.css";

function LiveChat() {
  const [message, setMessage] = useState(""); // setMessage : message 값 바꿔주는 ㅁ하수
  const [chatList, setChatList] = useState([
    // 대화창 첫 화면에 보이는 예시 메시지
    { id: 1, sender: "익명", text: "안녕하세요" },
    { id: 2, sender: "익명", text: "여기 누구 있나요?" },
  ]);

  const handleSubmit = (e) => {
    // const handleSubmit = (e) => : 이건 사용자가 채팅 입력 후 전송 버튼을 누르거나 Enter를 쳤을 때 실행되는 함수
    e.preventDefault(); // -> 새로고침 되었을 때 채팅 날라가는 거 막는 용도
    // 빈 메시지 못 보내게 막는 용도, trim()은 문자열 앞뒤 공백을 제거
    // message에서 공백을 제거했는데 아무 내용도 없으면 함수 종료하고 메시지 추가 안 함
    if (!message.trim()) return;

    // 사용자가 입력한 메시지를 새로운 채팅 객체로 만드는 부분
    const newChat = {
      id: Date.now(), // 현재 시간을 숫자로 만들어서 id로 쓰는
      sender: "나",
      text: message,
    };

    // 기존 채팅 목록 뒤에 새 메시지 추가하는 코드
    //...chatList = 기존 배열을 펼치기
    setChatList([...chatList, newChat]);
    setMessage(""); // 메시지 보내고 입력창 비우기
  };

  return (
    // 채팅 헤더 영역
    <div className="livechat">
      <div className="livechat-header">
        <h2>실시간 대화</h2>
      </div>

      {/* 채팅 메시지 */}
      <div className="livechat-body">
        {/* chatList.map()은 배열 안의 요소를 하나씩 꺼내서 JSX로 바꿔주는 코드 */}
        {chatList.map((chat) => (
          <div className="chat-message" key={chat.id}>
            {" "}
            {/*key={chat.id} : 리액트가 여러 개 메시지를 구분하게 해주는 값 */}
            <span className="chat-sender">{chat.sender}</span>
            <p>{chat.text}</p>
          </div>
        ))}
      </div>

      {/* 메시지 입력창 */}
      <form className="livechat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          // onChange={(e) => setMessage(e.target.value)} : 사용자가 글자 입력할 때마다 실행되는 코드
          // 여기서 입력된 건 serMessage에 저장
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
        />
        <button type="submit">전송</button>
      </form>
    </div>
  );
}

export default LiveChat;

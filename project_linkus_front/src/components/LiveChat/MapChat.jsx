// 지도 위에 올라오는 채팅창 전체 UI 영역

import ChatList from "./ChatList";
import "./mapchat.css";

function MapChat({ message, setMessage, chatList, handleSubmit }) {
  return (
    // 지도 위에 올라오는 채팅창 전체 박스
    <div className="livechat">
      {/* 채팅 헤더 영역 */}
      <div className="livechat-header">
        <h2>실시간 대화</h2>
      </div>

      {/* 채팅 메시지 목록 영역 */}
      <div className="livechat-body">
        <ChatList chatList={chatList} />
      </div>

      {/* 메시지 입력창 영역 */}
      {/* 이 코드가 있기 때문에 input에 커서 두고 Enter 치면 메시지가 전송되는 것 */}
      <form className="livechat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          // 사용자가 글자를 입력할 때마다 실행됨
          // 입력된 값은 setMessage를 통해 message 상태에 저장됨
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
        />

        {/* type="submit"이라서 클릭 시 form의 onSubmit이 실행됨 */}
        <button type="submit">전송</button>
      </form>
    </div>
  );
}

export default MapChat;
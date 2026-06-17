// 채팅 메시지 목록을 출력하는 영역

import "./chatlist.css";

function ChatList({ chatList }) {
  return (
    <>
      {/* chatList.map()은 배열 안의 요소를 하나씩 꺼내서 JSX로 바꿔주는 코드 */}
      {chatList.map((chat) => (
        // key={chat.id}: React가 여러 개의 메시지를 구분하게 해주는 값
        <div className="chat-message" key={chat.chatId}>
          {/* 메시지를 보낸 사람 */}
          <span className="chat-sender">{chat.userId === "나" ? "나" : "익명"}</span>

          {/* 메시지 내용 */}
          <p>{chat.text}</p>
        </div>
      ))}
    </>
  );
}

export default ChatList;
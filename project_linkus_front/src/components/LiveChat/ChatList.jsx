// 채팅 메시지 목록을 출력하는 영역

import "./chatlist.css";

function ChatList({ chatList }) {
  return (
    <>
      {/* chatList.map()은 배열 안의 요소를 하나씩 꺼내서 JSX로 바꿔주는 코드 */}
      {chatList.map((chat) => {
        /*
          isMine은 현재 메시지가 내가 보낸 메시지인지 확인하는 변수

          chat.userId === "나"
          → 메시지 객체 안의 userId 값이 "나"이면 내가 보낸 메시지로 판단

          true  → 내가 보낸 메시지
          false → 다른 사람이 보낸 메시지
        */
        const isMine = chat.userId === "나";

        return (
          /*
            chat-message-row는 메시지 한 줄 전체 영역

            isMine이 true이면 className이 "chat-message-row mine"
            → 오른쪽 정렬

            isMine이 false이면 className이 "chat-message-row other"
            → 왼쪽 정렬
          */
          <div
            className={`chat-message-row ${isMine ? "mine" : "other"}`}
            key={chat.chatId}
          >
            {/*
              chat-message는 실제 말풍선 영역

              isMine이 true이면 className이 "chat-message mine"
              → 내가 보낸 말풍선 스타일 적용

              isMine이 false이면 className이 "chat-message other"
              → 상대가 보낸 말풍선 스타일 적용
            */}
            <div className={`chat-message ${isMine ? "mine" : "other"}`}>
              {/* 메시지를 보낸 사람 */}
              <span className="chat-sender">
                {chat.userId === "나" ? "나" : "익명"}
              </span>

              {/* 메시지 내용 */}
              <p>{chat.text}</p>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default ChatList;
// 채팅 메시지 목록을 출력하는 영역
// 왼쪽 실시간 대화창 안의 채팅 목록 담당
// 여기서는 더보기/접기 없이 메시지 전문을 그대로 보여줌

import "./chatlist.css";
import { AiFillAlert } from "react-icons/ai"; // 신고 아이콘
import { useNavigate } from "react-router-dom";

function ChatList({ chatList }) {
  const navigate = useNavigate();

  return (
    <>
      {/* chatList.map()은 배열 안의 요소를 하나씩 꺼내서 JSX로 바꿔주는 코드 */}
      {chatList.map((chat, index) => {
        /*
          isMine은 현재 메시지가 내가 보낸 메시지인지 확인하는 변수

          chat.userId === "나"
          → 메시지 객체 안의 userId 값이 "나"이면 내가 보낸 메시지로 판단

          true  → 내가 보낸 메시지
          false → 다른 사람이 보낸 메시지
        */
        const isMine = chat.userId === localStorage.getItem("userId");

        // chatId가 없을 경우를 대비해서 index를 임시 key로 사용
        const chatKey = chat.chatId ?? index;

        return (
          <div
            className={`chat-message-row ${isMine ? "mine" : "other"}`}
            key={chatKey}
          >
            <div className={`chat-message ${isMine ? "mine" : "other"}`}>
              {/* 메시지를 보낸 사람 */}
              <span className="chat-sender">
                {isMine === true ? "나" : "익명"}
              </span>

              {/* 메시지 내용 전문 표시 */}
              <p>{chat.text}</p>

              {/* 신고 아이콘 추가 */}
              {!isMine && (
              <button 
                className="chat-report-btn"
                onClick={() => navigate("/report", {state: {chatId:chat.chatId, text: chat.text}})}
                title="신고하기"
                >
                  <AiFillAlert />
                </button>
                )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default ChatList;
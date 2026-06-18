// 데이터 및 함수 관리하는 영역

import { useState } from "react";
import MapChat from "./MapChat";
import getCommonApi from "../../utils/Axios/getCommonApi";

function LiveChat() {
  // message: 현재 입력창에 적혀 있는 메시지 값
  // setMessage: message 값을 바꿔주는 함수
  const [message, setMessage] = useState("");

  // chatList: 채팅창에 표시할 메시지 목록
  // setChatList: chatList 값을 바꿔주는 함수
  const [chatList, setChatList] = useState([
    // 대화창 첫 화면에 보이는 예시 메시지
    // ChatList.jsx에서 chatId, userId, text를 사용하므로 데이터 구조를 맞춰둠
    { chatId: 1, userId: "익명", text: "안녕하세요" },
    { chatId: 2, userId: "익명", text: "여기 누구 있나요?" },
  ]);

  // 사용자가 채팅 입력 후 전송 버튼을 누르거나 Enter를 쳤을 때 실행되는 함수
  const handleSubmit = async (e) => {
    // form 제출 시 페이지가 새로고침되어 채팅이 날아가는 것을 막음
    e.preventDefault();

    // 빈 메시지 전송 방지
    // trim()은 문자열 앞뒤 공백을 제거함
    // 공백 제거 후 아무 내용도 없으면 함수 종료
    if (!message.trim()) return;

    try {
      // 백엔드로 채팅 메시지 전송
      // getCommonApi() 안에서 baseURL, 토큰 같은 공통 axios 설정을 처리한다고 가정
      const response = await getCommonApi().post("/chats/upload", {
        text: message,
        longitude: 0.0,
        latitude: 0.0,
      });

      // 서버 응답 데이터를 화면에 표시할 채팅 객체로 변환
      // 서버가 chatId를 주면 그 값을 사용하고, 없으면 Date.now()로 임시 chatId 생성
      // 서버가 text를 주면 그 값을 사용하고, 없으면 사용자가 입력한 message 사용
      // userId는 내가 보낸 메시지이므로 "나"로 설정
      const chatSender = {
        ...response.data,
        chatId: response.data.chatId || Date.now(),
        userId: "나",
        text: response.data.text || message,
      };

      // 기존 채팅 목록 뒤에 새 메시지를 추가
      // prevList를 사용하면 이전 state를 안전하게 기준으로 삼을 수 있음
      setChatList((prevList) => [...prevList, chatSender]);

      // 메시지를 보낸 뒤 입력창 비우기
      setMessage("");
    } catch (error) {
      console.error("채팅 전송 실패:", error);
      alert("채팅 전송에 실패했습니다.");
    }
  };

  return (
    <MapChat
      message={message}
      setMessage={setMessage}
      chatList={chatList}
      handleSubmit={handleSubmit}
    />
  );
}

export default LiveChat;
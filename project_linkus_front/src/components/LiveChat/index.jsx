// LiveChat/index.jsx
// 데이터 및 함수 관리하는 영역
// → 채팅창 데이터와 전송 함수 관리
// → 채팅을 보내면 채팅창에 추가
// → 동시에 MapPost에게 “지도에도 이 메시지 띄워줘”라고 알려줌

import { useState } from "react";
import MapChat from "./MapChat";
import getCommonApi from "../../utils/Axios/getCommonApi";

// { currentPosition, onChatSent } 이거 넣은 이유:
// MapPost에서 넘긴 값(현재 사용자 위치, 채팅 전송 성공 후 지도에 알려줄 함수)을 받아야 하기 때문에 넣음
function LiveChat({ currentPosition, onChatSent }) {
  // message: 현재 입력창에 적혀 있는 메시지 값
  // setMessage: message 값을 바꿔주는 함수
  const [message, setMessage] = useState("");

  // chatList: 채팅창에 표시할 메시지 목록
  // setChatList: chatList 값을 바꿔주는 함수
  const [chatList, setChatList] = useState([
    // 대화창 첫 화면에 보이는 예시 메시지
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

    /*
    채팅 보낼 때 같이 전송할 위치 좌표

    현재 위치가 있으면 그 좌표를 사용하고,
    아직 위치를 못 가져왔으면 0.0을 임시값으로 사용한다.
    */
    const latitude = currentPosition?.lat ?? 0.0;
    // 여기서 ?.는 currentPosition이 있으면 lat을 꺼내고
    // 없으면 에러 내지 말고 undefined 처리
    const longitude = currentPosition?.lng ?? 0.0;

    try {
      // 백엔드로 채팅 메시지 전송
      const response = await getCommonApi().post("/chats/upload", {
        text: message,
        longitude: longitude,
        latitude: latitude,
      });

      /*
        서버 응답 데이터를 화면에 표시할 채팅 객체로 변환
        → 왜?: 서버 응답이 항상 우리가 원하는 구조로 오지 않을 수 있기 때문
      */
      const chatSender = {
        ...response.data,
        // 서버가 chatId를 주면 그 값을 사용하고,
        // 없으면 Date.now()로 임시 chatId 생성
        // chatId가 필요한 이유: ChatList.jsx에서 반복 렌더링할 때 key로 쓰기 때문
        chatId: response.data.chatId || Date.now(),
        userId: "나",
        // 서버가 text를 주면 그 값을 사용하고,
        // 없으면 사용자가 입력한 message 사용
        text: response.data.text || message,
        // 위도/경도도 서버 응답이 있으면 그 서버 값을 쓰고,
        // 없으면 현재 위치값을 사용한다.
        latitude: response.data.latitude ?? latitude,
        longitude: response.data.longitude ?? longitude,
      };

      // 채팅창 안의 메시지 목록에 추가
      // prevList: React가 보장해주는 최신 이전 상태
      // 비동기 상황에서도 chatList최신 상태 유지하기 위해 '=>' 사용
      setChatList((prevList) => [...prevList, chatSender]);

      // 지도 위에 메시지를 띄우는 핵심 부분
      // 지도 위에도 메시지를 띄우기 위해 부모 컴포넌트에 전달
      // 채팅 전송 성공 후, MapPost에게 채팅 데이터를 넘겨서 지도 위에도 띄우는 코드
      if (onChatSent) {
        onChatSent(chatSender);
      }

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

// 지도 위에 올라오는 채팅창 전체 UI 영역

import { useEffect, useRef } from "react";
import ChatList from "./ChatList";
import "./mapchat.css";

function MapChat({
  message,
  setMessage,
  chatList,
  handleSubmit,
  isMinimized,
  onToggleMinimize,
}) {
  const scrollRef = useRef(null);

  // chatList가 바뀔때마다 아래로 스크롤
  useEffect(() => {
    if(scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatList]);

  return (
    // 지도 위에 올라오는 채팅창 전체 박스
    <div className={`livechat ${isMinimized ? "minimized" : ""}`}>
      {/* 채팅 헤더 영역 */}
      <div className="livechat-header">
        <h2>실시간 대화</h2>
        <button
          type="button"
          className="livechat-minimize-button"
          onClick={onToggleMinimize}
          aria-label={isMinimized ? "채팅창 펼치기" : "채팅창 최소화"}
          title={isMinimized ? "채팅창 펼치기" : "채팅창 최소화"}
        >
          {isMinimized ? "+" : "−"}
        </button>
      </div>

      {!isMinimized && (
        <>
          {/* 채팅 메시지 목록 영역 */}
          <div className="livechat-body" ref={scrollRef}>
            <ChatList chatList={chatList} />
          </div>

          {/* 메시지 입력창 영역 */}
          <form className="livechat-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요"
            />
            <button type="submit">전송</button>
          </form>
        </>
      )}
    </div>
  );
}

export default MapChat;

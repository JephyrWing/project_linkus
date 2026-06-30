import { Map, CustomOverlayMap } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../utils/Kakao/UseKakaoLoader";
import React, { useEffect, useRef, useState, useCallback } from "react";
import LiveChat from "../LiveChat";
import "./mappost.css";
import useChatStore from "../../store/useChatStore";
import getCommonApi from "../../utils/Axios/getCommonApi";
import Draggable from "react-draggable";

export default function MapPost() {
  useKakaoLoader();

  const { mapChat, refreshMapChat } = useChatStore();

  const defaultPosition = {
    lat: 37.2772455336538,
    lng: 127.028007118842,
  };

  const FIXED_LEVEL = 6;

  const [currentPosition, setCurrentPosition] = useState(defaultPosition);
  const [expandedMapChatIds, setExpandedMapChatIds] = useState([]);
  const mapRef = useRef(null);

  // 최신 좌표를 언제나 참조할 수 있는 ref 생성
  const positionRef = useRef(defaultPosition);

  const handleToggleMapChat = (chatId) => {
    setExpandedMapChatIds((prevIds) =>
      prevIds.includes(chatId)
        ? prevIds.filter((id) => id !== chatId)
        : [...prevIds, chatId],
    );
  };

  // 컴포넌트 동안 한 번만 생성
  const fetchMapData = useCallback(async () => {
    try {
      // 언제나 최신 좌표 ref 값을 사용하므로 안전합니다.
      const target = positionRef.current;
      const response = await getCommonApi().post("/chats", {
        longitude: target.lng,
        latitude: target.lat,
      });
      refreshMapChat(response.data);
    } catch (error) {
      console.error("지도 데이터 조회 실패:", error);
    }
  }, [refreshMapChat]); // refreshMapChat은 Zustand 액션이라 변하지 않음

  // 실시간 사용자 위치 추적
  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("이 브라우저에서는 Geolocation을 지원하지 않습니다.");
      fetchMapData();
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const userPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // 상태 업데이트 (UI 렌더링용)
        setCurrentPosition(userPosition);
        // Ref 업데이트 (3초 폴링 함수가 읽어갈 용도)
        positionRef.current = userPosition;

        // 위치가 실제로 바뀌었을 때 즉시 호출
        fetchMapData();
      },
      (err) => {
        console.warn("실시간 위치 추적 실패 (기본값 사용):", err.message);
        fetchMapData();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }, // 캐시 허용치 3초로 주어 불필요한 호출 빈도 감소
    );

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [fetchMapData]);

  // 3초마다 새로고침하는 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      fetchMapData();
    }, 3000);

    return () => clearInterval(timer);
  }, [fetchMapData]); // fetchMapData가 변하지 않으므로 마운트 시 딱 한 번만 타이머가 셋팅됨

  const chatRef = useRef(null);
  return (
    <div className="map-wrapper">
      <Map
        id="map"
        center={currentPosition}
        style={{ width: "1200px", height: "700px" }}
        level={FIXED_LEVEL}
        onCreate={(map) => {
          mapRef.current = map;
          map.setZoomable(false);
          map.setDraggable(false);
          map.setLevel(FIXED_LEVEL);
        }}
        onZoomChanged={(map) => {
          if (map.getLevel() !== FIXED_LEVEL) {
            map.setLevel(FIXED_LEVEL);
          }
        }}
      >
        {mapChat.map((chat, index) => {
          const MAX_MAP_CHAT_PREVIEW_LENGTH = 13;
          const chatKey = chat.chatId ?? index;
          const chatText = chat.text || "";
          const isExpanded = expandedMapChatIds.includes(chatKey);
          const isLongText = chatText.length > MAX_MAP_CHAT_PREVIEW_LENGTH;

          const visibleText =
            isExpanded || !isLongText
              ? chatText
              : `${chatText.slice(0, MAX_MAP_CHAT_PREVIEW_LENGTH)}...`;

          return (
            <CustomOverlayMap
              key={chatKey}
              position={{ lat: chat.latitude, lng: chat.longitude }}
              yAnchor={1.4}
              clickable={true}
            >
              <div
                className={`map-chat-bubble ${chat.userId === localStorage.getItem("userId") ? "mine" : "other"}`}
              >
                <strong>
                  {chat.userId === localStorage.getItem("userId")
                    ? "나"
                    : "익명"}
                </strong>
                <p className={isExpanded ? "expanded" : ""}>{visibleText}</p>
                {isLongText && (
                  <button
                    type="button"
                    className="map-chat-more-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMapChat(chatKey);
                    }}
                  >
                    {isExpanded ? "접기" : "더보기"}
                  </button>
                )}
              </div>
            </CustomOverlayMap>
          );
        })}
      </Map>

      <Draggable
        nodeRef={chatRef}
        bounds="parent"
        cancel=".livechat-form"
        // 💡 [핵심] 드래그가 시작될 때 카카오맵이 마우스 이벤트를 가로채지 못하도록 전파를 막습니다.
        onStart={(e) => {
          e.stopPropagation();
        }}
      >
        {/* 💡 카카오맵 기본 이벤트 핸들러들이 이 영역 안으로 침범하지 못하도록 
        onMouseDown 등 마우스 관련 이벤트의 전파를 차단하는 안전 장치 div를 둡니다.
      */}
        <div
          ref={chatRef}
          style={{
            position: "absolute",
            top: "24px", // 기존 css의 위치 그대로 복구
            left: "24px", // 기존 css의 위치 그대로 복구
            zIndex: 20, // footer(보통 10~20대)보다 확실하게 위로 띄우기
            width: "320px", // 자식 크기에 맞게 영역 확보
            height: "520px",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()} // 모바일 대응 시 필요
        >
          <LiveChat
            currentPosition={currentPosition}
            onChatSent={() => fetchMapData()}
          />
        </div>
      </Draggable>
    </div>
  );
}

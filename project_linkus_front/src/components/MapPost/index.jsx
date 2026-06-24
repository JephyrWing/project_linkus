import { Map, CustomOverlayMap } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../utils/Kakao/UseKakaoLoader";
import React, { useEffect, useRef, useState, useCallback } from "react";
import LiveChat from "../LiveChat";
import "./mappost.css";
import useChatStore from "../../store/useChatStore";
import getCommonApi from "../../utils/Axios/getCommonApi";

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

      <LiveChat
        currentPosition={currentPosition}
        onChatSent={() => fetchMapData()}
      />
    </div>
  );
}

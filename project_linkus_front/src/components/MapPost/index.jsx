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

  const FIXED_LEVEL = 3;

  // 지도의 중심과 사용자 위치를 하나의 상태로 통일 (어차피 고정이니까요)
  const [currentPosition, setCurrentPosition] = useState(defaultPosition);
  const [expandedMapChatIds, setExpandedMapChatIds] = useState([]);
  const mapRef = useRef(null);

  const handleToggleMapChat = (chatId) => {
    setExpandedMapChatIds((prevIds) =>
      prevIds.includes(chatId)
        ? prevIds.filter((id) => id !== chatId)
        : [...prevIds, chatId],
    );
  };

  // 데이터 페칭 함수
  const fetchMapData = useCallback(
    async (targetPosition = currentPosition) => {
      try {
        const response = await getCommonApi().post("/chats", {
          longitude: targetPosition.lng,
          latitude: targetPosition.lat,
        });
        refreshMapChat(response.data);
      } catch (error) {
        console.error("지도 데이터 조회 실패:", error);
      }
    },
    [currentPosition, refreshMapChat],
  );

  // 🔄 실시간 사용자 위치 추적 (지도가 항상 이 위치를 중심으로 고정됨)
  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("이 브라우저에서는 Geolocation을 지원하지 않습니다.");
      fetchMapData(defaultPosition);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const userPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // 내 실시간 좌표를 갱신하면 <Map center={currentPosition}>에 의해 지도 중심도 자동 고정됩니다.
        setCurrentPosition(userPosition);
        fetchMapData(userPosition);
      },
      (err) => {
        console.warn("실시간 위치 추적 실패 (기본값 사용):", err.message);
        fetchMapData(defaultPosition);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [fetchMapData]);

  // ⏱️ 3초마다 '서버 데이터만' 새로고침하는 폴링 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      fetchMapData();
    }, 3000);

    return () => clearInterval(timer);
  }, [fetchMapData]);

  return (
    <div className="map-wrapper">
      <Map
        id="map"
        center={currentPosition} // 💡 상태를 통일하여 내 위치가 바뀔 때 지도 중심도 강제 고정
        style={{ width: "1200px", height: "700px" }}
        level={FIXED_LEVEL}
        onCreate={(map) => {
          mapRef.current = map;
          map.setZoomable(false); // 확대 축소 불가
          map.setDraggable(false); // 💡 마우스 드래그로 지도 이동 불가 처리 추가
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

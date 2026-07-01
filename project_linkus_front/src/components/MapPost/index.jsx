import { Map, CustomOverlayMap } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../utils/Kakao/UseKakaoLoader";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LiveChat from "../LiveChat";
import "./mappost.css";
import useChatStore from "../../store/useChatStore";
import getCommonApi from "../../utils/Axios/getCommonApi";
import Draggable from "react-draggable";
import {
  CUSTOM_MARKER_COLOR_KEY,
  MARKER_COLORS,
  createChatCustomKey,
  getChatColorStyleByCustom,
} from "./markerStyles";

const CHAT_COLOR_PAGE_SIZE = 8;

const getReadableChatTextColor = (backgroundColor = "#92715c") => {
  const hex = backgroundColor.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "#ffffff";

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 170 ? "#333333" : "#ffffff";
};

export default function MapPost() {
  useKakaoLoader();
  const location = useLocation();
  const navigate = useNavigate();

  const { mapChat, refreshMapChat, updateUserChatCustom } = useChatStore();

  const defaultPosition = {
    lat: 37.2772455336538,
    lng: 127.028007118842,
  };

  const FIXED_LEVEL = 6;

  const [currentPosition, setCurrentPosition] = useState(defaultPosition);
  const [expandedMapChatIds, setExpandedMapChatIds] = useState([]);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isChatCustomOpen, setIsChatCustomOpen] = useState(false);
  const [chatColorPage, setChatColorPage] = useState(0);
  const [draftChatColor, setDraftChatColor] = useState("brown");
  const [draftCustomChatColor, setDraftCustomChatColor] = useState("#92715c");
  const [myUserInfo, setMyUserInfo] = useState(null);
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

  const closeChatCustomPanel = () => {
    setIsChatCustomOpen(false);

    const params = new URLSearchParams(location.search);
    if (params.get("chatCustom") !== "open") return;

    params.delete("chatCustom");
    const nextSearch = params.toString();

    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true },
    );
  };

  const loadMyChatCustom = useCallback(async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    const response = await getCommonApi().get(`/users/my/${userId}`);
    const userInfo = response.data;
    const chatColorStyle = getChatColorStyleByCustom(userInfo.chatCustom);

    setMyUserInfo(userInfo);
    setDraftChatColor(chatColorStyle.colorKey);
    setDraftCustomChatColor(chatColorStyle.customColor || "#92715c");
    setChatColorPage(0);
  }, [navigate]);

  const handleApplyChatCustom = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    const baseUserInfo =
      myUserInfo || (await getCommonApi().get(`/users/my/${userId}`)).data;
    const nextChatCustom = createChatCustomKey(
      draftChatColor,
      draftCustomChatColor,
    );

    await getCommonApi().put(`/users/my/${userId}`, {
      userId: baseUserInfo.userId,
      nickName: baseUserInfo.nickName,
      dateOfBirth: baseUserInfo.dateOfBirth,
      gender: baseUserInfo.gender,
      callNum: baseUserInfo.callNum,
      chatCustom: nextChatCustom,
      kakaoAccountLink: baseUserInfo.kakaoAccountLink || "",
      googleAccountLink: baseUserInfo.googleAccountLink || "",
      currentPassword: "",
      newPassword: "",
    });

    setMyUserInfo({ ...baseUserInfo, chatCustom: nextChatCustom });
    localStorage.setItem("chatCustom", nextChatCustom);
    updateUserChatCustom(userId, nextChatCustom);
    closeChatCustomPanel();
    fetchMapData();
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("chatCustom") !== "open") {
      setIsChatCustomOpen(false);
      return;
    }

    setIsChatCustomOpen(true);
    loadMyChatCustom().catch((error) => {
      console.error("채팅 색상 설정 조회 실패:", error);
      alert("채팅 색상 정보를 불러오지 못했습니다.");
      closeChatCustomPanel();
    });
  }, [location.search, loadMyChatCustom]);

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

  const markerColorEntries = Object.entries(MARKER_COLORS);
  const chatColorTotalPages = Math.max(
    1,
    Math.ceil(markerColorEntries.length / CHAT_COLOR_PAGE_SIZE),
  );
  const pagedChatColorEntries = markerColorEntries.slice(
    chatColorPage * CHAT_COLOR_PAGE_SIZE,
    chatColorPage * CHAT_COLOR_PAGE_SIZE + CHAT_COLOR_PAGE_SIZE,
  );
  const draftChatColorStyle = getChatColorStyleByCustom(
    createChatCustomKey(draftChatColor, draftCustomChatColor),
  );
  const chatRef = useRef(null);
  return (
    <div className="map-wrapper">
      <Map
        id="map"
        center={currentPosition}
        style={{ width: "100%", height: "100%" }}
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
          const MAX_MAP_CHAT_PREVIEW_LENGTH = 30;
          const chatKey = chat.chatId ?? index;
          const chatText = chat.text || "";
          const isExpanded = expandedMapChatIds.includes(chatKey);
          const isLongText = chatText.length > MAX_MAP_CHAT_PREVIEW_LENGTH;
          const chatColorStyle = getChatColorStyleByCustom(
            chat.chatCustom || chat.chatCustum,
          );
          const chatTextColor = getReadableChatTextColor(chatColorStyle.color);

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
                style={{
                  "--chat-bubble-bg": chatColorStyle.color,
                  "--chat-bubble-border": chatColorStyle.borderColor,
                  "--chat-bubble-text": chatTextColor,
                  "--chat-bubble-subtext": chatTextColor,
                }}
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

      {isChatCustomOpen && (
        <div className="chat-custom-backdrop" onClick={closeChatCustomPanel}>
          <section
            className="chat-custom-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="chat-custom-header">
              <div>
                <strong>Decorating Chat</strong>
                <span>지도 위 채팅 박스 색상을 선택해 주세요.</span>
              </div>

              <button
                type="button"
                onClick={closeChatCustomPanel}
                aria-label="채팅 색상 설정 닫기"
              >
                ×
              </button>
            </header>

            <div className="chat-custom-preview">
              <span>현재 선택</span>
              <div
                className="chat-custom-preview-bubble"
                style={{
                  "--chat-bubble-bg": draftChatColorStyle.color,
                  "--chat-bubble-border": draftChatColorStyle.borderColor,
                  "--chat-bubble-text": getReadableChatTextColor(
                    draftChatColorStyle.color,
                  ),
                }}
              >
                Chat
              </div>
            </div>

            <div className="chat-custom-section">
              <div className="chat-custom-section-title">
                <h3>Color</h3>
                <div className="chat-custom-section-pagination">
                  <button
                    type="button"
                    disabled={chatColorPage === 0}
                    onClick={() =>
                      setChatColorPage((prev) => Math.max(prev - 1, 0))
                    }
                    aria-label="이전 컬러 페이지"
                  >
                    ‹
                  </button>

                  <span>
                    {chatColorPage + 1} / {chatColorTotalPages}
                  </span>

                  <button
                    type="button"
                    disabled={chatColorPage >= chatColorTotalPages - 1}
                    onClick={() =>
                      setChatColorPage((prev) =>
                        Math.min(prev + 1, chatColorTotalPages - 1),
                      )
                    }
                    aria-label="다음 컬러 페이지"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="chat-custom-color-list">
                {pagedChatColorEntries.map(([colorKey, colorStyle]) => (
                  <button
                    key={colorKey}
                    type="button"
                    className={`chat-custom-color-option ${
                      draftChatColor === colorKey ? "selected" : ""
                    }`}
                    onClick={() => setDraftChatColor(colorKey)}
                  >
                    <span
                      className="chat-custom-color-swatch"
                      style={{
                        backgroundColor: colorStyle.color,
                        borderColor: colorStyle.borderColor,
                      }}
                    />
                    <span>{colorStyle.name}</span>
                  </button>
                ))}
              </div>

              <div className="chat-custom-custom-color">
                <button
                  type="button"
                  className={`chat-custom-color-option custom ${
                    draftChatColor === CUSTOM_MARKER_COLOR_KEY ? "selected" : ""
                  }`}
                  onClick={() => setDraftChatColor(CUSTOM_MARKER_COLOR_KEY)}
                >
                  <span
                    className="chat-custom-color-swatch"
                    style={{ backgroundColor: draftCustomChatColor }}
                  />
                  <span>사용자 지정</span>
                </button>

                <input
                  type="color"
                  value={draftCustomChatColor}
                  onChange={(event) => {
                    setDraftCustomChatColor(event.target.value);
                    setDraftChatColor(CUSTOM_MARKER_COLOR_KEY);
                  }}
                  aria-label="사용자 지정 채팅 색상"
                />
              </div>
            </div>

            <footer className="chat-custom-actions">
              <button type="button" onClick={closeChatCustomPanel}>
                취소
              </button>
              <button type="button" onClick={handleApplyChatCustom}>
                적용
              </button>
            </footer>
          </section>
        </div>
      )}

      <Draggable
        nodeRef={chatRef}
        bounds="parent"
        cancel=".livechat-form, .livechat-minimize-button"
        // 💡 [핵심] 드래그가 시작될 때 카카오맵이 마우스 이벤트를 가로채지 못하도록 전파를 막습니다.
        onStart={(e) => {
          e.stopPropagation();
        }}
      >
        {/* 💡 카카오맵 기본 이벤트 핸들러들이 이 영역 안으로 침범하지 못하도록 
        onMouseDown 등 마우스 관련 이벤트의 전파를 차단하는 안전 장치 div를 둡니다.
      */}
        <div
          className={`map-livechat-layer ${isChatMinimized ? "minimized" : ""}`}
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
            isMinimized={isChatMinimized}
            onToggleMinimize={() => setIsChatMinimized((prev) => !prev)}
          />
        </div>
      </Draggable>
    </div>
  );
}

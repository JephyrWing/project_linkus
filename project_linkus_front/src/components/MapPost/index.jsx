// 지도 확대 축소 불가능 영역

// MapPost/index.jsx
// → 지도 자체를 관리
// → 현재 사용자 위치를 알고 있음
// → 지도 위에 채팅 말풍선을 띄움

// 지도 위에 채팅 말풍선을 띄워야 하니까 CustomOverlayMap이 필요
// CustomOverlayMap = 카카오 지도 위에 내가 만든 HTML 요소를 직접 올릴 수 있게 해주는 컴포넌트
import { Map, CustomOverlayMap } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../utils/Kakao/UseKakaoLoader";
import React, { useEffect, useRef, useState } from "react";
import LiveChat from "../LiveChat";
import "./mappost.css";

export default function MapPost() {
  useKakaoLoader();

  // 현재 위치 가져오기 실패 시 사용할 기본 위치
  const defaultPosition = {
    lat: 37.2772455336538,
    lng: 127.028007118842,
  };

  // 지도 확대 레벨 고정값
  // 숫자가 작을수록 확대, 숫자가 클수록 축소
  const FIXED_LEVEL = 3;

  // 지도 중심 위치
  const [mapCenter, setMapCenter] = useState(defaultPosition);

  // 현재 사용자 위치
  // 채팅을 보냈을 때 지도 위에 메시지를 띄울 좌표로 사용
  const [currentPosition, setCurrentPosition] = useState(defaultPosition);

  // 지도 위에 표시할 채팅 메시지 목록
  const [mapChatList, setMapChatList] = useState([]);

  // 지도 위 채팅 말풍선에서 더보기/접기를 누른 메시지 id 목록
  // 이 배열 안에 chatId가 들어 있으면 해당 지도 말풍선은 전체 내용이 보임
  const [expandedMapChatIds, setExpandedMapChatIds] = useState([]);

  // 지도 위 채팅 말풍선의 더보기 / 접기 버튼 클릭 시 실행되는 함수
  const handleToggleMapChat = (chatId) => {
    setExpandedMapChatIds((prevIds) => {
      // 이미 펼쳐진 말풍선이면 배열에서 제거해서 접기 상태로 만듦
      if (prevIds.includes(chatId)) {
        return prevIds.filter((id) => id !== chatId);
      }

      // 아직 펼쳐지지 않은 말풍선이면 배열에 추가해서 전체 보기 상태로 만듦
      return [...prevIds, chatId];
    });
  };

  // 지도 객체를 저장하는 ref
  // ref는 값이 바뀌어도 화면을 다시 렌더링하지 않음
  // 여기서는 카카오 지도 객체를 저장해두고 필요할 때 접근하기 위해 사용
  const mapRef = useRef(null);

  // 화면 처음 열릴 때 현재 위치 가져오기
  // 현재 사용자의 현재 위치를 가져와서 두 곳에 저장
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // 지도 중심을 현재 위치로 이동
        setMapCenter(userPosition);

        // 채팅 메시지를 띄울 사용자 위치 저장
        setCurrentPosition(userPosition);
      },
      (err) => {
        console.log("현재 위치 실패, 기본값 사용", err);
      },
    );
  }, []);

  // 채팅 전송 성공 시 지도에 띄우는 함수
  // handle → 어떤 이벤트를 처리하는 함수
  // ChatSent → 채팅이 전송됨
  // ToMap → 지도에도 반영함

  // LiveChat에서 메시지 전송 성공 시 실행되는 함수
  const handleChatSentToMap = (chat) => {
    /*
      chat.latitude, chat.longitude가 있으면 그 값을 사용하고,
      없으면 현재 사용자 위치 currentPosition을 사용한다.
    */
    const mapChat = {
      ...chat,
      chatId: chat.chatId || Date.now(),
      latitude: chat.latitude ?? currentPosition.lat,
      longitude: chat.longitude ?? currentPosition.lng,
    };

    // 기존 지도 채팅 목록 뒤에 새 채팅 추가
    setMapChatList((prevList) => [...prevList, mapChat]);
  };

  return (
    <div className="map-wrapper">
      <Map
        id="map"
        center={mapCenter}
        style={{
          width: "1200px",
          height: "700px",
        }}
        // 지도 확대 레벨을 고정값으로 설정
        level={FIXED_LEVEL}
        onCreate={(map) => {
          // 생성된 카카오 지도 객체를 ref에 저장
          mapRef.current = map;

          // 사용자가 마우스 휠/터치로 확대·축소하지 못하도록 막음
          map.setZoomable(false);

          // 혹시 초기 레벨이 달라졌을 경우 고정 레벨로 맞춤
          map.setLevel(FIXED_LEVEL);
        }}
        onZoomChanged={(map) => {
          // 혹시 확대/축소가 발생하면 다시 고정 레벨로 되돌림
          if (map.getLevel() !== FIXED_LEVEL) {
            map.setLevel(FIXED_LEVEL);
          }
        }}
      >
        {/* 지도 위에 표시되는 채팅 메시지들 */}
        {/* mapChatList에 있는 메시지를 하나씩 꺼내서 지도 위에 띄우는 부분 */}
        {/* 지도 위에 표시되는 채팅 메시지들 */}
        {/* mapChatList에 있는 메시지를 하나씩 꺼내서 지도 위에 띄우는 부분 */}
        {mapChatList.map((chat, index) => {
          // 지도 위 말풍선에서 기본으로 보여줄 최대 글자 수
          // 이 숫자보다 메시지가 길면 처음에는 일부만 보여주고 더보기 버튼을 표시함
          const MAX_MAP_CHAT_PREVIEW_LENGTH = 13;

          // chatId가 없을 경우를 대비해서 index를 임시 key로 사용
          // 실제 서버 데이터에는 chatId가 있는 게 가장 좋음
          const chatKey = chat.chatId ?? index;

          // 메시지 내용이 undefined일 수도 있으므로 빈 문자열로 안전 처리
          const chatText = chat.text || "";

          // 현재 지도 말풍선이 펼쳐진 상태인지 확인
          // expandedMapChatIds 배열 안에 chatKey가 있으면 전체 내용이 보이는 상태
          const isExpanded = expandedMapChatIds.includes(chatKey);

          // 메시지가 기준 길이보다 긴지 확인
          const isLongText = chatText.length > MAX_MAP_CHAT_PREVIEW_LENGTH;

          // 펼쳐진 상태이거나 짧은 글이면 전체 표시
          // 긴 글인데 안 펼쳐졌으면 일부만 잘라서 표시
          const visibleText =
            isExpanded || !isLongText
              ? chatText
              : `${chatText.slice(0, MAX_MAP_CHAT_PREVIEW_LENGTH)}...`;

          return (
            // 지도 위 특정 좌표에 UI를 띄우는 컴포넌트
            <CustomOverlayMap
              key={chatKey}
              // 말풍선이 뜰 지도 좌표
              position={{
                lat: chat.latitude,
                lng: chat.longitude,
              }}
              // 말풍선이 좌표 기준으로 얼마나 위/아래에 배치될지 조절하는 값
              yAnchor={1.4}
              // 지도 위 말풍선 안의 더보기 버튼이 클릭 이벤트를 받을 수 있게 함
              clickable={true}
            >
              <div
                className={`map-chat-bubble ${
                  chat.userId === "나" ? "mine" : "other"
                }`}
              >
                {/* 메시지 작성자 */}
                <strong>{chat.userId === "나" ? "나" : "익명"}</strong>

                {/* 지도 위 말풍선 내용 */}
                {/* 기존 chat.text 대신 visibleText를 출력해야 더보기/접기가 적용됨 */}
                <p className={isExpanded ? "expanded" : ""}>{visibleText}</p>

                {/* 긴 메시지일 때만 더보기 / 접기 버튼 표시 */}
                {isLongText && (
                  <button
                    type="button"
                    className="map-chat-more-button"
                    onClick={(e) => {
                      // 버튼 클릭이 지도 클릭으로 전달되는 것을 막음
                      e.stopPropagation();

                      // 해당 지도 말풍선 더보기 / 접기 전환
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

      {/* mappost에서만 보이는 실시간 채팅창 */}
      {/* LiveChat에게 현재 위치와 지도에 채팅을 추가하는 함수를 넘기는 구조 */}
      <LiveChat
        // 현재 사용자 위치를 넘겨줌 → 채팅 보낼 때 좌표를 같이 서버에 보내기 위해 사용
        currentPosition={currentPosition}
        // 채팅 전송 끝났을 때 실행할 함수 넘겨줌
        // → LiveChat 메시지 보낸 뒤 MapPost에 알려주는 통로
        onChatSent={handleChatSentToMap}
      />
    </div>
  );
}

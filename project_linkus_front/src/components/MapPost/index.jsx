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
      }
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
        {mapChatList.map((chat) => (
          // 지도 위 특정 좌표에 UI를 띄우는 컴포넌트
          <CustomOverlayMap
            key={chat.chatId}
            // 말풍선이 뜰 지도 좌표
            position={{
              lat: chat.latitude,
              lng: chat.longitude,
            }}
            // 말풍선이 좌표 기준으로 얼마나 위/아래에 배치될지 조절하는 값
            // → 이거 바꾸면 말풍선 위치가 마커 기준으로 더 위나 더 아래로 변경됨
            yAnchor={1.4}
          >
            <div
              // 'bubble' 말풍선 UI를 뜻하기 때문에 버블이라고 직관적으로 작명함 큰 의미는 없음
              className={`map-chat-bubble ${
                // 나중에 css 색 변경할 때 쓰려고 mine이랑 other로 나눠 둠
                chat.userId === "나" ? "mine" : "other"
              }`}
            >
              {/* strong 태그는 HTML에서 중요한 텍스트를 의미적으로 강조하고,
              기본적으로 굵게 보여주는 태그 */}
              <strong>{chat.userId === "나" ? "나" : "익명"}</strong>
              <p>{chat.text}</p>
            </div>
          </CustomOverlayMap>
        ))}
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
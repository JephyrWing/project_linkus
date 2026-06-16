// 마커, 현재 위치 버튼, 좌표 박스, 등록 버튼, 게시글 카드 전부 보임

import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../utils/Kakao/UseKakaoLoader";
import React, { useEffect, useState } from "react";
import "./mappost.css";
import "./roadpost.css";

function RoadPost() {
  useKakaoLoader();

  // 현재 위치 가져오기 실패 시 사용할 기본 위치
  const defaultPosition = {
    lat: 37.2772455336538,
    lng: 127.028007118842,
  };

  // 지도 중심 위치
  const [mapCenter, setMapCenter] = useState(defaultPosition);

  // 사용자가 선택한 마커 위치
  const [markerPosition, setMarkerPosition] = useState(defaultPosition);

  // 내 현재 위치 저장
  const [myPosition, setMyPosition] = useState(null);

  // 선택된 게시글 마커
  const [selectedPost, setSelectedPost] = useState(null);

  // 예시 게시글 마커 데이터
  const posts = [
    {
      id: 1,
      title: "첫 번째 위치",
      text: "여기에서 대화가 시작되었습니다.",
      lat: 37.2772455336538,
      lng: 127.028007118842,
    },
  ];

  // 현재 위치 가져오기 함수
  const moveToCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // RoadPost에서는 현재 위치 버튼 기능까지 포함
        setMyPosition(currentPosition);
        setMapCenter(currentPosition);
        setMarkerPosition(currentPosition);
      },
      (err) => {
        console.log("현재 위치 실패, 기본값 사용", err);
      }
    );
  };

  // 화면 처음 열릴 때 현재 위치 가져오기
  useEffect(() => {
    moveToCurrentLocation();
  }, []);

  // 선택 위치 등록 함수
  const handleSavePosition = () => {
    console.log("등록할 위치:", markerPosition);

    alert(
      `선택 위치 등록\n위도: ${markerPosition.lat}\n경도: ${markerPosition.lng}`
    );
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
        level={3}
        onClick={(_, mouseEvent) => {
          const latlng = mouseEvent.latLng;

          // 지도 클릭 시 마커만 이동
          setMarkerPosition({
            lat: latlng.getLat(),
            lng: latlng.getLng(),
          });

          // 지도 빈 곳 클릭 시 게시글 카드 닫기
          setSelectedPost(null);
        }}
      >
        {/* 사용자가 선택한 위치 마커 */}
        <MapMarker position={markerPosition} />

        {/* 게시글 마커 */}
        {posts.map((post) => (
          <MapMarker
            key={post.id}
            position={{
              lat: post.lat,
              lng: post.lng,
            }}
            onClick={() => setSelectedPost(post)}
          />
        ))}

        {/* 게시글 마커 클릭 시 뜨는 카드 */}
        {selectedPost && (
          <CustomOverlayMap
            position={{
              lat: selectedPost.lat,
              lng: selectedPost.lng,
            }}
            yAnchor={1.4}
          >
            <div className="post-overlay-card">
              <strong>{selectedPost.title}</strong>
              <p>{selectedPost.text}</p>
              <button>채팅하기</button>
            </div>
          </CustomOverlayMap>
        )}
      </Map>

      {/* RoadPost에서만 보이는 우측 상단 컨트롤 박스 */}
      <div className="map-control-panel">
        <button onClick={moveToCurrentLocation}>현재 위치로 이동</button>

        <div className="position-info">
          <p>선택 위치</p>
          <span>위도: {markerPosition.lat.toFixed(6)}</span>
          <span>경도: {markerPosition.lng.toFixed(6)}</span>
        </div>

        <button onClick={handleSavePosition}>이 위치 등록하기</button>
      </div>
    </div>
  );
}

export default RoadPost;
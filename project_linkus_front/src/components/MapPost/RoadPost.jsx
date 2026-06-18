// 마커, 현재 위치 버튼, 좌표 박스, 등록 버튼, 게시글 카드 전부 보임

import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../utils/Kakao/UseKakaoLoader";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

import "./mappost.css";
import "./roadpost.css";

function RoadPost() {
  useKakaoLoader();

  // 현재 위치 가져오기 실패 시 사용할 기본 위치
  const defaultPosition = {
    lat: 37.2772455336538,
    lng: 127.028007118842,
  };

  // 지도 확대 레벨 고정값
  // 숫자가 작을수록 확대, 숫자가 클수록 축소
  const FIXED_LEVEL = 3;

  // 예시 게시글 마커 데이터
  const defaultPosts = [
    {
      id: 1,
      title: "첫 번째 위치",
      text: "여기에서 대화가 시작되었습니다.",
      lat: 37.2772455336538,
      lng: 127.028007118842,
    },
  ];

  // 지도 중심 위치
  const [mapCenter, setMapCenter] = useState(defaultPosition);

  // 사용자가 선택한 마커 위치
  const [markerPosition, setMarkerPosition] = useState(defaultPosition);

  // 내 현재 위치 저장
  const [myPosition, setMyPosition] = useState(null);

  // 선택된 게시글 마커
  const [selectedPost, setSelectedPost] = useState(null);

  // 현재 지도 영역 좌표 저장
  const [mapBounds, setMapBounds] = useState(null);

  // 서버에서 받아온 게시글 마커 데이터
  const [posts, setPosts] = useState(defaultPosts);

  // 지도 객체 저장
  const mapRef = useRef(null);

  // onCreate 최초 실행 여부 확인
  const hasInitialBoundsRequestedRef = useRef(false);

  // bounds_changed 요청 디바운스 타이머
  const boundsRequestTimerRef = useRef(null);

  // 마지막 요청 좌표 기억
  const lastBoundsKeyRef = useRef("");

  // 지도 객체에서 남서쪽/북동쪽 좌표를 꺼내는 함수
  const getBoundsParams = (map) => {
    const bounds = map.getBounds();

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    return {
      swLat: sw.getLat(),
      swLng: sw.getLng(),
      neLat: ne.getLat(),
      neLng: ne.getLng(),
    };
  };

  // 현재 보이는 지도 영역 기준으로 서버에 게시글 요청
  const requestPostsByBounds = (map) => {
    if (!map) return;

    const boundsParams = getBoundsParams(map);

    // 같은 지도 영역으로 반복 요청되는 것 방지
    const boundsKey = [
      boundsParams.swLat.toFixed(6),
      boundsParams.swLng.toFixed(6),
      boundsParams.neLat.toFixed(6),
      boundsParams.neLng.toFixed(6),
    ].join(",");

    if (lastBoundsKeyRef.current === boundsKey) {
      return;
    }

    lastBoundsKeyRef.current = boundsKey;

    // bounds_changed는 매우 자주 발생하므로 이전 예약 요청 취소
    if (boundsRequestTimerRef.current) {
      clearTimeout(boundsRequestTimerRef.current);
    }

    // 0.3초 동안 추가 이동이 없으면 요청
    boundsRequestTimerRef.current = setTimeout(async () => {
      // 화면 표시용 좌표 저장
      setMapBounds(boundsParams);

      try {
        const response = await axios.get(
          "http://localhost:8080/api/posts/bounds",
          {
            params: boundsParams,
          }
        );

        const nextPosts = Array.isArray(response.data)
          ? response.data
          : response.data.posts;

        // 응답이 있을 때만 posts 변경
        // 실패하거나 응답이 비어 있으면 기본 마커 유지
        if (nextPosts) {
          setPosts(nextPosts);
        }
      } catch (error) {
        console.error("지도 영역 게시글 요청 실패:", error);
      }
    }, 300);
  };

  // 현재 위치 가져오기 함수
  const moveToCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

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

    return () => {
      if (boundsRequestTimerRef.current) {
        clearTimeout(boundsRequestTimerRef.current);
      }
    };
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
        // 지도 확대 레벨을 고정값으로 설정
        level={FIXED_LEVEL}
        onCreate={(map) => {
          mapRef.current = map;

          // 사용자가 마우스 휠/터치로 확대·축소하지 못하도록 막음
          map.setZoomable(false);

          // 혹시 초기 레벨이 달라졌을 경우 고정 레벨로 맞춤
          map.setLevel(FIXED_LEVEL);

          // onCreate에서 최초 1번만 지도 영역 요청
          if (!hasInitialBoundsRequestedRef.current) {
            hasInitialBoundsRequestedRef.current = true;
            requestPostsByBounds(map);
          }
        }}
        onZoomChanged={(map) => {
          // 혹시 확대/축소가 발생하면 다시 고정 레벨로 되돌림
          if (map.getLevel() !== FIXED_LEVEL) {
            map.setLevel(FIXED_LEVEL);
          }
        }}
        onBoundsChanged={(map) => {
          // 지도 영역이 변경될 때마다 현재 보이는 지도 영역 좌표 요청
          // 확대/축소는 막았으므로 사실상 지도 이동 시에만 실행됨
          requestPostsByBounds(map);
        }}
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

        {/* 서버에서 받아온 게시글 마커 */}
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

        {/* 현재 보이는 지도 영역 표시 */}
        {mapBounds && (
          <div className="position-info">
            <p>현재 지도 영역</p>
            <span>SW 위도: {mapBounds.swLat.toFixed(6)}</span>
            <span>SW 경도: {mapBounds.swLng.toFixed(6)}</span>
            <span>NE 위도: {mapBounds.neLat.toFixed(6)}</span>
            <span>NE 경도: {mapBounds.neLng.toFixed(6)}</span>
          </div>
        )}

        <button onClick={handleSavePosition}>이 위치 등록하기</button>
      </div>
    </div>
  );
}

export default RoadPost;
// 마커, 현재 위치 버튼, 좌표 박스, 등록 버튼, 게시글 카드 전부 보임
// 지도 확대 축소 가능 영역


// CustomOverlayMap = 지도 위에 단순 마커가 아니라,
// 제목, 내용, 버튼이 들어간 박스를 띄우기 위해 사용
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

  // 서버에서 게시글 데이터를 받기 전까지 임시로 보여줄 예시 게시글 마커 데이터
  const defaultPosts = [
    {
      id: 1,
      title: "첫 번째 위치",
      text: "여기에서 대화가 시작되었습니다.",
      lat: 37.2772455336538,
      lng: 127.028007118842,
    },
  ];

  // 지도 중심 위치 와 현재 지도 중심 위치
  const [mapCenter, setMapCenter] = useState(defaultPosition);

  // 사용자가 선택한 마커 위치
  // 다만, 현재 코드에서는 myPosition을 화면에 직접 쓰지는 않고 있고,
  // 추후 아래와 같이 사용 예정
  // - 내 위치 마커 따로 표시
  // - 내 위치 기준 주변 게시글 조회
  // - 내 위치로 돌아가기 기능 개선
  const [markerPosition, setMarkerPosition] = useState(defaultPosition);

  // 내 현재 위치 저장
  const [myPosition, setMyPosition] = useState(null);

  // 선택된 게시글 마커
  //사용자가 게시글 마커를 클릭했을 때, 어떤 게시글을 클릭했는지 저장하는 상태
  // 처음에는 아무 게시글도 선택하지 않았으니까 null
  // setSelectedPost가 있을 때만 게시글 카드가 뜸
  const [selectedPost, setSelectedPost] = useState(null);

  // 현재 지도 영역 좌표 저장
  // 이 값은 getBounds()로 얻은 남서쪽 / 북동쪽 좌표를 담음
  const [mapBounds, setMapBounds] = useState(null);

  // 서버에서 받아온 게시글 마커 데이터
  // defaultPosts: 초기값
  const [posts, setPosts] = useState(defaultPosts);

  // 지도 객체 저장
  const mapRef = useRef(null);

  // onCreate 최초 실행 여부 확인
  // 지도 생성 시 처음 한 번만 영역 요청을 보내기 위한 값
  // 왜 필요?: onCreate가 의도치 않게 여러 번 실행되거나,
  // 렌더링 과정에서 중복 요청이 생길 수 있기 때문
  const hasInitialBoundsRequestedRef = useRef(false);

  // bounds_changed 요청 디바운스 타이머
  // 백엔드에 요청이 너무 많이 가지 않게 하려고 쓰는 것
  // 쉽게 말해, 지도 이동 중에는 계속 요청 미루다가, 사용자가 잠깐 이동을 멈추면 요청을 보내는 구조
  const boundsRequestTimerRef = useRef(null);

  // 마지막 요청 좌표 기억
  // 같은 지도 영역으로 중복 요청 보내지 않기 위해 사용하는 값
  const lastBoundsKeyRef = useRef("");


  // getBoundsParams: 현재 지도에서 보이는 영역의 좌표를 뽑아내는 함수
  // 지도 객체에서 남서쪽/북동쪽 좌표를 꺼내는 함수
  const getBoundsParams = (map) => {
    //  map.getBounds(): 현재 지도 화면의 영역 가져옴
    const bounds = map.getBounds();

    // 남서쪽과 북동쪽 좌표를 가져옴
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // 그리고 각각 위도 경도 꺼냄
    return {
      swLat: sw.getLat(), // 남서쪽 위도
      swLng: sw.getLng(), // 남서쪽 경도
      neLat: ne.getLat(), // 북동쪽 위도
      neLng: ne.getLng(), // 북동쪽 경도
    };
  };

  // requestPostsByBounds:
  // 현재 보이는 지도 영역 기준으로 서버에 게시글 목록을 요청하는 함수
  const requestPostsByBounds = (map) => {
    // 지도 객체 없으면 아무것도 못 하니까 함수 종료
    if (!map) return;
    //getBoundsParams를 통해 남서쪽/북동쪽 좌표를 가져옴
    const boundsParams = getBoundsParams(map);

    // 같은 지도 영역으로 반복 요청되는 것 방지
    const boundsKey = [
      boundsParams.swLat.toFixed(6),
      boundsParams.swLng.toFixed(6),
      boundsParams.neLat.toFixed(6),
      boundsParams.neLng.toFixed(6),
    ].join(",");

    // 이전 요청 좌표와 지금 좌표가 같으면 요청 안 함
    if (lastBoundsKeyRef.current === boundsKey) {
      return;
    }
    //이번 좌표를 마지막 요청 좌표로 저장
    lastBoundsKeyRef.current = boundsKey;

    // bounds_changed는 매우 자주 발생하므로 지도 움직이는 중이면 이전 요청 예약 취소
    if (boundsRequestTimerRef.current) {
      clearTimeout(boundsRequestTimerRef.current);
    }

    // 0.3초 동안 추가 이동이 없으면 요청
    boundsRequestTimerRef.current = setTimeout(async () => {
      // 화면 표시용 좌표 저장
      setMapBounds(boundsParams);

      // 백엔드에 GET 요청
      try {
        const response = await axios.get(
          "http://localhost:8080/api/posts/bounds",
          {
            params: boundsParams,
          },
        );

        // 1. 서버가 바로 배열 주면 그대로 사용
        // 2. 서버가 객체 안에 posts로 주면 response.data.posts를 사용
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
      // 성공 시
      (pos) => {
        // 브라우저에서 받은 현재 위치를 객체로 만듦
        const currentPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        // 내 현재 위치 저장
        setMyPosition(currentPosition);
        // 지도 중심을 현재 위치로 이동
        setMapCenter(currentPosition);
        // 사용자 선택 마커도 현재 위치로 이동
        setMarkerPosition(currentPosition);
      },

      // 실패 시
      (err) => {
        // 위치 권한 거부, 브라우저 위치 실패 등일 때 콘솔에 로그를 찍고 기본 위치를 유지
        console.log("현재 위치 실패, 기본값 사용", err);
      },
    );
  };

  // 화면 처음 열릴 때 현재 위치 가져오기
  // 이 코드는 컴포넌트가 처음 화면에 나타났을 때 한 번 실행
  useEffect(() => {
    // 페이지 열리자마자 현재 위치를 가져와서 지도 중심과 마커를 이동
    moveToCurrentLocation();

    // 컴포넌트 사라질 때 실행되는 부분
    // 이거 안 하면 페이지 떠난 후에도 요청 실행이 될 수 있어서 함
    return () => {
      if (boundsRequestTimerRef.current) {
        clearTimeout(boundsRequestTimerRef.current);
      }
    };
  }, []);

  // 선택 위치 등록 함수 (현재는 테스트 단계라 선택된 좌표를 보여주는 역할만 수행)
  // 실제 서버 저장은 아니고 콘솔과 alert로만 확인
  const handleSavePosition = () => {
    console.log("등록할 위치:", markerPosition);

    alert(
      `선택 위치 등록\n위도: ${markerPosition.lat}\n경도: ${markerPosition.lng}`,
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
        /*
          RoadPost에서는 확대/축소 고정 기능을 제거함

          확대/축소가 되지 않게 하는 기능은 MapPost/index.jsx로 옮겼으므로,
          RoadPost에서는 일반 지도처럼 level={3}만 사용함
        */
        level={3}
        onCreate={(map) => {
          // 생성된 카카오 지도 객체를 ref에 저장
          mapRef.current = map;

          // onCreate에서 최초 1번만 지도 영역 요청
          if (!hasInitialBoundsRequestedRef.current) {
            hasInitialBoundsRequestedRef.current = true;
            requestPostsByBounds(map);
          }
        }}
        onBoundsChanged={(map) => {
          // 지도 영역이 변경될 때마다 현재 보이는 지도 영역 좌표 요청
          // 확대/축소는 막았으므로 사실상 지도 이동 시에만 실행됨
          // RoadPost에서는 지도 영역이 바뀔 때 getBounds()로 좌표를 얻어서 서버 요청
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

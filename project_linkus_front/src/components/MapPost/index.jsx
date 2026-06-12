// CustomOverlayMap : 지도 위에 UI 띄울 때 사용하는 컴포넌트
import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../utils/Kakao/UseKakaoLoader";
import React, { useEffect, useState } from "react";
import "./mappost.css";

export default function MapPost() {
  useKakaoLoader();

  // 기본 위치
  // 현재 위치 가져오기 실패할 시, 기본값으로 쓰일 좌표
  const defaultPosition = {
    lat: 37.2772455336538,
    lng: 127.028007118842,
  };

  // 지도 중심 위치
  //setMapCenter : 지도 중심 위치 변경 함수
  const [mapCenter, setMapCenter] = useState(defaultPosition); 

  // 사용자가 선택한 마커 위치
  //setMarkerPosition : 마커 위치 변경 함수
  const [markerPosition, setMarkerPosition] = useState(defaultPosition);

  // 내 현재 위치 저장
  // setMyPosition(currentPosition)으로 값을 저장함
  // 추후 내 현재 위치 마커 따로 표시, 내 위치로 돌아가기, 내 위치 기준 주변 게시글 조회 만들 때 사용 가능
  const [myPosition, setMyPosition] = useState(null);

  // 사용자가 게시글 마커 클릭할 시, 어떤 게시글이 선택되었는지 저장하는 state
  const [selectedPost, setSelectedPost] = useState(null);

  // 예시 게시글 마커 데이터
  const posts = [
    // 추후 백엔드에서 게시글 목록 얻어올 때, 이 배열을 서버 응답 데이터로 변경
    {
      id: 1,
      title: "첫 번째 위치",
      text: "여기에서 대화가 시작되었습니다.",
      lat: 37.2772455336538, // 위도
      lng: 127.028007118842 // 경도
    }
  ];

  // 현재 위치 가져와서 지도와 마커를 현재 위치로 이동시키는 함수
  const moveToCurrentLocation = () => {
    // 브라우저 위치 정보 기능 사용하는 코드
    // 사용자에게 위치 권한 요청하고, 허용하면 현재 위치 가져옴
    navigator.geolocation.getCurrentPosition(
      // 위치 가져오기 성공할 시
      (pos) => { // 위치 가져오기 성공하면 pos에 위치값 들어감
        const currentPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // 현재 위치 버튼 누르면 지도랑 카머 둘다 내 위치로 이동
        setMyPosition(currentPosition); // 현재 내 위치 저장
        setMapCenter(currentPosition); // 지도 중심을 현재 위치로 이동시키기
        setMarkerPosition(currentPosition); // 현재 위치로 마커 옮기기
      },

      // 위치 가져오기 실패할 시 : 처음 기본 위치 그대로 사용
      // 실패하는 경우
      // 1. 사용자가 위치 권한 거부했을 때
      // 2. 브라우저가 위치 못 가져올 때
      (err) => {
        console.log("현재 위치 실패, 기본값 사용", err);
      }
    );
  };

  // 화면 처음 열릴 때 현재 위치 가져오기
  useEffect(() => {
    moveToCurrentLocation(); // 허용 시 지도와 마커를 현재 위치로 이동
  }, []); // []: 빈 배열이 들어가 있으므로 최초 1회만 실행 됨

  // 사용자가 선택한 위치를 등록하는 함수
  const handleSavePosition = () => {
    // 콘솔(f12)에 선택한 좌표를 출력
    console.log("등록할 위치:", markerPosition);

    // 사용자에게 선택한 위/경도를 팝업으로 보여주기
    // 추후에는 아래와 같이 변경
    // axios.post("/api/posts/location", markerPosition)
    alert(
      `선택 위치 등록\n위도: ${markerPosition.lat}\n경도: ${markerPosition.lng}`
    );
  };

  return (
    // 지도와 오른쪽 컨트롤 패널 감싸는 부모 박스
    <div className="map-wrapper">

      {/* 실제 지도 띄우는 부분 */}
      <Map
        id="map"
        center={mapCenter} // 지도 중심 좌표 정하는 코드
        // 지도 크기 직접 지정
        style={{
          width: "1200px",
          height: "700px",
        }}
        level={3} // 지도 확대 레벨(숫자와 크기가 반비례)

        //사용자가 지도 클릭했을 때 실행되는 코드
        onClick={(_, mouseEvent) => {
          const latlng = mouseEvent.latLng;

          // 사용자가 클릭한 위치로 마커의 위치를 변경
          // 단, 여기선 setMapCenter()를 호출하지 않음
          setMarkerPosition({
            // 클릭한 지점의 위/경도 가져오기
            lat: latlng.getLat(),
            lng: latlng.getLng(),
          });

          // 지도 빈 곳 클릭할 시, 게시글 카드 닫힘
          setSelectedPost(null);
        }}
      >


        {/* 사용자가 선택한 위치 마커 */}
        {/* markerPosition 값이 바뀌면 해당 마커 이동 */}
        <MapMarker position={markerPosition} />

        {/* 예시 게시글 마커들 */}
        {/* posts 배열을 돌면서 게시글 위치마다 마커를 찍는 방식의 코드 */}
        {/* posts.map((post) => ( : 배열의 각 게시글을 하나씩 꺼내서 MapMarker로 바꿈 */}
        {posts.map((post) => ( 
          <MapMarker
            key={post.id}
            // 게시글 마커 위치
            position={{
              lat: post.lat,
              lng: post.lng,
            }}
            // 게시글 마커 클릭 시, 해당 게시글을 선택 상태로 저장
            onClick={() => setSelectedPost(post)}
          />
        ))}

        {/* 게시글 마커 클릭 시 뜨는 카드 */}
        {/* selectedPost가 null이면 아무것도 안 보여줌
        selectedPost에 게시글이 들어 있으면 카드 보여줌 */}
        {selectedPost && (
          <CustomOverlayMap
          // 카드를 선택한 게시글 마커 위치에 띄움
            position={{
              lat: selectedPost.lat,
              lng: selectedPost.lng,
            }}
            // 오버레이의 세로 기준 위치를 조절하는 값
            // 값 조절 시, 마크 기준으로 카드가 뜨는 위치가 변경됨
            yAnchor={1.4}
          >

            {/* 카드 내용 : 선택한 게시글의 제목과 내용을 보여주는 카드 */}
            {/* post-overlay-card: 지도 위에 올릴 컨트롤 박스 
            기능: 현재 위치로 이동 버튼, 
            선택 위치 좌표 표시, 
            이 위치 등록하기 버튼*/}
            <div className="post-overlay-card"> 
              <strong>{selectedPost.title}</strong>
              <p>{selectedPost.text}</p>
              <button>채팅하기</button>  {/* 아직은 작동하지 않는 버튼 */}
            </div>
          </CustomOverlayMap>
        )}
      </Map>

      <div className="map-control-panel">
        {/* 클릭 시, moveToCurrentLocation 함수 실행 
        즉, 현재 위치를 다시 가져와서 지도 중심과 마커 위치를 현재 위치로 변경*/}
        <button onClick={moveToCurrentLocation}>현재 위치로 이동</button>

        {/* 현재 마커 위치의 위/경도를 보여주는 부분 */}
        <div className="position-info">
          <p>선택 위치</p>
          {/* .toFixed(6): 소수점 6자리까지 보여줌 */}
          <span>위도: {markerPosition.lat.toFixed(6)}</span>
          <span>경도: {markerPosition.lng.toFixed(6)}</span>
        </div>

        {/* 위치 등록 버튼 */}
        <button onClick={handleSavePosition}>이 위치 등록하기</button>
      </div>
    </div>
  );
}
// 선택한 마커 위치를 기준으로 카카오 로드뷰 창을 띄우는 컴포넌트
// 로드뷰 안에서 현재 로드뷰 위치 좌표에 마커를 찍고,
// 사용자가 슬라이더로 마커 고도를 조절할 수 있게 함

import { useEffect, useRef, useState } from "react";
import "./roadviewpost.css";

// isOpen: 로드뷰 창을 보여줄지 말지 결정
// position: 로드뷰를 띄울 기준 좌표
// onClose: 닫기 버튼을 눌렀을 때 실행할 함수
function RoadViewPost({ isOpen, position, onClose }) {
  // 로드뷰가 실제로 들어갈 div를 기억하는 변수
  const roadviewContainerRef = useRef(null);

  // 생성된 카카오 로드뷰 객체를 저장하는 ref
  // 버튼 클릭 시 roadview.getPosition()을 사용해야 하므로 ref에 저장함
  const roadviewRef = useRef(null);

  // 로드뷰 안에 찍은 마커 객체를 저장하는 ref
  // 고도 슬라이더를 움직일 때 이 마커의 setAltitude()를 실행함
  const roadviewMarkerRef = useRef(null);

  // 로드뷰 안에 띄운 인포윈도우를 저장하는 ref
  const roadviewInfoWindowRef = useRef(null);

  // 로드뷰를 불러오지 못했을 때 사용자에게 보여줄 메시지
  const [roadViewMessage, setRoadViewMessage] = useState("");

  // 사용자가 로드뷰 안에 찍은 마커의 좌표 정보
  const [pickedRoadviewPosition, setPickedRoadviewPosition] = useState(null);

  // 로드뷰 마커 고도값
  // 사용자가 range 슬라이더를 움직이면 이 값이 바뀜
  // 값이 커질수록 로드뷰 안에서 마커가 더 위쪽에 떠 보임
  const [markerAltitude, setMarkerAltitude] = useState(3);

  // 로드뷰를 다시 불러오는 역할
  useEffect(() => {
    // 로드뷰 창이 닫혀 있으면 아무 작업도 하지 않음
    if (!isOpen) return;

    // 좌표(position) 값이 없으면 로드뷰를 띄울 좌표가 없으므로 종료
    if (!position) return;

    // 로드뷰를 넣을 div가 아직 준비되지 않았다면 종료
    if (!roadviewContainerRef.current) return;

    // Kakao Map SDK가 아직 로드되지 않았으면 종료
    if (!window.kakao || !window.kakao.maps) return;

    // 이전 메시지 초기화
    setRoadViewMessage("");

    // 이전에 찍었던 로드뷰 마커 좌표 초기화
    setPickedRoadviewPosition(null);

    // 로드뷰를 다시 열 때 기존 마커가 남아 있지 않도록 정리
    if (roadviewMarkerRef.current) {
      roadviewMarkerRef.current.setMap(null);
      roadviewMarkerRef.current = null;
    }

    // 로드뷰를 다시 열 때 기존 인포윈도우가 남아 있지 않도록 정리
    if (roadviewInfoWindowRef.current) {
      roadviewInfoWindowRef.current.close();
      roadviewInfoWindowRef.current = null;
    }

    // 지도에서 정한 위치를 로드뷰에 표시하는 구조
    // 카카오 지도 API에서 사용할 수 있는 좌표 객체 생성
    // new window.kakao.maps.LatLng(position.lat, position.lng) 쓰는 이유:
    // 카카오 지도 API는 일반 객체 바로 안 쓰지만, LatLng 객체가 필요하기 때문
    //
    // 주의:
    // new window.kakao.maps.LatLng({ position: ..., map: ... }) 형식이 아니라
    // new window.kakao.maps.LatLng(위도, 경도) 형식으로 써야 함
    const roadViewPosition = new window.kakao.maps.LatLng(
      position.lat,
      position.lng
    );

    // 실제 로드뷰 화면 구현 부분
    const roadview = new window.kakao.maps.Roadview(
      // 로드뷰 넣을 div(div 안에 카카오 로드뷰 화면이 들어감)
      roadviewContainerRef.current
    );

    // 다른 함수에서도 roadview 객체를 사용할 수 있게 ref에 저장
    roadviewRef.current = roadview;

    // RoadviewClient: 특정 좌표 주변에 로드뷰가 있는지 찾는 도구
    const roadviewClient = new window.kakao.maps.RoadviewClient();

    // 선택한 좌표 근처 100m 안에서 가장 가까운 로드뷰 panoId를 검색
    // 현재 좌표 주변에서 가장 가까운 로드뷰 지점 찾을 때 쓰는 거 = getNearestPanoId()
    roadviewClient.getNearestPanoId(roadViewPosition, 100, (panoId) => {
      if (panoId) {
        roadview.setPanoId(panoId, roadViewPosition);
      } else {
        setRoadViewMessage("이 위치 주변에는 로드뷰가 없습니다.");
      }
    });
  }, [isOpen, position]);

  // 로드뷰 안에 마커를 찍는 함수
  // 위치는 로드뷰 현재 위치가 아니라,
  // RoadPost에서 선택한 markerPosition, 즉 props로 받은 position을 기준으로 사용
  const handleAddRoadviewMarker = () => {
    // 로드뷰 객체가 아직 없으면 실행하지 않음
    if (!roadviewRef.current) return;

    // Kakao Map SDK가 아직 없으면 실행하지 않음
    if (!window.kakao || !window.kakao.maps) return;

    // position 값이 없으면 마커를 찍을 기준 좌표가 없으므로 종료
    if (!position) return;

    // 변수 이름 짧게 요약해서 쓰려고 roadview라는 변수에 roadviewRef.current 담기
    const roadview = roadviewRef.current;

    // 지도에서 선택한 위치를 카카오 LatLng 객체로 변환
    // 이 좌표가 로드뷰 안에 찍을 마커의 위치가 됨
    const markerRoadviewPosition = new window.kakao.maps.LatLng(
      position.lat,
      position.lng
    );

    // 기존 로드뷰 마커가 있으면 제거
    // 새 마커를 찍기 전에 기존 마커를 없애서 마커가 여러 개 쌓이지 않게 함
    if (roadviewMarkerRef.current) {
      roadviewMarkerRef.current.setMap(null);
      roadviewMarkerRef.current = null;
    }

    // 기존 인포윈도우가 있으면 닫기
    if (roadviewInfoWindowRef.current) {
      roadviewInfoWindowRef.current.close();
      roadviewInfoWindowRef.current = null;
    }

    // 로드뷰 안에 올릴 마커 생성
    // map에 일반 지도 객체가 아니라 roadview 객체를 넣는 것이 핵심
    const roadviewMarker = new window.kakao.maps.Marker({
      position: markerRoadviewPosition,

      // 로드뷰 안에 마커 찍고 싶으니까 map 로드뷰 객체 넣기
      map: roadview,
    });

    // 현재 슬라이더 값으로 마커 고도 설정
    roadviewMarker.setAltitude(markerAltitude);

    // 마커가 보이는 반경 설정
    // 로드뷰 중심좌표와 마커 중심좌표 사이 거리가 100m 안일 때 보이게 함
    roadviewMarker.setRange(100);

    // 로드뷰 마커 위에 표시할 정보창을 만드는 코드
    // content에는 HTML 문자열이나 텍스트를 넣을 수 있음
    const roadviewInfoWindow = new window.kakao.maps.InfoWindow({
      content: "선택한 위치",
    });

    // 인포윈도우도 로드뷰 안에서 일정 범위 안에 있을 때 보이게 설정
    // 카카오 API 버전에 따라 setRange가 없을 수도 있어서 함수 존재 여부를 확인함
    if (typeof roadviewInfoWindow.setRange === "function") {
      roadviewInfoWindow.setRange(100);
    }

    // 실제로 로드뷰 위의 마커에 정보창을 붙여서 엶
    roadviewInfoWindow.open(roadview, roadviewMarker);

    // 마커와 인포윈도우 객체를 ref에 저장
    // 나중에 다른 함수에서 접근이 가능하도록 방금 만든 마커와 정보창을 ref에 저장
    roadviewMarkerRef.current = roadviewMarker;
    roadviewInfoWindowRef.current = roadviewInfoWindow;

    // 화면 표시용 좌표 저장
    setPickedRoadviewPosition({
      lat: markerRoadviewPosition.getLat(),
      lng: markerRoadviewPosition.getLng(),
    });

    // 마커가 화면 중앙 쪽에 잘 보이도록 로드뷰 시점 조정
    const projection = roadview.getProjection();

    // 현재 마커 위치와 고도를 기준으로,
    // 로드뷰가 어느 방향을 바라봐야 마커가 잘 보이는지 계산
    const viewpoint = projection.viewpointFromCoords(
      markerRoadviewPosition,
      markerAltitude
    );

    // 마커를 찍은 직후, 마커가 화면 중앙 쪽에 잘 보이도록 로드뷰 시야를 조정
    roadview.setViewpoint(viewpoint);
  };

  // 고도 슬라이더를 움직였을 때 실행되는 함수
  const handleAltitudeChange = (e) => {
    // input range 값은 문자열로 들어오므로 Number로 숫자 변환
    const nextAltitude = Number(e.target.value);

    // 화면 표시용 state 변경
    setMarkerAltitude(nextAltitude);

    // 이미 로드뷰 마커가 찍혀 있다면 즉시 고도 반영
    // 사용자가 슬라이더를 움직이면 마커가 바로 위아래로 움직이는 효과가 남
    if (roadviewMarkerRef.current) {
      roadviewMarkerRef.current.setAltitude(nextAltitude);
    }

    // 마커가 있는 상태라면 고도 변경 후 마커가 잘 보이도록 시점도 다시 맞춤
    if (roadviewRef.current && roadviewMarkerRef.current) {
      // 로드뷰 객체, 마커 위치, 좌표 변환 도구를 준비
      // markerPosition은 현재 마커가 찍힌 좌표
      const roadview = roadviewRef.current;
      const markerPosition = roadviewMarkerRef.current.getPosition();
      const projection = roadview.getProjection();

      // 새 고도에 맞춰서 마커가 잘 보이는 시점을 다시 계산
      const viewpoint = projection.viewpointFromCoords(
        markerPosition,
        nextAltitude
      );

      // 계산한 시점으로 로드뷰 시야를 다시 맞춤
      // 쉽게 말해, 슬라이더를 움직일 때마다 로드뷰가 마커를 바라보게 함
      roadview.setViewpoint(viewpoint);
    }
  };

  // 로드뷰 마커 제거 함수
  const handleRemoveRoadviewMarker = () => {
    // 로드뷰 마커가 있으면 제거
    if (roadviewMarkerRef.current) {
      // setMap(null) = 마커를 화면에서 제거하는 코드
      roadviewMarkerRef.current.setMap(null);

      // 저장된 마커 객체도 비움
      roadviewMarkerRef.current = null;
    }

    // 인포윈도우가 있으면 닫기
    if (roadviewInfoWindowRef.current) {
      roadviewInfoWindowRef.current.close();
      roadviewInfoWindowRef.current = null;
    }

    // 선택 좌표 초기화
    setPickedRoadviewPosition(null);
  };

  // 로드뷰 창 닫기 버튼 클릭 시 실행
  const handleCloseRoadview = () => {
    // 로드뷰 창을 닫기 전에 마커와 인포윈도우도 정리
    handleRemoveRoadviewMarker();

    // 부모 컴포넌트에서 넘겨준 닫기 함수 실행
    onClose();
  };

  // isOpen이 false면 화면에 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  // 전체 로드뷰 창 감싸는 박스
  return (
    <div className="roadview-post-layer">
      {/* 로드뷰 창 위쪽 제목 영역 */}
      <div className="roadview-post-header">
        <strong>RoadView</strong>

        <button type="button" onClick={handleCloseRoadview}>
          X
        </button>
      </div>

      {/* 로드뷰 조작 버튼 영역 */}
      <div className="roadview-post-tools">
        <button type="button" onClick={handleAddRoadviewMarker}>
          현재 위치에 마커 찍기
        </button>

        <button type="button" onClick={handleRemoveRoadviewMarker}>
          마커 제거
        </button>
      </div>

      {/* 고도 조절 슬라이더 영역 */}
      <div className="roadview-altitude-control">
        <div className="roadview-altitude-title">
          <span>마커 고도</span>
          <strong>{markerAltitude}</strong>
        </div>

        <input
          type="range"
          min="0"
          max="20"
          step="1"
          value={markerAltitude}
          onChange={handleAltitudeChange}
        />

        <div className="roadview-altitude-labels">
          <span>낮게</span>
          <span>높게</span>
        </div>
      </div>

      {/* 사용자가 찍은 로드뷰 마커 좌표 표시 */}
      {pickedRoadviewPosition && (
        <div className="roadview-picked-info">
          <span>위도: {pickedRoadviewPosition.lat.toFixed(6)}</span>
          <span>경도: {pickedRoadviewPosition.lng.toFixed(6)}</span>
        </div>
      )}

      {/* 실제 로드뷰 들어가는 영역 */}
      <div className="roadview-post-body">
        {/* 여기 div 안에 카카오 로드뷰 생성됨 */}
        <div ref={roadviewContainerRef} className="roadview-post-view" />

        {/* roadViewMessage에 값 있으면 보이고, 없으면 아무것도 안 보임 */}
        {roadViewMessage && (
          <div className="roadview-post-message">{roadViewMessage}</div>
        )}
      </div>
    </div>
  );
}

export default RoadViewPost;
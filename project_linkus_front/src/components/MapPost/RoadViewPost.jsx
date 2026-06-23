// 선택한 마커 위치를 기준으로 카카오 로드뷰 창을 띄우는 컴포넌트

import { useEffect, useRef, useState } from "react";
import "./roadviewpost.css";

// inOpen: 로드뷰 창을 보여줄지 말지 결정
// position: 로드뷰를 띄울 기준 좌표
// onClose: 닫기 버튼을 눌렀을 때 실행할 함수
function RoadViewPost({ isOpen, position, onClose }) {
  // 로드뷰가 실제로 들어갈 div를 기억하는 변수
  const roadviewContainerRef = useRef(null);

  // 로드뷰를 불러오지 못했을 때 사용자에게 보여줄 메시지
  const [roadViewMessage, setRoadViewMessage] = useState("");

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

    // 카카오 지도 API에서 사용할 수 있는 좌표 객체 생성
    // new window.kakao.maps.LatLng(position.lat, position.lng) 쓰는 이유:
    // 카카오 지도 API는 일반 객체 바로 안 쓰지만, LatLng 객체가 필요하기 때문
    const roadViewPosition = new window.kakao.maps.LatLng(
      position.lat,
      position.lng
    );

    // 실제 로드뷰 화면 구현 부분
    const roadview = new window.kakao.maps.Roadview(
      // 로드뷰 넣을 div(div 안에 카카오 로드뷰 화면이 들어감)
      roadviewContainerRef.current
    );

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

  // isOpen이 false면 화면에 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  // 전체 로드뷰 창 감싸는 박스
  return (
    <div className="roadview-post-layer">
      {/* 로드뷰 창 위쪽 제목 영역 */}
      <div className="roadview-post-header">
        <strong>로드뷰</strong>

        <button type="button" onClick={onClose}>
          닫기
        </button>
      </div>

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
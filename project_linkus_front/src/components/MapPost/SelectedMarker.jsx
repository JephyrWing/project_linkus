// 마커를 어떻게 그릴지 담당하는 영역

// 사용자가 선택한 위치를 표시하는 커스텀 마커 컴포넌트
// 기본 Kakao MapMarker 대신 CustomOverlayMap으로 직접 만든 마커를 표시함
// 마커 색상, 모양, 클릭, 3초 누르기 기능을 자유롭게 제어하기 위해 만듦

// useEffect: 컴포넌트가 사라질 때 남아 있는 타이머를 정리하기 위해 사용
// useRef: 3초 누르기 타이머와, 길게 누르기 실행 여부를 저장하기 위해 사용
import { useEffect, useRef } from "react";

// CustomOverlayMap: button과 span으로 만든 커스텀 마커를 지도 위에 올리기 위해 사용
import { CustomOverlayMap } from "react-kakao-maps-sdk";

import "./selectedmarker.css"

function SelectedMarker({
  // 마커가 지도 위에 표시될 위치
  position,
  // 사용자가 선택한 마커 스타일 정보
  markerStyle,
  // 마커 위에 마우스를 올렸을 때 실행할 함수
  onMouseOver,
  // 마커 밖으로 마우스가 벗어났을 때 실행할 함수
  onMouseOut,
  // 마커를 짧게 클릭했을 때 실행할 함수
  onClick,
  // 마커를 3초 이상 길게 눌렀을 때 실행할 함수
  onLongPress,
}) {
  // 3초 이상 누르기 타이머 저장
  // setTimeout의 반환값을 저장해두는 ref
  // 나중에 마우스를 떼거나 영역을 벗어나면 clearTimeout으로 취소할 수 있음

  // useState가 아니라 useRef를 쓰는 이유:
  // 타이머 id는 화면에 보여줄 값이 아니므로 state로 관리할 필요가 없음
  // state로 관리하면 불필요하게 화면이 다시 렌더링될 수 있음
  const longPressTimerRef = useRef(null);

  // 3초 이상 누르기가 실행되었는지 저장
  // true이면 손을 뗐을 때 일반 클릭이 실행되지 않게 막음
  const longPressDoneRef = useRef(false);

  // markerStyle이 혹시 undefined로 들어와도 화면이 터지지 않게 기본값을 준비
  // 나중에 RoadPost.jsx에서 markerStyle을 넘기는 걸 깜빡하면
  // markerStyle.color에서 에러가 날 수 있으므로 방어 코드로 넣음
  const safeMarkerStyle = markerStyle || {
    color: "#2f8cff",
    borderColor: "white",
    innerColor: "white",
  };

  // 마커를 누르기 시작했을 때 실행
  const handlePressStart = (e) => {
    // 지도 클릭 이벤트로 전파되는 것을 막음
    // 이게 없으면 마커를 눌렀는데 Map의 onClick도 같이 실행될 수 있음
    e.stopPropagation();

    // 이전 타이머가 남아 있을 수 있으므로 제거
    // 사용자가 빠르게 여러 번 누르는 경우 이전 타이머가 남으면 오작동할 수 있음
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // 아직 길게 누르기가 실행되지 않은 상태로 초기화
    // 새로 누르기 시작할 때마다 false로 돌려놓음
    longPressDoneRef.current = false;

    // 3초 동안 누르고 있으면 onLongPress 실행
    // 500은 500ms, 즉 0.5초를 의미함
    longPressTimerRef.current = setTimeout(() => {
      // 0.5초 이상 누르기가 실행되었음을 기록
      // 이 값이 true가 되면 손을 뗐을 때 일반 클릭을 실행하지 않음
      longPressDoneRef.current = true;

      // RoadPost.jsx에서 넘겨준 onLongPress 함수가 있으면 실행
      // 보통 이 함수 안에서 로드뷰 창을 열게 됨
      if (onLongPress) {
        onLongPress();
      }
    }, 500);
  };

  // 마커에서 손을 뗐을 때 실행
  const handlePressEnd = (e) => {
    // 이벤트가 지도까지 전달되는 것을 막음
    e.stopPropagation();

    // 진행 중인 0.5초 타이머 제거
    // 0.5초가 되기 전에 손을 뗐다면 로드뷰가 열리지 않도록 타이머를 취소함
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // 이미 0.5초 이상 누르기가 실행된 경우
    // 이때는 로드뷰가 열린 상태이므로 일반 클릭 기능은 실행하지 않음
    if (longPressDoneRef.current) {
      // 다음 클릭을 위해 다시 false로 초기화
      longPressDoneRef.current = false;
      return;
    }

    // 0.5초 전에 손을 뗀 경우는 일반 클릭으로 처리
    if (onClick) {
      onClick();
    }
  };

  // 누르다가 마커 밖으로 벗어났을 때 실행
  const handlePressCancel = (e) => {
    // 이벤트가 지도까지 전달되는 것을 막음
    e.stopPropagation();

    // 진행 중인 길게 누르기 타이머 취소
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // 컴포넌트가 사라질 때 타이머 정리
  // 페이지 이동이나 컴포넌트 언마운트 시 남은 타이머가 실행되지 않게 함
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return (
    // CustomOverlayMap은 지도 위에 직접 만든 HTML 요소를 올려주는 역할
    // position은 RoadPost.jsx에서 받은 markerPosition
    // yAnchor={1}은 마커의 아래쪽 끝이 좌표에 맞도록 조정하는 값
    // clickable = 지도 위에 커스텀 오버레이를 표시하고, 그 안에 있는 button을 클릭 가능한 요소로 처리
    <CustomOverlayMap position={position} yAnchor={1} clickable={true}>
      <button
        type="button"
        className="selected-marker"
        aria-label="선택 위치 마커"
        // aria-label: 화면에는 보이지 않지만 스크린 리더가 읽을 수 있는 설명
        // 접근성을 위해 넣음

        // 마우스를 올렸을 때 RoadPost의 hover 안내 말풍선 함수 실행
        // 기존 MapMarker의 onMouseOver 역할을 대신함
        onMouseEnter={(e) => {
          // 이벤트가 지도까지 전달되는 것을 막음
          e.stopPropagation();

          // RoadPost.jsx에서 넘겨준 onMouseOver 함수가 있으면 실행
          // 보통 hoveredMarker 값을 세팅해서 안내 말풍선을 보여줌
          if (onMouseOver) {
            onMouseOver();
          }
        }}

        // 마우스가 벗어나면 hover 말풍선 숨김 + 길게 누르기 취소
        // 기존 MapMarker의 onMouseOut 역할을 대신함
        onMouseLeave={(e) => {
          // 마커를 누르다가 마우스가 밖으로 나간 경우
          // 0.5초 타이머가 계속 돌지 않도록 취소
          handlePressCancel(e);

          // RoadPost.jsx에서 넘겨준 onMouseOut 함수가 있으면 실행
          // 보통 hoveredMarker를 null로 만들어 말풍선을 숨김
          if (onMouseOut) {
            onMouseOut();
          }
        }}

        // 마우스 누르기 시작
        // 사용자가 마커를 누르는 순간 0.5초 타이머 시작
        onMouseDown={handlePressStart}

        // 마우스 손 떼기
        // 0.5초 전에 떼면 일반 클릭 처리
        // 0.5초 이상 눌렀다면 일반 클릭은 막고 로드뷰만 유지
        onMouseUp={handlePressEnd}
      >
        {/*
          실제 마커 핀 모양을 담당하는 span

          button 자체는 클릭 영역 역할을 하고,
          selected-marker-pin이 실제 눈에 보이는 파란 핀 역할을 함
        */}
        <span
          className="selected-marker-pin"
          style={{
            // markerStyles.js에서 전달받은 마커 색상 적용
            backgroundColor: safeMarkerStyle.color,

            // 마커 테두리 색상 적용
            borderColor: safeMarkerStyle.borderColor,
          }}
        >
          {/*
            마커 안쪽 점

            기존 카카오 기본 마커처럼 가운데에 작은 점을 넣기 위한 요소
            색상도 markerStyles.js에서 받아서 적용 가능
          */}
          <span
            className="selected-marker-dot"
            style={{
              // 마커 내부 점 색상 적용
              backgroundColor: safeMarkerStyle.innerColor,
            }}
          />
        </span>
      </button>
    </CustomOverlayMap>
  );
}

export default SelectedMarker;
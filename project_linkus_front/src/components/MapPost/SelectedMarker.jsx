// 마커를 어떻게 그릴지 담당하는 영역

// 사용자가 선택한 위치를 표시하는 커스텀 마커 컴포넌트
// 기본 Kakao MapMarker 대신 CustomOverlayMap으로 직접 만든 마커를 표시함
// 마커 색상, 모양, 클릭, 3초 누르기 기능을 자유롭게 제어하기 위해 만듦

// useEffect: 컴포넌트가 사라질 때 남아 있는 타이머를 정리하기 위해 사용
// useRef: 3초 누르기 타이머와, 길게 누르기 실행 여부를 저장하기 위해 사용
import { useEffect, useRef } from "react";

// CustomOverlayMap: button과 span으로 만든 커스텀 마커를 지도 위에 올리기 위해 사용
import { CustomOverlayMap } from "react-kakao-maps-sdk";

import "./selectedmarker.css";

export const MarkerIcon = ({ markerStyle, size = 34 }) => {
  const color = markerStyle?.color || "#92715c";
  const borderColor = markerStyle?.borderColor || "#ffffff";
  const innerColor = markerStyle?.innerColor || "#ffffff";
  const shape = markerStyle?.shape || "pin";

  const dot = <circle cx="24" cy="24" r="5.5" fill={innerColor} />;

  const icons = {
    pin: (
      <>
        <path d="M24 4C13.5 4 6 11.8 6 22c0 13.5 18 30 18 30s18-16.5 18-30C42 11.8 34.5 4 24 4Z" />
        {dot}
      </>
    ),

    circle: (
      <>
        <circle cx="24" cy="24" r="17" />
        {dot}
      </>
    ),

    diamond: (
      <>
        <path d="M24 5L43 24L24 43L5 24Z" />
        {dot}
      </>
    ),

    square: (
      <>
        <rect x="8" y="8" width="32" height="32" rx="7" />
        {dot}
      </>
    ),

    shield: (
      <>
        <path d="M24 5L40 11V23C40 35 32 43 24 47C16 43 8 35 8 23V11L24 5Z" />
        {dot}
      </>
    ),

    flag: (
      <>
        <path d="M11 7H15V47H11Z" />
        <path d="M15 9H39C42 9 43.5 12.5 41.5 15L38 19L41.5 23C43.5 25.5 42 29 39 29H15Z" />
        {dot}
      </>
    ),

    hexagon: (
      <>
        <path d="M15 7H33L44 24L33 41H15L4 24Z" />
        {dot}
      </>
    ),

    pentagon: (
      <>
        <path d="M24 5L43 19L36 43H12L5 19Z" />
        {dot}
      </>
    ),

    triangle: (
      <>
        <path d="M24 6L44 42H4Z" />
        {dot}
      </>
    ),

    drop: (
      <>
        <path d="M24 5C34 15 42 22 42 32C42 42 34 49 24 49C14 49 6 42 6 32C6 22 14 15 24 5Z" />
        {dot}
      </>
    ),

    badge: (
      <>
        <path d="M24 5L30 12L39 11L40 20L47 24L40 30L39 39L30 38L24 47L18 38L9 39L8 30L1 24L8 20L9 11L18 12Z" />
        {dot}
      </>
    ),

    star: (
      <>
        <path d="M24 4L29.5 17L43.5 18.5L33 28L36 42L24 34.5L12 42L15 28L4.5 18.5L18.5 17Z" />
        {dot}
      </>
    ),

    heart: (
      <>
        <path d="M24 43C12 33 6 26.5 6 17.5C6 10.5 11 6 17 6C20.5 6 23 8 24 10C25 8 27.5 6 31 6C37 6 42 10.5 42 17.5C42 26.5 36 33 24 43Z" />
        {dot}
      </>
    ),

    cat: (
      <>
        <path d="M11 14L18 7L21 15H27L30 7L37 14V31C37 40 31.5 46 24 46C16.5 46 11 40 11 31Z" />
        <circle cx="18.5" cy="25" r="2.3" fill={innerColor} />
        <circle cx="29.5" cy="25" r="2.3" fill={innerColor} />
      </>
    ),

    bear: (
      <>
        <circle cx="14" cy="15" r="7" />
        <circle cx="34" cy="15" r="7" />
        <circle cx="24" cy="28" r="17" />
        <circle cx="18.5" cy="25" r="2.3" fill={innerColor} />
        <circle cx="29.5" cy="25" r="2.3" fill={innerColor} />
      </>
    ),

    flower: (
      <>
        <circle cx="24" cy="10" r="8" />
        <circle cx="37" cy="20" r="8" />
        <circle cx="32" cy="36" r="8" />
        <circle cx="16" cy="36" r="8" />
        <circle cx="11" cy="20" r="8" />
        <circle cx="24" cy="25" r="9" />
        {dot}
      </>
    ),

    cloud: (
      <>
        <path d="M15 39C8.5 39 4 35 4 29.5C4 24.5 8 20.5 13 20C15 13 21 9 28 10.5C34 11.5 38 16.5 38.5 22C43 23 46 26.5 46 31C46 35.8 42 39 36 39Z" />
        {dot}
      </>
    ),

    crown: (
      <>
        <path d="M6 39L9 14L19 27L24 10L29 27L39 14L42 39Z" />
        <rect x="8" y="39" width="32" height="6" rx="3" />
        {dot}
      </>
    ),

    house: (
      <>
        <path d="M5 24L24 8L43 24V44H30V31H18V44H5Z" />
        {dot}
      </>
    ),

    chat: (
      <>
        <path d="M7 10H41V34H27L16 44V34H7Z" />
        {dot}
      </>
    ),

    sparkle: (
      <>
        <path d="M24 4L29 19L44 24L29 29L24 44L19 29L4 24L19 19Z" />
        {dot}
      </>
    ),

    ribbon: (
      <>
        <path d="M5 12L20 20V8H28V20L43 12L37 42L24 32L11 42Z" />
        {dot}
      </>
    ),

    paw: (
      <>
        <circle cx="14" cy="15" r="5" />
        <circle cx="24" cy="11" r="5" />
        <circle cx="34" cy="15" r="5" />
        <circle cx="17" cy="26" r="5" />
        <circle cx="31" cy="26" r="5" />
        <path d="M24 25C32 25 38 34 34 41C31 46 17 46 14 41C10 34 16 25 24 25Z" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 56"
      className="marker-svg-icon"
      aria-hidden="true"
    >
      <g
        fill={color}
        stroke={borderColor}
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {icons[shape] || icons.pin}
      </g>
    </svg>
  );
};

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
  // 아직 저장되지 않은 작성 예정 위치 마커인지 여부
  isTemporary = false,
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
  const activePointerIdRef = useRef(null);
  const pressPositionRef = useRef(null);

  // markerStyle이 혹시 undefined로 들어와도 화면이 터지지 않게 기본값을 준비
  // 나중에 RoadPost.jsx에서 markerStyle을 넘기는 걸 깜빡하면
  // markerStyle.color에서 에러가 날 수 있으므로 방어 코드로 넣음
  const safeMarkerStyle = markerStyle || {
    shape: "pin",
    color: "#2f8cff",
    borderColor: "white",
    innerColor: "white",
  };

  const markerShape = safeMarkerStyle.shape || "pin";

  // 마커를 누르기 시작했을 때 실행
  const handlePressStart = (e) => {
    // 지도 클릭 이벤트로 전파되는 것을 막음
    // 이게 없으면 마커를 눌렀는데 Map의 onClick도 같이 실행될 수 있음
    e.stopPropagation();

    if (e.pointerType === "mouse" && e.button !== 0) return;

    activePointerIdRef.current = e.pointerId;
    pressPositionRef.current = { x: e.clientX, y: e.clientY };

    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }

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

    if (activePointerIdRef.current !== e.pointerId) return;

    if (
      e.currentTarget.hasPointerCapture?.(e.pointerId) &&
      e.currentTarget.releasePointerCapture
    ) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    activePointerIdRef.current = null;
    pressPositionRef.current = null;

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

    activePointerIdRef.current = null;
    pressPositionRef.current = null;
    longPressDoneRef.current = false;

    // 진행 중인 길게 누르기 타이머 취소
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePressMove = (e) => {
    if (
      activePointerIdRef.current !== e.pointerId ||
      !pressPositionRef.current
    ) {
      return;
    }

    const movedX = Math.abs(e.clientX - pressPositionRef.current.x);
    const movedY = Math.abs(e.clientY - pressPositionRef.current.y);

    // 지도 이동 제스처를 길게 누르기로 오인하지 않도록 손가락이 움직이면 취소함
    if (movedX > 12 || movedY > 12) {
      handlePressCancel(e);
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
        className={`selected-marker${isTemporary ? " temporary-marker" : ""}`}
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
        onPointerDown={handlePressStart}
        // 마우스 손 떼기
        // 0.5초 전에 떼면 일반 클릭 처리
        // 0.5초 이상 눌렀다면 일반 클릭은 막고 로드뷰만 유지
        onPointerUp={handlePressEnd}
        onPointerMove={handlePressMove}
        onPointerCancel={handlePressCancel}
        onLostPointerCapture={(e) => {
          if (activePointerIdRef.current === e.pointerId) {
            handlePressCancel(e);
          }
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/*
          실제 마커 핀 모양을 담당하는 span

          button 자체는 클릭 영역 역할을 하고,
          selected-marker-pin이 실제 눈에 보이는 파란 핀 역할을 함
        */}
        <MarkerIcon markerStyle={safeMarkerStyle} size={38} />
      </button>
    </CustomOverlayMap>
  );
}

export default SelectedMarker;

// 선택한 지도 좌표를 기준으로 카카오 로드뷰 창을 띄우는 컴포넌트임
// RoadPost에서 전달받은 DB 게시글 목록(posts)을 로드뷰 안에 커스텀 오버레이 마커로 표시함

import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Draggable from "react-draggable";
import PostOverlayCard from "./PostOverlayCard";
import "./roadviewpost.css";

// isOpen: 로드뷰 창을 보여줄지 결정하는 값임
// position: 로드뷰를 띄울 기준 좌표임
// posts: RoadPost에서 받아온 DB 게시글 목록임
// onClose: 닫기 버튼을 눌렀을 때 실행할 함수임
// onOpenPostDetail: 로드뷰 카드에서 게시글 상세 창을 열 때 실행할 함수임
// posts = []: 부모에서 posts가 아직 넘어오지 않아도 에러가 나지 않게 하기 위한 기본값임
function RoadViewPost({
  isOpen,
  position,
  posts = [],
  onClose,
  onOpenPostDetail,
}) {
  // 로드뷰가 실제로 들어갈 div를 기억하는 ref임
  // 카카오 Roadview 생성자에 이 div를 넘겨야 로드뷰 화면이 렌더링됨
  const roadviewContainerRef = useRef(null);
  const roadviewLayerRef = useRef(null);

  // 생성된 카카오 로드뷰 객체를 저장하는 ref임
  // 버튼 클릭, 마커 재표시, 고도 변경 같은 기능에서 같은 roadview 객체를 다시 사용해야 함
  const roadviewRef = useRef(null);

  // 로드뷰 안에 표시한 DB 게시글 커스텀 오버레이들을 저장하는 ref임
  // posts가 바뀌거나 로드뷰가 닫힐 때 기존 오버레이를 화면에서 제거하기 위해 필요함
  const roadviewPostMarkersRef = useRef([]);

  // 로드뷰를 불러오지 못했을 때 화면에 보여줄 안내 문구 상태임
  const [roadViewMessage, setRoadViewMessage] = useState("");

  // 로드뷰 안 게시글 마커의 기본 고도값임
  // 슬라이더를 움직이면 현재 로드뷰 안에 떠 있는 오버레이들의 고도가 같이 변경됨
  const [markerAltitude, setMarkerAltitude] = useState(3);
  const [layerSize, setLayerSize] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const resizeStateRef = useRef(null);

  // 로드뷰 위에 이미 그려진 DB 게시글 오버레이 제거함
  // setMap(null)은 화면에서만 오버레이를 제거하는 기능임
  // DB 게시글 자체를 삭제하는 기능 아님
  const clearRoadviewPostMarkers = () => {
    roadviewPostMarkersRef.current.forEach((item) => {
      if (item.overlay) {
        item.overlay.setMap(null);
      }
    });

    roadviewPostMarkersRef.current = [];
  };

  // RoadPost에서 받은 DB 게시글 목록을 로드뷰 안의 커스텀 마커로 변환함
  const renderPostMarkersOnRoadview = (roadview, postList) => {
    // 로드뷰 객체가 없으면 마커를 붙일 대상이 없으므로 종료함
    if (!roadview) return;

    // 카카오 지도 SDK가 아직 준비되지 않았으면 CustomOverlay를 만들 수 없으므로 종료함
    if (!window.kakao || !window.kakao.maps) return;

    // 같은 게시글 마커가 중복으로 쌓이지 않도록 기존 오버레이를 먼저 제거함
    clearRoadviewPostMarkers();

    // DB 게시글 배열을 하나씩 검사해서 로드뷰 마커로 생성함
    postList.forEach((post) => {
      // roadviewVisible이 false인 게시글은 로드뷰에 표시하지 않음
      // 값이 없으면 기본적으로 로드뷰에 표시하는 것으로 처리함
      if (post.roadviewVisible === false) return;

      // 백엔드 응답이 latitude / longitude 형식일 수도 있고,
      // 기존 프론트 데이터처럼 lat / lng 형식일 수도 있어서 둘 다 대응함
      let lat = Number(post.latitude ?? post.lat);
      let lng = Number(post.longitude ?? post.lng);

      // data.sql 좌표 순서 문제를 프론트에서 임시 보정함
      // 기존 더미 데이터가 POINT(위도 경도)로 저장된 경우 latitude가 127처럼 내려올 수 있음
      // 위도는 -90 ~ 90 범위여야 하므로 lat이 범위를 벗어나고 lng이 위도 범위라면 서로 바꿈
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        (lat < -90 || lat > 90) &&
        lng >= -90 &&
        lng <= 90
      ) {
        const tempLat = lat;
        lat = lng;
        lng = tempLat;
      }

      // 좌표가 숫자가 아니면 카카오 LatLng를 만들 수 없으므로 해당 게시글은 건너뜀
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      // 위도/경도 범위를 벗어나면 카카오 지도에 정상 표시할 수 없으므로 건너뜀
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

      // 게시글 좌표를 카카오 지도 API가 사용하는 LatLng 객체로 변환함
      // 주의: new window.kakao.maps.LatLng(위도, 경도) 순서로 넣어야 함
      const postPosition = new window.kakao.maps.LatLng(lat, lng);

      // 카카오 원본 CustomOverlay에 넣을 DOM 요소를 직접 생성함
      // react-kakao-maps-sdk의 CustomOverlayMap이 아니라 카카오 원본 API를 쓰는 구간임
      const markerContent = document.createElement("div");
      markerContent.className = "roadview-custom-post-marker";

      // React 게시글 카드 컴포넌트를 정적 HTML 문자열로 변환함
      // 카카오 원본 CustomOverlay는 React 컴포넌트를 바로 받을 수 없어서 HTML 문자열로 변환해야 함
      // PostOverlayCard를 사용하므로 RoadPost 지도 카드와 RoadViewPost 로드뷰 카드 구조를 같이 관리할 수 있음
      const cardHtml = renderToStaticMarkup(
        <PostOverlayCard
          post={{
            ...post,
            lat,
            lng,
            latitude: lat,
            longitude: lng,
          }}
          buttonText="게시글 상세 보기"
          className="roadview-post-overlay-card"
        />,
      );

      // 로드뷰 마커 버튼과 게시글 카드를 하나의 오버레이 내용으로 구성함
      markerContent.innerHTML = `
        <button type="button" class="roadview-post-pin" aria-label="로드뷰 게시글 마커">
          <span class="roadview-post-pin-dot"></span>
        </button>

        ${cardHtml}
      `;

      // 방금 만든 DOM 안에서 실제로 조작할 요소들을 찾음
      // pinButton은 로드뷰에 보이는 작은 마커 버튼임
      const pinButton = markerContent.querySelector(".roadview-post-pin");

      // postCard는 마커를 눌렀을 때 열고 닫을 게시글 카드 영역임
      const postCard = markerContent.querySelector(
        ".roadview-post-overlay-card",
      );

      // detailButton은 게시글 카드 안에 있는 게시글 상세 보기 버튼임
      // renderToStaticMarkup으로 만든 버튼이라 React onClick이 자동으로 붙지 않음
      const detailButton = markerContent.querySelector(
        ".post-overlay-card button",
      );

      // 필수 요소가 없으면 클릭 이벤트를 붙일 수 없으므로 해당 게시글 마커 생성 중단함
      if (!pinButton || !postCard) return;

      // 처음에는 마커만 보이고 게시글 카드는 숨겨진 상태로 시작함
      postCard.style.display = "none";

      // 마커 클릭 시 카드 열림/닫힘 상태를 기억하는 값임
      let isCardOpen = false;

      // 로드뷰 마커를 클릭하면 게시글 카드를 열거나 닫음
      pinButton.addEventListener("click", (e) => {
        e.stopPropagation();

        isCardOpen = !isCardOpen;
        postCard.style.display = isCardOpen ? "block" : "none";
      });

      // 정적 HTML로 만든 상세 보기 버튼에 직접 클릭 이벤트를 연결함
      // 이 버튼을 누르면 RoadPost에서 내려준 onOpenPostDetail 함수로 상세 창을 열어달라고 요청함
      if (detailButton) {
        detailButton.addEventListener("click", (e) => {
          e.stopPropagation();

          if (onOpenPostDetail) {
            onOpenPostDetail({
              ...post,
              lat,
              lng,
              latitude: lat,
              longitude: lng,
            });
          }
        });
      }

      // 카카오 원본 CustomOverlay 객체 생성함
      // position은 DB 게시글 좌표이고, content는 위에서 만든 DOM 요소임
      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: postPosition,
        content: markerContent,
        xAnchor: 0.5,
        yAnchor: 1,
      });

      // 게시글별 altitude가 있으면 그 값을 우선 사용하고, 없으면 슬라이더 값을 사용함
      const postAltitude = Number(post.altitude ?? markerAltitude);
      const nextAltitude = Number.isFinite(postAltitude)
        ? postAltitude
        : markerAltitude;

      // 로드뷰 안에서 마커가 떠 있는 높이를 설정함
      if (typeof customOverlay.setAltitude === "function") {
        customOverlay.setAltitude(nextAltitude);
      }

      // 로드뷰 안에서 오버레이가 보이는 거리 범위를 설정함
      if (typeof customOverlay.setRange === "function") {
        customOverlay.setRange(100);
      }

      // 완성된 커스텀 오버레이를 로드뷰 화면에 표시함
      customOverlay.setMap(roadview);

      // 나중에 마커 제거나 고도 변경을 할 수 있도록 ref 배열에 저장함
      roadviewPostMarkersRef.current.push({
        id: post.postId ?? post.id,
        overlay: customOverlay,
      });
    });
  };

  // 로드뷰 창이 열리거나 기준 위치/posts가 바뀔 때 로드뷰를 새로 생성함
  useEffect(() => {
    // 로드뷰 창이 닫혀 있으면 아무 작업도 하지 않음
    if (!isOpen) return;

    // 기준 좌표가 없으면 로드뷰를 찾을 수 없으므로 종료함
    if (!position) return;

    // 로드뷰를 넣을 div가 아직 만들어지지 않았으면 종료함
    if (!roadviewContainerRef.current) return;

    // 카카오 SDK가 아직 준비되지 않았으면 종료함
    if (!window.kakao || !window.kakao.maps) return;

    // 로드뷰를 다시 만들기 전에 기존 게시글 오버레이를 정리함
    clearRoadviewPostMarkers();

    // RoadPost에서 받은 좌표를 카카오 LatLng 객체로 변환함
    const roadViewPosition = new window.kakao.maps.LatLng(
      position.lat,
      position.lng,
    );

    // 실제 카카오 로드뷰 객체를 생성함
    const roadview = new window.kakao.maps.Roadview(
      roadviewContainerRef.current,
    );

    // 다른 버튼 함수에서도 같은 로드뷰 객체를 쓸 수 있도록 ref에 저장함
    roadviewRef.current = roadview;

    // 선택 좌표 근처의 로드뷰 panoId를 찾기 위한 클라이언트 생성함
    const roadviewClient = new window.kakao.maps.RoadviewClient();

    // 선택 좌표 기준 100m 안에서 가장 가까운 로드뷰를 찾음
    roadviewClient.getNearestPanoId(roadViewPosition, 100, (panoId) => {
      if (panoId) {
        // 로드뷰가 있으면 해당 panoId로 로드뷰 화면을 설정함
        roadview.setPanoId(panoId, roadViewPosition);

        // 로드뷰가 열린 뒤 DB 게시글 목록을 로드뷰 마커로 표시함
        renderPostMarkersOnRoadview(roadview, posts);
      } else {
        // 주변에 로드뷰가 없으면 안내 메시지를 보여줌
        setRoadViewMessage("이 위치 주변에는 로드뷰가 없습니다.");
      }
    });

    // 컴포넌트가 사라지거나 로드뷰 기준값이 바뀔 때 오버레이 정리함
    return () => {
      clearRoadviewPostMarkers();
    };
  }, [isOpen, position, posts]);

  // 창 크기가 바뀔 때 카카오 로드뷰도 새 컨테이너 크기로 다시 계산함
  useEffect(() => {
    if (!isOpen || !roadviewContainerRef.current) return;
    if (typeof ResizeObserver === "undefined") return;

    let animationFrameId = null;
    const resizeObserver = new ResizeObserver(() => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        roadviewRef.current?.relayout?.();
      });
    });

    resizeObserver.observe(roadviewContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isOpen]);

  // 현재 로드뷰에 DB 게시글 마커를 다시 표시하는 버튼 함수임
  // 임시 채팅이나 임시 게시글을 만드는 기능 아님
  const handleShowRoadviewPostMarkers = () => {
    if (!roadviewRef.current) return;

    renderPostMarkersOnRoadview(roadviewRef.current, posts);
  };

  // 로드뷰 화면에서 게시글 마커만 제거하는 버튼 함수임
  // DB 데이터 삭제 아님
  const handleRemoveRoadviewMarkers = () => {
    clearRoadviewPostMarkers();
  };

  // 고도 슬라이더 값을 변경하고 현재 로드뷰 오버레이들의 고도를 같이 변경함
  const handleAltitudeChange = (e) => {
    const nextAltitude = Number(e.target.value);

    setMarkerAltitude(nextAltitude);

    roadviewPostMarkersRef.current.forEach((item) => {
      if (item.overlay && typeof item.overlay.setAltitude === "function") {
        item.overlay.setAltitude(nextAltitude);
      }
    });
  };

  // 로드뷰 창을 닫고 화면에 떠 있는 오버레이를 정리함
  const handleCloseRoadview = () => {
    clearRoadviewPostMarkers();
    onClose();
  };

  const handleResizeStart = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();

    const layer = roadviewLayerRef.current;
    const parent = layer?.parentElement;
    if (!layer || !parent) return;

    const rect = layer.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    resizeStateRef.current = {
      pointerId: e.pointerId,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      startPosition: dragPosition,
      maxWidthFromLeft: rect.right - parentRect.left,
      maxWidthFromRight: parentRect.right - rect.left,
      maxHeightFromTop: rect.bottom - parentRect.top,
      maxHeightFromBottom: parentRect.bottom - rect.top,
      minWidth: Math.min(320, parentRect.width - 16),
      minHeight: Math.min(320, parentRect.height - 16),
    };

    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handleResizeMove = (e) => {
    const state = resizeStateRef.current;
    if (!state || state.pointerId !== e.pointerId) return;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const deltaX = e.clientX - state.startX;
    const deltaY = e.clientY - state.startY;
    let width = state.startWidth;
    let height = state.startHeight;
    let x = state.startPosition.x;
    let y = state.startPosition.y;

    if (state.direction.includes("e")) {
      width = clamp(
        state.startWidth + deltaX,
        state.minWidth,
        state.maxWidthFromRight,
      );
    }

    if (state.direction.includes("w")) {
      width = clamp(
        state.startWidth - deltaX,
        state.minWidth,
        state.maxWidthFromLeft,
      );
      x = state.startPosition.x + state.startWidth - width;
    }

    if (state.direction.includes("s")) {
      height = clamp(
        state.startHeight + deltaY,
        state.minHeight,
        state.maxHeightFromBottom,
      );
    }

    if (state.direction.includes("n")) {
      height = clamp(
        state.startHeight - deltaY,
        state.minHeight,
        state.maxHeightFromTop,
      );
      y = state.startPosition.y + state.startHeight - height;
    }

    setLayerSize({ width, height });
    setDragPosition({ x, y });
  };

  const handleResizeEnd = (e) => {
    if (resizeStateRef.current?.pointerId !== e.pointerId) return;

    e.currentTarget.releasePointerCapture?.(e.pointerId);
    resizeStateRef.current = null;
  };

  // 로드뷰 창이 닫힌 상태면 화면에 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  // 로드뷰 창 전체 UI 렌더링함
  return (
    <Draggable
      nodeRef={roadviewLayerRef}
      bounds="parent"
      handle=".roadview-post-header"
      cancel="button, input"
      position={dragPosition}
      onDrag={(_, data) => setDragPosition({ x: data.x, y: data.y })}
    >
      <div
        ref={roadviewLayerRef}
        className="roadview-post-layer"
        style={layerSize || undefined}
      >
        {/* 로드뷰 창 상단 제목과 닫기 버튼 영역임 */}
        <div className="roadview-post-header">
          <strong>RoadView</strong>

          <button type="button" onClick={handleCloseRoadview}>
            ×
          </button>
        </div>

      {/* 로드뷰 안 게시글 마커를 다시 표시하거나 제거하는 조작 버튼 영역임 */}
        <div className="roadview-post-tools">
          <button type="button" onClick={handleShowRoadviewPostMarkers}>
            현재 지도 위치에 마커 찍기
          </button>

          <button type="button" onClick={handleRemoveRoadviewMarkers}>
            마커 제거
          </button>
        </div>

      {/* 로드뷰 게시글 마커의 고도를 조절하는 슬라이더 영역임 */}
        <div className="roadview-altitude-control">
          <div className="roadview-altitude-title">
            <span>마커 고도</span>
            <strong>{markerAltitude}</strong>
          </div>

          <input
            type="range"
            className="roadview-altitude-slider"
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

      {/* 실제 카카오 로드뷰 화면과 안내 메시지를 표시하는 본문 영역임 */}
        <div className="roadview-post-body">
          <div ref={roadviewContainerRef} className="roadview-post-view" />

          {roadViewMessage && (
            <div className="roadview-post-message">{roadViewMessage}</div>
          )}
        </div>

        {["n", "s", "e", "w", "ne", "nw", "se", "sw"].map(
          (direction) => (
            <div
              key={direction}
              className={`roadview-resize-handle resize-${direction}`}
              onPointerDown={(e) => handleResizeStart(e, direction)}
              onPointerMove={handleResizeMove}
              onPointerUp={handleResizeEnd}
              onPointerCancel={handleResizeEnd}
              aria-hidden="true"
            />
          ),
        )}
      </div>
    </Draggable>
  );
}

export default RoadViewPost;

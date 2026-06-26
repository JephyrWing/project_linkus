// 마커, 현재 위치 버튼, 좌표 박스, 등록 버튼, 게시글 카드 전부 보임
// 지도 확대 축소 가능 영역

// CustomOverlayMap = 지도 위에 단순 마커가 아니라,
// 제목, 내용, 버튼이 들어간 박스를 띄우기 위해 사용
import { Map, CustomOverlayMap } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../utils/Kakao/UseKakaoLoader";
import React, { useEffect, useRef, useState } from "react";
import RoadViewPost from "./RoadViewPost";
import SelectedMarker from "./SelectedMarker";
import { MARKER_STYLES } from "./markerStyles";
import getCommonApi from "../../utils/Axios/getCommonApi";
import PostOverlayCard from "./PostOverlayCard";

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
  const defaultPosts = [];

  // 지도 중심 위치 와 현재 지도 중심 위치
  const [mapCenter, setMapCenter] = useState(defaultPosition);

  // 사용자가 선택한 마커 위치
  // 현재 화면에 보이는 커스텀 마커의 위치로 사용됨
  const [markerPosition, setMarkerPosition] = useState(defaultPosition);

  // 내 현재 위치 저장
  // 다만, 현재 코드에서는 myPosition을 화면에 직접 쓰지는 않고 있고,
  // 추후 아래와 같이 사용 예정
  // - 내 위치 마커 따로 표시
  // - 내 위치 기준 주변 게시글 조회
  // - 내 위치로 돌아가기 기능 개선
  const [myPosition, setMyPosition] = useState(null);

  // 선택된 게시글 마커
  // 사용자가 게시글 마커를 클릭했을 때, 어떤 게시글을 클릭했는지 저장하는 상태
  // 처음에는 아무 게시글도 선택하지 않았으니까 null
  // selectedPost가 있을 때만 게시글 카드가 뜸
  const [selectedPost, setSelectedPost] = useState(null);

  // 선택 위치 마커에 마우스를 올렸을 때 보여줄 안내 말풍선 정보
  // hoveredMarker가 null이면 말풍선이 보이지 않고,
  // 값이 들어가면 파란 마커 위치에 말풍선이 표시됨
  const [hoveredMarker, setHoveredMarker] = useState(null);

  // 파란 선택 위치 마커를 클릭했을 때 게시글 작성창을 열지 여부
  // true이면 작성창이 보이고, false이면 작성창이 보이지 않음
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);

  // 사용자가 선택한 마커 스타일
  // 지금은 기본 마커를 사용
  // 나중에는 MyPage에서 사용자가 고른 마커 스타일을 불러와서 적용하면 됨
  const [selectedMarkerStyle, setSelectedMarkerStyle] = useState(
    MARKER_STYLES.red,
  );

  // 로드뷰 창을 열지 여부
  // true이면 로드뷰 창이 보이고, false이면 보이지 않음
  const [isRoadViewOpen, setIsRoadViewOpen] = useState(false);

  // 게시글이 로드뷰 안에서 보일 고도값
  // 사용자가 슬라이더로 조절할 수 있음
  const [postAltitude, setPostAltitude] = useState(3);

  // 게시글 작성창 textarea에 입력 중인 내용
  // 사용자가 글자를 입력할 때마다 이 state에 저장됨
  const [postText, setPostText] = useState("");

  // 게시글 작성창에서 좋아요 버튼을 눌렀는지 저장하는 상태
  // true이면 좋아요를 누른 상태, false이면 좋아요를 누르지 않은 상태
  const [isPostLiked, setIsPostLiked] = useState(false);

  // 현재 지도 영역 좌표 저장
  // 이 값은 getBounds()로 얻은 남서쪽 / 북동쪽 좌표를 담음
  const [mapBounds, setMapBounds] = useState(null);

  // 서버에서 받아온 게시글 마커 데이터
  // defaultPosts: 초기값
  const [posts, setPosts] = useState(defaultPosts);

  // 게시글 상세 창에 보여줄 게시글 정보를 저장함
  // 게시글 상세 보기 버튼을 눌렀을 때 이 값으로 큰 창을 띄움
  const [detailPost, setDetailPost] = useState(null);

  // 게시글 상세 창을 화면에 띄울지 저장함
  // true이면 상세 창 보임, false이면 상세 창 숨김
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);

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
    // map.getBounds(): 현재 지도 화면의 영역 가져옴
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

    // getBoundsParams를 통해 남서쪽/북동쪽 좌표를 가져옴
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

    // 이번 좌표를 마지막 요청 좌표로 저장
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
        /*
          기존 axios.get("http://localhost:8080/api/posts/bounds") 대신
          getCommonApi()를 사용함.

          이유:
          getCommonApi()는 보통 baseURL과 인증 토큰 설정을 포함하고 있어서
          403 권한 오류를 줄이는 데 유리함.

          만약 getCommonApi의 baseURL이 http://localhost:8080 이라면
          "/api/posts/bounds"로 바꿔야 할 수도 있음.
        */
        const response = await getCommonApi().post("/posts", {
          swLatitude: boundsParams.swLat,
          swLongitude: boundsParams.swLng,
          neLatitude: boundsParams.neLat,
          neLongitude: boundsParams.neLng,
        });

        // 1. 서버가 바로 배열 주면 그대로 사용
        // 2. 서버가 객체 안에 posts로 주면 response.data.posts를 사용
        // 3. Spring Page 형태로 content에 주면 response.data.content를 사용

        console.log("서버 응답 데이터:", response.data);
        const nextPosts = Array.isArray(response.data) ? response.data : [];
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

  const requestAllPosts = async () => {
    try {
      // 모든 사용자가 작성한 게시글을 한 번에 가져오는 요청
      // getCommonApi()를 사용하면 baseURL과 인증 토큰 설정을 그대로 사용할 수 있음
      const response = await getCommonApi().get("/posts");

      // 백엔드 응답이 배열이면 그대로 사용하고,
      // Spring Page 형태라면 content를 사용하도록 방어적으로 처리
      const nextPosts = Array.isArray(response.data)
        ? response.data
        : response.data.content || response.data.posts || [];

      setPosts(nextPosts);
    } catch (error) {
      console.error("전체 게시글 조회 실패", error);
    }
  };

  // 화면 처음 열릴 때 현재 위치 가져오기
  // 이 코드는 컴포넌트가 처음 화면에 나타났을 때 한 번 실행
  useEffect(() => {
    // 페이지 열리자마자 현재 위치를 가져와서 지도 중심과 마커를 이동
    moveToCurrentLocation();

    // RoadPost에 들어오면 모든 사용자의 게시글을 가져옴
    // 이 posts는 지도 위 카드와 RoadViewPost 로드뷰 마커가 같이 사용함
    requestAllPosts();

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

  // 파란 마커 위치에 새 게시글을 등록하는 함수
  // 백엔드 연결 시 getCommonApi().post로 서버에 저장
  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!postText.trim()) {
      alert("게시글 내용을 입력해 주세요.");
      return;
    }

    const loginId = localStorage.getItem("userId");

    // 1. 백엔드로 보낼 게시글 데이터
    const formData = new FormData();
    formData.append("text", postText);
    formData.append("latitude", markerPosition.lat);
    formData.append("longitude", markerPosition.lng);
    formData.append("altitude", postAltitude);
    formData.append("markerCustom", "default");
    formData.append("boxCustom", "default");
    formData.append("userId", loginId);

    // FormData 전체 확인
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      // 2. newPost를 백엔드 저장 API로 전송
      const response = await getCommonApi().post("/posts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const savedPost = response.data;
      setPosts((prevPosts) => [...prevPosts, savedPost]);

      // 상태 초기화
      setPostText("");
      setIsPostLiked(false);
      setPostAltitude(3);
      setIsPostFormOpen(false);
      setSelectedPost(savedPost);
    } catch (error) {
      console.error("게시글 저장 실패:", error);
      alert("게시글 저장에 실패했습니다.");
    }
  };

  // 게시글 상세 보기 버튼을 눌렀을 때 큰 게시물 창을 여는 함수임
  // 작은 게시글 카드에서 선택한 게시글을 상세 창 데이터로 넘김
  const handleOpenPostDetail = (post) => {
    setDetailPost(post);
    setIsPostDetailOpen(true);
  };

  // 게시글 상세 창을 닫고 상세 게시글 정보를 비움
  // 닫은 뒤 이전 게시글 정보가 남아 다시 열리는 일을 막음
  const handleClosePostDetail = () => {
    setIsPostDetailOpen(false);
    setDetailPost(null);
  };

  // 게시글 상세 창을 최소화함
  // 선택된 작은 게시글 카드는 유지하고 큰 창만 숨김
  const handleMinimizePostDetail = () => {
    setIsPostDetailOpen(false);
  };

  // 게시글 상세 창에서 수정한 내용을 백엔드에 저장함
  // 저장 성공 후 최신 게시글을 다시 조회해서 지도 카드, 로드뷰 카드, 상세 창 데이터가 전부 같은 값이 되게 함
  const handleUpdatePost = async (updatedPost) => {
    const postId = updatedPost.postId ?? updatedPost.id;
    const loginId = localStorage.getItem("userId");

    // postId가 없으면 백엔드가 어떤 게시글을 수정할지 알 수 없으므로 저장을 중단함
    if (!postId) {
      alert("수정할 게시글 ID가 없습니다.");
      return null;
    }

    try {
      await getCommonApi().put("/posts", {
        postId: Number(postId),
        text: updatedPost.text,
        userId: loginId,
        markerCustom: updatedPost.markerCustom ?? "default",
        boxCustom: updatedPost.boxCustom ?? "default",
      });

      // 수정 성공 후 DB에 저장된 최신 게시글을 다시 조회함
      const response = await getCommonApi().get(`/posts/${postId}`);
      const savedPost = response.data;

      // posts 배열에서 수정된 게시글 하나만 최신 데이터로 교체함
      // 지도 마커와 로드뷰 마커는 이 posts를 기준으로 다시 그림
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          (post.postId ?? post.id) === postId ? savedPost : post,
        ),
      );

      // 지도 위 작은 카드가 열려 있으면 그 카드도 최신 데이터로 교체함
      setSelectedPost((prevPost) =>
        prevPost && (prevPost.postId ?? prevPost.id) === postId
          ? savedPost
          : prevPost,
      );

      // 상세 창 내부 데이터도 최신 데이터로 교체함
      setDetailPost(savedPost);

      return savedPost;
    } catch (error) {
      console.error("게시글 수정 실패:", error);
      alert("게시글 수정에 실패했습니다.");
      return null;
    }
  };

  // 하트 버튼을 눌렀을 때 좋아요 또는 좋아요 취소를 백엔드에 반영하는 함수임
  // 백엔드 좋아요 API가 void라서 처리 후 단건 조회로 최신 likeNum과 likeChecked를 다시 가져옴
  const handleTogglePostLike = async (targetPost) => {
    const postId = targetPost.postId ?? targetPost.id;
    const loginId = localStorage.getItem("userId");
    const likeChecked = targetPost.likeChecked ?? targetPost.isLiked ?? false;

    if (likeChecked) {
      await getCommonApi().delete("/posts/postlikes", {
        data: { postId, userId: loginId },
      });
    } else {
      await getCommonApi().post("/posts/postlikes", {
        postId,
        userId: loginId,
      });
    }

    const response = await getCommonApi().get(`/posts/${postId}`);
    const savedPost = response.data;

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        (post.postId ?? post.id) === postId ? savedPost : post,
      ),
    );

    setSelectedPost((prevPost) =>
      prevPost && (prevPost.postId ?? prevPost.id) === postId
        ? savedPost
        : prevPost,
    );

    setDetailPost(savedPost);

    return savedPost;
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

            // 전체 게시글을 보여줄 것이므로 bounds API로 posts를 다시 덮어쓰지 않음
            setMapBounds(getBoundsParams(map));
          }
        }}
        onBoundsChanged={(map) => {
          // 지도 영역 좌표 패널 표시용으로만 사용
          // 전체 게시글 표시는 requestAllPosts에서 받아온 posts를 유지함
          setMapBounds(getBoundsParams(map));
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

          // 지도 빈 곳 클릭 시 선택 위치 마커 안내 말풍선 닫기
          setHoveredMarker(null);

          // 지도 빈 곳 클릭 시 게시글 작성창 닫기
          setIsPostFormOpen(false);

          // 지도 빈 곳 클릭 시 로드뷰 창 닫기
          setIsRoadViewOpen(false);
        }}
      >
        {/* 사용자가 선택한 위치 마커 */}
        <SelectedMarker
          position={markerPosition}
          markerStyle={selectedMarkerStyle}
          // 파란 마커에 마우스를 올리면 안내 말풍선 정보를 저장
          onMouseOver={() => {
            setHoveredMarker({
              title: "Click the marker",
              text: "마커 클릭 시, 맵 게시물 작성 가능",
              lat: markerPosition.lat,
              lng: markerPosition.lng,
            });
          }}
          // 사용자가 파란 마커와 상호작용할 때 화면 상태를 정리해주는 코드
          // 파란 마커에서 마우스가 벗어나면 안내 말풍선을 숨김
          onMouseOut={() => {
            // setHoveredMarker(null) -> 핵심코드
            // hoveredMarker = 안내 말풍선을 보여줄지 말지 결정하는 state
            // null 이면 말풍선 안 보여줌, 값 있으면 말풍선 보여줌
            setHoveredMarker(null);
          }}
          // 짧게 클릭하면 게시글 작성창을 엶
          onClick={() => {
            // 게시글 작성창을 열기 위한 코드
            // isPostFormOpen = 게시글 작성창이 열려 있는지 닫혀 있는지를 저장하는 state
            setIsPostFormOpen(true);

            // 기존에 열려 있던 게시글 상세 카드를 닫는 역할
            // selectedPost = 게시글 마커를 클릭했을 때 선택된 게시글 정보를 저장하는 state
            setSelectedPost(null);

            // 마커 hover 안내 말풍선을 닫는 역할
            setHoveredMarker(null);

            // 게시글 작성창을 열 때 로드뷰는 닫음
            setIsRoadViewOpen(false);
          }}
          // 3초 이상 누르고 있으면 로드뷰 창 엶
          onLongPress={() => {
            setIsRoadViewOpen(true);
            setIsPostFormOpen(false);
            setSelectedPost(null);
            setHoveredMarker(null);
          }}
        />

        {/* 선택 위치 마커에 커서를 올렸을 때 뜨는 안내 말풍선 */}
        {hoveredMarker && (
          <CustomOverlayMap
            position={{
              lat: hoveredMarker.lat,
              lng: hoveredMarker.lng,
            }}
            yAnchor={1.7}
            clickable={true}
          >
            <div className="post-hover-tooltip">
              <strong>{hoveredMarker.title}</strong>
              <p>{hoveredMarker.text}</p>
            </div>
          </CustomOverlayMap>
        )}

        {/* 파란 선택 위치 마커 클릭 시 뜨는 게시글 작성창 */}
        {isPostFormOpen && (
          <CustomOverlayMap
            position={{
              lat: markerPosition.lat,
              lng: markerPosition.lng,
            }}
            yAnchor={1.3}
            clickable={true}
          >
            <form
              className="post-write-card"
              onSubmit={handleCreatePost}
              // 작성창 내부 클릭이 지도 클릭으로 처리되는 것을 막기 위한 코드
              // 이게 없으면 작성창을 클릭했을 때 Map의 onClick이 실행되어 작성창이 닫힐 수 있음
              onClick={(e) => e.stopPropagation()}
            >
              <strong>Post</strong>

              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="이 위치에 남길 게시글을 작성해 보세요."
              />

              {/* 로드뷰 마커 고도 조절 슬라이더 */}
              <div className="post-altitude-control">
                <div className="post-altitude-title">
                  <span>로드뷰 마커 고도</span>
                  <strong>{postAltitude}</strong>
                </div>

                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={postAltitude}
                  onChange={(e) => setPostAltitude(Number(e.target.value))}
                />

                <div className="post-altitude-labels">
                  <span>낮게</span>
                  <span>높게</span>
                </div>
              </div>

              {/* 게시글 작성 시 좋아요를 누를 수 있는 버튼 */}
              {/* type="button"으로 해야 form submit이 실행되지 않음 */}
              <button
                type="button"
                className={`post-like-button ${isPostLiked ? "liked" : ""}`}
                onClick={() => setIsPostLiked((prev) => !prev)}
              >
                ❤︎
              </button>

              <div className="post-write-buttons">
                <button
                  type="button"
                  onClick={() => {
                    setIsPostFormOpen(false);
                    setPostText("");
                    setIsPostLiked(false);
                    setPostAltitude(3);
                  }}
                >
                  취소
                </button>

                <button type="submit">등록</button>
              </div>
            </form>
          </CustomOverlayMap>
        )}

        {/* 서버에서 받아온 게시글 마커 */}
        {/* 기본 MapMarker 대신 커스텀 게시글 마커를 사용 */}
        {posts.map((post) => {
          let lat = Number(post.latitude ?? post.lat);
          let lng = Number(post.longitude ?? post.lng);

          // data.sql의 기존 더미 데이터는 POINT(위도 경도)로 저장되어 있어서
          // 백엔드 DTO 변환 후 latitude가 127처럼 잘못 내려올 수 있음.
          // 위도는 -90 ~ 90 범위여야 하므로, lat이 범위를 벗어나고 lng이 위도 범위라면
          // 프론트에서만 임시로 위도/경도를 서로 바꿔 지도 표시가 가능하게 함.
          if (
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            (lat < -90 || lat > 90) &&
            lng >= -90 &&
            lng <= 90
          ) {
            // 위도 경도 값 교환
            const tempLat = lat;
            lat = lng;
            lng = tempLat;
          }
          // 좌표가 숫자가 아니면 지도에 찍을 수 없으므로 해당 게시글은 표시하지 않음
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          // 좌표 범위 재검사
          // 위도 lat: -90 ~ 90
          // 경도 lng: -180 ~ 180]
          // 이 범위를 벗어나면 카카오 지도에 정상 표시할 수 없으므로 return null로 렌더링하지 않음
          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

          // 게시글 마커 위치
          // SelectedMarker는 내부에서 CustomOverlayMap을 이미 사용하므로
          // 여기서 CustomOverlayMap으로 한 번 더 감싸면 안 됨
          const postMarkerPosition = {
            lat,
            lng,
          };

          // 게시글마다 markerCustom이 있으면 나중에 스타일을 확장할 수 있도록 열어둠
          // 현재 markerStyles.js에 없는 값이면 기본 LinkUs 브라운 마커를 사용
          const postMarkerStyle =
            MARKER_STYLES[post.markerCustom] || MARKER_STYLES.brown;
          return (
            <SelectedMarker
              key={post.postId ?? post.id}
              position={postMarkerPosition}
              markerStyle={postMarkerStyle}
              onClick={() => {
                // selectedPost 카드도 같은 좌표 보정값을 써야 하므로
                // 원본 post에 화면 표시용 lat/lng를 덮어 씌운 객체를 저장함
                setSelectedPost({
                  ...post,
                  lat,
                  lng,
                  latitude: lat,
                  longitude: lng,
                });

                // 게시글 마커를 클릭하면 작성창은 닫음
                setIsPostFormOpen(false);

                // 선택 위치 마커 안내 말풍선이 같이 떠 있지 않도록 닫음
                setHoveredMarker(null);
              }}
              onLongPress={() => {
                // 게시글 마커를 0.5초 이상 누르면
                // 로드뷰 기준 위치를 해당 게시글 위치로 변경함.
                // RoadViewPost는 position={markerPosition}을 기준으로 열리기 때문에
                // 먼저 markerPosition을 게시글 좌표로 맞춰야 함.
                setMarkerPosition(postMarkerPosition);
                // 로드뷰를 열 때 게시글 작성창과 게시글 카드는 닫아서
                // 지도 위 UI가 서로 겹치지 않게 정리함.
                setIsPostFormOpen(false);
                setSelectedPost(null);
                setHoveredMarker(null);
                // 실제 로드뷰 창 열기
                setIsRoadViewOpen(true);
              }}
            />
          );
        })}

        {/* 게시글 마커 클릭 시 뜨는 카드 */}
        {selectedPost && (
          <CustomOverlayMap
            position={{
              lat: selectedPost.latitude ?? selectedPost.lat,
              lng: selectedPost.longitude ?? selectedPost.lng,
            }}
            yAnchor={1.4}
            clickable={true}
          >
            <PostOverlayCard
              post={selectedPost}
              buttonText="게시글 상세 보기"
              onCardClick={(e) => e.stopPropagation()}
              onButtonClick={(e) => {
                e.stopPropagation();
                handleOpenPostDetail(selectedPost);
              }}
            />
          </CustomOverlayMap>
        )}
      </Map>

      {/* 게시글 상세 보기 버튼 클릭 시 PostOverlayCard 상세 모드로 큰 게시물 창을 표시함 */}
      {isPostDetailOpen && detailPost && (
        <PostOverlayCard
          post={detailPost}
          variant="detail"
          onClose={handleClosePostDetail}
          onMinimize={handleMinimizePostDetail}
          onUpdate={(updatedPost) => {
            const updatedPostId = updatedPost.postId ?? updatedPost.id;

            setPosts((prevPosts) =>
              prevPosts.map((post) => {
                const currentPostId = post.postId ?? post.id;
                return currentPostId === updatedPostId ? updatedPost : post;
              }),
            );

            etSelectedPost((prevPost) => {
              const selectedPostId = prevPost?.postId ?? prevPost?.id;
              return selectedPostId === updatedPostId ? updatedPost : prevPost;
            });
            setDetailPost(updatedPost);
          }}
        />
      )}

      {/* 커스텀 마커를 3초 이상 눌렀을 때 뜨는 로드뷰 창 */}
      <RoadViewPost
        isOpen={isRoadViewOpen}
        position={markerPosition}
        // RoadViewPost.jsx에서 RoadPost의 게시글 목록을 받을 수 있음
        posts={posts}
        onClose={() => setIsRoadViewOpen(false)}
        onOpenPostDetail={handleOpenPostDetail}
      />

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

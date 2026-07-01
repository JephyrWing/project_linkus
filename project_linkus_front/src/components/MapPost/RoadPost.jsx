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
import { useLocation, useNavigate } from "react-router-dom";

import "./mappost.css";
import "./roadpost.css";

const MOBILE_IMAGE_TARGET_BYTES = 850 * 1024;
const MOBILE_IMAGE_MAX_LENGTH = 1600;

const canvasToBlob = (canvas, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("이미지 변환에 실패했습니다."));
      },
      "image/jpeg",
      quality,
    );
  });

// 스마트폰 원본 사진(고용량 JPEG/HEIC 등)을 브라우저에서 업로드용 JPEG로 축소함
const optimizePostImage = async (file) => {
  const isHeic =
    /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

  if (file.size <= MOBILE_IMAGE_TARGET_BYTES && !isHeic) return file;

  let imageSource;
  let objectUrl;

  try {
    if (typeof createImageBitmap === "function") {
      try {
        imageSource = await createImageBitmap(file);
      } catch {
        // 일부 모바일 브라우저는 HEIC를 img로는 열지만 createImageBitmap으로는 열지 못함
      }
    }

    if (!imageSource) {
      objectUrl = URL.createObjectURL(file);
      imageSource = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () =>
          reject(new Error("지원하지 않는 사진 형식입니다."));
        image.src = objectUrl;
      });
    }

    const originalWidth = imageSource.width || imageSource.naturalWidth;
    const originalHeight = imageSource.height || imageSource.naturalHeight;
    const scale = Math.min(
      1,
      MOBILE_IMAGE_MAX_LENGTH / Math.max(originalWidth, originalHeight),
    );

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(originalWidth * scale));
    canvas.height = Math.max(1, Math.round(originalHeight * scale));

    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("이미지 변환을 지원하지 않는 브라우저입니다.");
    context.drawImage(imageSource, 0, 0, canvas.width, canvas.height);

    let optimizedBlob;
    for (const quality of [0.85, 0.75, 0.65, 0.55]) {
      optimizedBlob = await canvasToBlob(canvas, quality);
      if (optimizedBlob.size <= MOBILE_IMAGE_TARGET_BYTES) break;
    }

    // 사진의 디테일이 많아 품질 조정만으로 부족하면 한 번 더 크기를 줄임
    if (optimizedBlob.size > MOBILE_IMAGE_TARGET_BYTES) {
      const smallerCanvas = document.createElement("canvas");
      const smallerScale = Math.min(
        1,
        1200 / Math.max(canvas.width, canvas.height),
      );
      smallerCanvas.width = Math.max(
        1,
        Math.round(canvas.width * smallerScale),
      );
      smallerCanvas.height = Math.max(
        1,
        Math.round(canvas.height * smallerScale),
      );
      const smallerContext = smallerCanvas.getContext("2d");
      if (!smallerContext)
        throw new Error("이미지 변환을 지원하지 않는 브라우저입니다.");
      smallerContext.drawImage(
        canvas,
        0,
        0,
        smallerCanvas.width,
        smallerCanvas.height,
      );
      for (const quality of [0.6, 0.5, 0.4]) {
        optimizedBlob = await canvasToBlob(smallerCanvas, quality);
        if (optimizedBlob.size <= MOBILE_IMAGE_TARGET_BYTES) break;
      }
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "post-image";
    return new File([optimizedBlob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    imageSource?.close?.();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
};

function RoadPost() {
  const location = useLocation();
  const navigate = useNavigate();
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

  // 로드뷰 카메라가 탐색할 기준 위치
  // 게시글 작성 좌표와 분리해서 기존 게시글을 조작해도 작성 위치가 바뀌지 않게 함
  const [roadViewPosition, setRoadViewPosition] = useState(defaultPosition);

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
    MARKER_STYLES.red || MARKER_STYLES.brown || MARKER_STYLES.blue,
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

  // 게시글 작성 시 업로드할 이미지 파일을 저장하는 state임
  // 사용자가 사진을 선택하면 이 값에 File 객체가 들어감
  const [postImageFile, setPostImageFile] = useState(null);

  // 게시글 작성창에서 선택한 사진을 화면에 미리 보여주기 위한 주소임
  // DB 저장용 값이 아니라 브라우저 미리보기용 임시 URL임
  const [postImagePreviewUrl, setPostImagePreviewUrl] = useState("");

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

  // 마이페이지에서 넘어온 게시글 좌표를 지도에서 사용할 수 있는 형태로 정리함
  // DB 좌표가 문자열로 올 수도 있어서 Number로 변환함
  const normalizeFocusPost = (post) => {
    if (!post) return null;

    let lat = Number(post.latitude ?? post.lat);
    let lng = Number(post.longitude ?? post.lng);

    // 위도/경도가 뒤집혀 온 데이터가 있으면 프론트에서 한 번 보정함
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

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return {
      ...post,
      latitude: lat,
      longitude: lng,
      lat,
      lng,
    };
  };

  // 특정 게시글 위치로 지도 중심을 이동시키고 해당 게시글 카드를 열어둠
  const focusPostOnMap = (post) => {
    const normalizedPost = normalizeFocusPost(post);

    if (!normalizedPost) {
      alert("게시글 위치 정보를 찾을 수 없습니다.");
      return;
    }

    const nextCenter = {
      lat: normalizedPost.latitude,
      lng: normalizedPost.longitude,
    };

    setMapCenter(nextCenter);
    setMarkerPosition(nextCenter);
    setSelectedPost(normalizedPost);

    // 작성창, hover 말풍선, 로드뷰가 같이 떠서 화면이 복잡해지지 않게 닫음
    setIsPostFormOpen(false);
    setHoveredMarker(null);
    setIsRoadViewOpen(false);

    // 현재 지도에 없는 게시글이어도 마커와 카드가 바로 보이게 posts에 임시 반영함
    setPosts((prevPosts) => {
      const targetId = normalizedPost.postId ?? normalizedPost.id;

      const alreadyExists = prevPosts.some(
        (prevPost) =>
          String(prevPost.postId ?? prevPost.id) === String(targetId),
      );

      if (alreadyExists) {
        return prevPosts.map((prevPost) =>
          String(prevPost.postId ?? prevPost.id) === String(targetId)
            ? normalizedPost
            : prevPost,
        );
      }

      return [...prevPosts, normalizedPost];
    });

    // 카카오 지도 객체가 이미 만들어져 있으면 즉시 중심 이동함
    if (window.kakao?.maps && mapRef.current) {
      const kakaoCenter = new window.kakao.maps.LatLng(
        nextCenter.lat,
        nextCenter.lng,
      );

      mapRef.current.setLevel(3);
      mapRef.current.setCenter(kakaoCenter);
    }
  };

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

      // PostsController.getPostsInCurrentMap으로 현재 영역 게시물을 요청
      try {
        const response = await getCommonApi().post("/posts", {
          swLatitude: boundsParams.swLat,
          swLongitude: boundsParams.swLng,
          neLatitude: boundsParams.neLat,
          neLongitude: boundsParams.neLng,
        });

        console.log("서버 응답 데이터:", response.data);

        const nextPosts = Array.isArray(response.data) ? response.data : [];
        setPosts(nextPosts);
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
    const params = new URLSearchParams(location.search);
    const focusPostId = params.get("postId");
    const focusPost = location.state?.focusPost;

    // 마이페이지에서 지도 보기로 들어온 경우 현재 위치 이동을 막음
    // 현재 위치 이동이 실행되면 게시글 위치로 이동한 지도가 다시 덮일 수 있음
    if (!focusPost && !focusPostId) {
      moveToCurrentLocation();
    }

    return () => {
      if (boundsRequestTimerRef.current) {
        clearTimeout(boundsRequestTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focusPostId = params.get("postId");
    const focusPost = location.state?.focusPost;

    // Records.jsx에서 좌표까지 넘겨준 경우 바로 해당 게시글 위치로 이동함
    if (focusPost) {
      focusPostOnMap(focusPost);
      return;
    }

    // 새로고침처럼 state가 사라진 경우 postId로 게시글을 다시 조회해서 이동함
    if (!focusPostId) return;

    const fetchFocusPost = async () => {
      try {
        const response = await getCommonApi().get(`/posts/${focusPostId}`);
        focusPostOnMap(response.data);
      } catch (error) {
        console.error("지도 이동용 게시글 조회 실패:", error);
        alert("게시글 위치를 불러오지 못했습니다.");
      }
    };

    fetchFocusPost();
  }, [location.search, location.state]);

  // 게시글 작성창에서 사진을 선택했을 때 실행되는 함수임
  // 실제 DB 저장은 handleCreatePost에서 FormData로 처리함
  const handlePostImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setPostImageFile(null);
      setPostImagePreviewUrl("");
      return;
    }

    try {
      const optimizedFile = await optimizePostImage(file);

      if (postImagePreviewUrl) URL.revokeObjectURL(postImagePreviewUrl);
      setPostImageFile(optimizedFile);
      setPostImagePreviewUrl(URL.createObjectURL(optimizedFile));
    } catch (error) {
      console.error("사진 최적화 실패:", error);
      setPostImageFile(null);
      setPostImagePreviewUrl("");
      e.target.value = "";
      alert(
        "이 사진 형식은 업로드할 수 없습니다. JPEG 또는 PNG 사진을 선택해 주세요.",
      );
    }
  };

  // 파란 마커 위치에 새 게시글을 등록하는 함수
  // 백엔드 연결 시 getCommonApi().post로 서버에 저장
  const handleCreatePost = async (e) => {
    e.preventDefault();

    const loginId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("accessToken");

    // 로그인하지 않은 사용자는 게시글 저장 요청을 보내지 않음
    // 백엔드 실패 alert 대신 로그인 안내를 먼저 보여주고 로그인 화면으로 이동함
    if (!loginId || !accessToken) {
      alert("로그인을 해야만 이용할 수 있는 서비스입니다.");
      navigate("/login");
      return;
    }

    if (!postText.trim()) {
      alert("게시글 내용을 입력해 주세요.");
      return;
    }

    // 1. 백엔드로 보낼 게시글 데이터
    const formData = new FormData();
    formData.append("text", postText);
    formData.append("latitude", markerPosition.lat);
    formData.append("longitude", markerPosition.lng);
    formData.append("altitude", postAltitude);
    formData.append("markerCustom", "default");
    formData.append("boxCustom", "default");
    formData.append("userId", loginId);

    // 사진을 선택한 경우에만 multipart file로 같이 보냄
    // 백엔드 PostCreateRequestDto의 file 필드로 들어감
    if (postImageFile) {
      formData.append("file", postImageFile);
    }

    // FormData 전체 확인
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      // 2. newPost를 백엔드 저장 API로 전송
      // Content-Type은 브라우저가 multipart boundary와 함께 자동 생성하게 둠
      const response = await getCommonApi().post("/posts/upload", formData);

      const savedPost = response.data;

      setPosts((prevPosts) => [...prevPosts, savedPost]);

      // 같은 지도 영역은 중복 조회를 막고 있으므로, 저장 직후에는 캐시를 비우고
      // 서버 기준 목록을 다시 받아 신규 게시물이 실제 영역 조회에도 포함되는지 반영함
      lastBoundsKeyRef.current = null;
      requestPostsByBounds(mapRef.current);

      // 상태 초기화
      setPostText("");
      setIsPostLiked(false);
      setPostAltitude(3);
      // 게시글 등록이 끝났으므로 선택한 사진 파일을 비움
      setPostImageFile(null);

      // 게시글 등록이 끝났으므로 미리보기 이미지도 비움
      if (postImagePreviewUrl) URL.revokeObjectURL(postImagePreviewUrl);
      setPostImagePreviewUrl("");
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

  // 게시글 상세 창에서 수정한 글과 사진 파일을 백엔드에 저장함
  // 사진 파일은 백엔드에서 S3로 업로드되고, 응답의 imageUrl로 다시 화면에 표시됨
  const handleUpdatePost = async (updatedPost) => {
    const postId = updatedPost.postId ?? updatedPost.id;
    const loginId = localStorage.getItem("userId");

    if (!postId) {
      alert("수정할 게시글 ID가 없습니다.");
      return null;
    }

    try {
      const formData = new FormData();

      formData.append("postId", Number(postId));
      formData.append("text", updatedPost.text);
      formData.append("userId", loginId);
      formData.append("markerCustom", updatedPost.markerCustom ?? "default");
      formData.append("boxCustom", updatedPost.boxCustom ?? "default");

      // 새 사진을 선택한 경우에만 file을 백엔드로 보냄
      if (updatedPost.imageFile) {
        formData.append("file", updatedPost.imageFile);
      }

      // FormData는 Axios가 Content-Type과 boundary를 자동 설정하게 두는 것이 안전함
      await getCommonApi().put("/posts", formData);

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
    } catch (error) {
      console.error("게시글 수정 실패:", error);
      alert("게시글 수정에 실패했습니다.");
      return null;
    }
  };

  // 게시글 상세 창에서 좋아요 버튼을 눌렀을 때 백엔드에 좋아요 변경을 요청하는 함수
  // PostOverlayCard에서 onToggleLike로 호출됨
  const handleToggleLike = async (post) => {
    const postId = post.postId ?? post.id;
    const loginId = localStorage.getItem("userId");
    const nextLiked = post.isLiked ?? post.likeChecked;

    if (!postId) {
      alert("좋아요 처리할 게시글 정보를 찾을 수 없습니다.");
      return null;
    }

    if (!loginId) {
      alert("로그인이 필요합니다.");
      return null;
    }

    try {
      const requestBody = {
        userId: loginId,
        postId: Number(postId),
      };

      if (nextLiked) {
        await getCommonApi().post("/posts/postlikes", requestBody);
      } else {
        await getCommonApi().delete("/posts/postlikes", {
          data: requestBody,
        });
      }

      const response = await getCommonApi().get(`/posts/${postId}`);
      const savedPost = response.data;

      setPosts((prevPosts) =>
        prevPosts.map((prevPost) =>
          String(prevPost.postId ?? prevPost.id) === String(postId)
            ? savedPost
            : prevPost,
        ),
      );

      setSelectedPost((prevPost) =>
        prevPost && String(prevPost.postId ?? prevPost.id) === String(postId)
          ? savedPost
          : prevPost,
      );

      setDetailPost((prevPost) =>
        prevPost && String(prevPost.postId ?? prevPost.id) === String(postId)
          ? savedPost
          : prevPost,
      );

      return savedPost;
    } catch (error) {
      console.error("좋아요 처리 실패:", error.response?.data || error);
      alert(error.response?.data?.message || "좋아요 처리에 실패했습니다.");
      return null;
    }
  };

  // 게시글 상세 창을 닫는 함수임
  // 상세 창을 닫을 때 선택된 상세 게시글 정보를 비워서 이전 데이터가 남지 않게 함
  const handleClosePostDetail = () => {
    setIsPostDetailOpen(false);
    setDetailPost(null);
  };

  return (
    <div className="map-wrapper">
      <Map
        id="map"
        center={mapCenter}
        style={{
          width: "100%",
          height: "100%",
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
          // 이동이 멈춘 뒤 현재 SW/NE 영역 안의 게시물만 다시 요청함
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

            // 새 게시글 작성창을 열 때 이전 사진 선택값을 비움
            setPostImageFile(null);

            // 새 게시글 작성창을 열 때 이전 미리보기 이미지도 비움
            setPostImagePreviewUrl("");
            // 기존에 열려 있던 게시글 상세 카드를 닫는 역할
            // selectedPost = 게시글 마커를 클릭했을 때 선택된 게시글 정보를 저장하는 state
            setSelectedPost(null);

            // 마커 hover 안내 말풍선을 닫는 역할
            setHoveredMarker(null);

            // 게시글 작성창을 열 때 로드뷰는 닫음
            setIsRoadViewOpen(false);
          }}
          // 선택한 작성 위치 마커를 길게 누르면 해당 위치의 로드뷰 창을 엶
          onLongPress={() => {
            setRoadViewPosition(markerPosition);
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

              {/* 게시글에 첨부할 사진을 선택하는 영역임 */}
              {/* 실제 파일 input은 숨기고, 사진 추가 버튼만 보이게 함 */}
              <div className="post-image-upload-box">
                <label
                  className="post-image-upload-button"
                  htmlFor="post-image-upload"
                >
                  {postImageFile ? "사진 변경" : "사진 추가"}
                </label>

                <input
                  id="post-image-upload"
                  className="post-image-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePostImageChange}
                />

                {postImagePreviewUrl && (
                  <img
                    src={postImagePreviewUrl}
                    alt="게시글 첨부 이미지 미리보기"
                    className="post-image-preview"
                  />
                )}
              </div>

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
                    // 게시글 작성을 취소했으므로 선택한 사진 파일을 비움
                    setPostImageFile(null);

                    // 게시글 작성을 취소했으므로 미리보기 이미지도 비움
                    setPostImagePreviewUrl("");
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
          // 경도 lng: -180 ~ 180
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
            MARKER_STYLES[post.markerCustom] ||
            MARKER_STYLES.brown ||
            MARKER_STYLES.blue;

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
          onUpdatePost={handleUpdatePost}
          onToggleLike={handleToggleLike}
        />
      )}
      {/* 커스텀 마커를 3초 이상 눌렀을 때 뜨는 로드뷰 창 */}
      {isRoadViewOpen && (
        <RoadViewPost
          isOpen
          position={roadViewPosition}
          draftPosition={markerPosition}
          draftAltitude={postAltitude}
          onDraftAltitudeChange={setPostAltitude}
          draftMarkerStyle={selectedMarkerStyle}
          // RoadViewPost.jsx에서 RoadPost의 게시글 목록을 받을 수 있음
          posts={posts}
          onClose={() => setIsRoadViewOpen(false)}
          onOpenPostDetail={handleOpenPostDetail}
        />
      )}

      {/* RoadPost에서만 보이는 우측 상단 컨트롤 박스 */}
      <div className="map-control-panel">
        <button onClick={moveToCurrentLocation}>현재 위치로 이동</button>

        {/* <div className="position-info"> */}
        {/* <p>선택 위치</p>
          <span>위도: {markerPosition.lat.toFixed(6)}</span>
          <span>경도: {markerPosition.lng.toFixed(6)}</span>
        </div>

        {/* 현재 보이는 지도 영역 표시 */}
        {/* {mapBounds && (
          <div className="position-info">
            <p>현재 지도 영역</p>
            <span>SW 위도: {mapBounds.swLat.toFixed(6)}</span>
            <span>SW 경도: {mapBounds.swLng.toFixed(6)}</span>
            <span>NE 위도: {mapBounds.neLat.toFixed(6)}</span>
            <span>NE 경도: {mapBounds.neLng.toFixed(6)}</span>
          </div>
        )} */}
      </div>
    </div>
  );
}

export default RoadPost;

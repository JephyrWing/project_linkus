import { useEffect, useState } from "react";
import "./roadpost.css";
import getCommonApi from "../../utils/Axios/getCommonApi";

// 지도 위 작은 게시글 카드와 게시글 상세 창을 같이 담당하는 컴포넌트임
// variant가 overlay면 작은 카드로 보이고, detail이면 큰 상세 창으로 보임
function PostOverlayCard({
  post,
  buttonText = "게시글 상세 보기",
  className = "",
  variant = "overlay",
  onCardClick,
  onButtonClick,
  onClose,
  onMinimize,
  onUpdatePost,
  onToggleLike,
}) {
  // 상세 모달 기본 크기값임
  // 새로고침하거나 모달을 닫았다 다시 열면 이 크기로 돌아가야 함
  const defaultDetailModalSize = {
    width: 520,
    height: 560,
  };

  // 작성자 이름 표시값임
  // userId가 있으면 userId를 먼저 쓰고, 없으면 title, 그것도 없으면 기본 문구를 씀
  const writerName = post.userId || post.title || "게시글";

  // 작은 카드에서 보여줄 게시글 내용임
  // 값이 없을 때 undefined가 보이지 않게 빈 문자열로 처리함
  const postText = post.text || "";

  // 상세 창 textarea에 들어갈 글 내용임
  // 사용자가 내용을 바꾸면 이 값이 먼저 바뀌고, 완료 버튼을 눌렀을 때 백엔드에 저장됨
  const [editText, setEditText] = useState(post.text || "");

  // 글 내용이 수정 중인지 저장하는 값임
  // true가 되면 오른쪽 아래 버튼 문구가 확인에서 완료로 바뀜
  const [isEditing, setIsEditing] = useState(false);

  // 좋아요 수 표시값임
  // 백엔드 응답의 likeNum을 기준으로 보여줌
  const [likeNum, setLikeNum] = useState(post.likeNum ?? 0);

  // 현재 로그인 사용자가 이 게시글에 좋아요를 눌렀는지 저장하는 값임
  // 백엔드는 likeChecked로 내려주고, 프론트 일부 코드는 isLiked를 쓸 수 있어서 둘 다 대응함
  const [isLiked, setIsLiked] = useState(
    post.likeChecked ?? post.isLiked ?? false,
  );

  // 상세 모달에서 새로 선택한 사진 파일을 저장하는 state임
  const [editImageFile, setEditImageFile] = useState(null);

  // 상세 모달에서 사진 미리보기를 보여주기 위한 임시 URL임
  // DB 저장용 주소가 아니라 브라우저에서만 쓰는 미리보기 주소임
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState(
    post.imageUrl || "",
  );

  // 상세 모달의 현재 화면 위치를 저장하는 state임
  // null이면 처음에는 CSS flex 중앙 정렬을 그대로 사용함
  const [detailModalPosition, setDetailModalPosition] = useState(null);

  // 드래그를 시작했을 때 마우스와 모달 좌상단 사이의 거리값을 저장함
  // 이 값이 있어야 클릭한 지점을 유지한 채 자연스럽게 움직임
  const [detailModalDragOffset, setDetailModalDragOffset] = useState({
    x: 0,
    y: 0,
  });

  // 상세 모달 현재 크기값임
  // 외곽선을 드래그하면 이 값이 바뀌면서 모달 전체 크기가 변경됨
  const [detailModalSize, setDetailModalSize] = useState(
    defaultDetailModalSize,
  );

  // 상세 모달을 드래그 이동 중인지 저장함
  // true일 때만 mousemove로 위치를 변경함
  const [isDraggingDetailModal, setIsDraggingDetailModal] = useState(false);

  // 상세 모달 크기 조정 중인지 저장함
  // true일 때만 mousemove로 크기를 변경함
  const [isResizingDetailModal, setIsResizingDetailModal] = useState(false);

  // 상세 모달 크기 조정 방향값임
  // n, s, e, w, ne, nw, se, sw 중 하나가 들어감
  const [detailModalResizeDirection, setDetailModalResizeDirection] =
    useState(null);

  // 크기 조정을 시작한 순간의 마우스 위치, 모달 크기, 모달 위치값임
  // mousemove에서 이동량을 계산할 때 기준값으로 사용함
  const [detailModalResizeStart, setDetailModalResizeStart] = useState({
    mouseX: 0,
    mouseY: 0,
    width: defaultDetailModalSize.width,
    height: defaultDetailModalSize.height,
    x: 0,
    y: 0,
  });

  // 다른 게시글을 열었을 때 이전 게시글의 수정 내용이나 좋아요 상태가 남지 않게 동기화함
  useEffect(() => {
    setEditText(post.text || "");
    setIsEditing(false);
    setLikeNum(post.likeNum ?? 0);
    setIsLiked(post.likeChecked ?? post.isLiked ?? false);
    setEditImagePreviewUrl(post.imageUrl || "");

    // 다른 게시글을 열 때 이전 모달 위치가 남지 않게 초기화함
    setDetailModalPosition(null);

    // 다른 게시글을 열 때 이전 모달 크기가 남지 않게 기본 크기로 초기화함
    setDetailModalSize(defaultDetailModalSize);
  }, [post]);

  // 상세 모달을 드래그하는 동안 마우스 이동에 맞춰 위치를 갱신함
  // 화면 밖으로 나가지 않도록 좌표를 브라우저 화면 안으로 제한함
  useEffect(() => {
    if (!isDraggingDetailModal) return;

    const handleMouseMove = (e) => {
      const modalElement = document.querySelector(".post-detail-window");

      if (!modalElement) return;

      const rect = modalElement.getBoundingClientRect();
      const nextX = e.clientX - detailModalDragOffset.x;
      const nextY = e.clientY - detailModalDragOffset.y;

      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      setDetailModalPosition({
        x: Math.min(Math.max(nextX, 0), Math.max(maxX, 0)),
        y: Math.min(Math.max(nextY, 0), Math.max(maxY, 0)),
      });
    };

    const handleMouseUp = () => {
      setIsDraggingDetailModal(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingDetailModal, detailModalDragOffset]);

  // 상세 모달 크기 조정 중 마우스 이동에 따라 모달 전체 크기와 위치를 갱신함
  // 외곽선 방향에 따라 width, height, x, y를 같이 바꿈
  // 화면 밖으로 나가지 않도록 크기와 위치를 제한함
  useEffect(() => {
    if (!isResizingDetailModal || !detailModalResizeDirection) return;

    const handleMouseMove = (e) => {
      const minWidth = 420;
      const minHeight = 320;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const deltaX = e.clientX - detailModalResizeStart.mouseX;
      const deltaY = e.clientY - detailModalResizeStart.mouseY;

      let nextX = detailModalResizeStart.x;
      let nextY = detailModalResizeStart.y;
      let nextWidth = detailModalResizeStart.width;
      let nextHeight = detailModalResizeStart.height;

      // 오른쪽 외곽선을 잡은 경우 너비를 오른쪽으로 늘리거나 줄임
      if (detailModalResizeDirection.includes("e")) {
        nextWidth = detailModalResizeStart.width + deltaX;
      }

      // 아래쪽 외곽선을 잡은 경우 높이를 아래쪽으로 늘리거나 줄임
      if (detailModalResizeDirection.includes("s")) {
        nextHeight = detailModalResizeStart.height + deltaY;
      }

      // 왼쪽 외곽선을 잡은 경우 왼쪽 위치와 너비를 같이 변경함
      if (detailModalResizeDirection.includes("w")) {
        nextWidth = detailModalResizeStart.width - deltaX;
        nextX = detailModalResizeStart.x + deltaX;
      }

      // 위쪽 외곽선을 잡은 경우 위쪽 위치와 높이를 같이 변경함
      if (detailModalResizeDirection.includes("n")) {
        nextHeight = detailModalResizeStart.height - deltaY;
        nextY = detailModalResizeStart.y + deltaY;
      }

      // 최소 너비보다 작아지지 않게 막음
      if (nextWidth < minWidth) {
        if (detailModalResizeDirection.includes("w")) {
          nextX =
            detailModalResizeStart.x + detailModalResizeStart.width - minWidth;
        }

        nextWidth = minWidth;
      }

      // 최소 높이보다 작아지지 않게 막음
      if (nextHeight < minHeight) {
        if (detailModalResizeDirection.includes("n")) {
          nextY =
            detailModalResizeStart.y +
            detailModalResizeStart.height -
            minHeight;
        }

        nextHeight = minHeight;
      }

      // 왼쪽 화면 밖으로 나가지 않게 보정함
      if (nextX < 0) {
        nextWidth += nextX;
        nextX = 0;
      }

      // 위쪽 화면 밖으로 나가지 않게 보정함
      if (nextY < 0) {
        nextHeight += nextY;
        nextY = 0;
      }

      // 오른쪽 화면 밖으로 나가지 않게 보정함
      if (nextX + nextWidth > viewportWidth) {
        nextWidth = viewportWidth - nextX;
      }

      // 아래쪽 화면 밖으로 나가지 않게 보정함
      if (nextY + nextHeight > viewportHeight) {
        nextHeight = viewportHeight - nextY;
      }

      setDetailModalPosition({
        x: nextX,
        y: nextY,
      });

      setDetailModalSize({
        width: nextWidth,
        height: nextHeight,
      });
    };

    const handleMouseUp = (e) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizingDetailModal(false);
      setDetailModalResizeDirection(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isResizingDetailModal,
    detailModalResizeDirection,
    detailModalResizeStart,
  ]);

  // 하트 버튼을 눌렀을 때 실행되는 함수임
  // 좋아요 버튼은 게시글 수정 API를 호출하면 안 됨
  // 좋아요 추가/취소 API만 호출하고, 성공하면 최신 게시글 데이터로 하트와 좋아요 수를 갱신함
  const handleLikeClick = async () => {
    const postId = post?.postId ?? post?.id;
    const loginId = localStorage.getItem("userId");

    // 현재 좋아요 상태임
    // true면 이미 좋아요 누른 상태, false면 아직 안 누른 상태임
    const currentLiked = Boolean(isLiked);

    // 버튼을 누른 뒤의 다음 좋아요 상태임
    // 현재 좋아요 상태의 반대값으로 계산함
    const nextLiked = !currentLiked;

    if (!postId) {
      alert("좋아요 처리할 게시글 정보를 찾을 수 없습니다.");
      return;
    }

    if (!loginId) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // 백엔드 응답이 늦거나 likeNum이 비어 있을 때 사용할 임시 좋아요 수임
      const fallbackLikeNum = nextLiked
        ? (likeNum ?? 0) + 1
        : Math.max((likeNum ?? 0) - 1, 0);

      // RoadPost에서 내려준 좋아요 처리 함수만 호출함
      // 여기서 onUpdatePost를 호출하면 게시글 수정 요청이 같이 나가므로 절대 호출하면 안 됨
      const responsePost = await onToggleLike?.({
        ...post,
        likeNum: fallbackLikeNum,
        likeChecked: nextLiked,
        isLiked: nextLiked,
      });

      if (!responsePost) return;

      // 백엔드에서 다시 조회한 최신 좋아요 상태를 화면에 반영함
      setIsLiked(responsePost.likeChecked ?? responsePost.isLiked ?? nextLiked);

      // 백엔드에서 다시 조회한 최신 좋아요 수를 화면에 반영함
      setLikeNum(responsePost.likeNum ?? fallbackLikeNum);

      // 좋아요 추가/취소 결과를 사용자에게 알려줌
      if (nextLiked) {
        alert("좋아요 완료");
      } else {
        alert("좋아요 취소");
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const handleCompleteClick = async () => {
    const loginId = localStorage.getItem("userId");

    if (post.userId && post.userId !== loginId) {
      alert("작성자만 게시글을 수정할 수 있습니다.");
      return;
    }
    if (!isEditing) {
      onClose?.();
      return;
    }

    if (!editText.trim()) {
      alert("게시글 내용을 입력해주세요.");
      return;
    }

    const savedPost = await onUpdatePost?.({
      ...post,
      text: editText,
      imageFile: editImageFile,
      likeNum,
      likeChecked: isLiked,
      isLiked,
    });

    if (!savedPost) return;

    setEditText(savedPost.text || "");
    setLikeNum(savedPost.likeNum ?? likeNum);
    setIsLiked(savedPost.likeChecked ?? savedPost.isLiked ?? isLiked);

    // 백엔드가 S3에 올린 뒤 돌려준 imageUrl을 화면에 보여줌
    setEditImagePreviewUrl(savedPost.imageUrl || "");
    setEditImageFile(null);

    setIsEditing(false);
  };

  // 상세 모달 헤더를 눌렀을 때 드래그 이동을 시작함
  // 현재 마우스 위치와 모달 좌상단 사이의 차이를 저장해 자연스럽게 이동되게 함
  const handleDetailModalMouseDown = (e) => {
    const modalElement = e.currentTarget.closest(".post-detail-window");

    if (!modalElement) return;

    const rect = modalElement.getBoundingClientRect();

    setDetailModalPosition({
      x: rect.left,
      y: rect.top,
    });

    setDetailModalDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    setIsDraggingDetailModal(true);
  };

  // 상세 모달 외곽선을 눌렀을 때 크기 조정을 시작함
  // direction 값으로 어느 방향 외곽선을 잡았는지 구분함
  const handleDetailModalResizeMouseDown = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();

    const modalElement = e.currentTarget.closest(".post-detail-window");

    if (!modalElement) return;

    const rect = modalElement.getBoundingClientRect();

    setIsResizingDetailModal(true);
    setDetailModalResizeDirection(direction);

    setDetailModalPosition({
      x: rect.left,
      y: rect.top,
    });

    setDetailModalResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: rect.width,
      height: rect.height,
      x: rect.left,
      y: rect.top,
    });
  };

  // 상세 모달에서 사진을 선택했을 때 실행되는 함수임
  // 파일은 저장용으로 보관하고, 화면에는 임시 미리보기 URL을 보여줌
  const handleDetailImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setEditImageFile(null);
      setEditImagePreviewUrl(post.imageUrl || "");
      return;
    }

    setEditImageFile(file);
    setEditImagePreviewUrl(URL.createObjectURL(file));
    setIsEditing(true);
  };

  if (variant === "detail") {
    return (
      <div
        className="post-detail-backdrop"
        onClick={() => {
          // 드래그나 크기 조정 중에는 배경 클릭 닫기가 실행되지 않게 막음
          if (isDraggingDetailModal || isResizingDetailModal) return;

          onClose?.();
        }}
      >
        <section
          className="post-detail-window"
          style={{
            width: `${detailModalSize.width}px`,
            height: `${detailModalSize.height}px`,
            ...(detailModalPosition
              ? {
                  position: "fixed",
                  left: `${detailModalPosition.x}px`,
                  top: `${detailModalPosition.y}px`,
                }
              : {}),
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <header
            className="post-detail-header"
            onMouseDown={handleDetailModalMouseDown}
          >
            <div className="post-detail-title-group">
              <strong>게시물 상세</strong>
              <span>{writerName}</span>
            </div>
            <button
              type="button"
              className="post-detail-close-button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={onClose}
              aria-label="게시물 상세 창 닫기"
            >
              ×
            </button>
          </header>

          <nav className="post-detail-tabs" aria-label="게시물 상세 메뉴">
            <button type="button" className="active">
              글
            </button>

            <label className="post-detail-image-url-label">사진</label>

            <input
              id="post-detail-image-upload"
              type="file"
              accept="image/*"
              onChange={handleDetailImageChange}
            />
          </nav>

          <main className="post-detail-body">
            <h3>{writerName}</h3>

            <textarea
              className="post-detail-textarea"
              value={editText}
              placeholder="게시글 내용을 입력하세요."
              onChange={(e) => {
                setEditText(e.target.value);
                setIsEditing(true);
              }}
            />

            {/* 게시글에 저장된 이미지 URL이나 새로 선택한 이미지 미리보기를 보여주는 영역임 */}
            {editImagePreviewUrl && (
              <img
                src={editImagePreviewUrl}
                alt="게시글 이미지"
                className="post-detail-image-preview"
              />
            )}
          </main>

          <footer className="post-detail-footer">
            <div className="post-detail-like-area">
              <button
                type="button"
                className={`post-detail-like-button ${isLiked ? "liked" : ""}`}
                onClick={handleLikeClick}
                aria-label={isLiked ? "좋아요 취소" : "좋아요"}
              >
                {isLiked ? "♥" : "♡"}
              </button>
              <span>{likeNum}</span>
            </div>

            <button type="button" onClick={handleCompleteClick}>
              {isEditing ? "완료" : "확인"}
            </button>
          </footer>

          {/* 상세 모달 오른쪽 아래 크기 조정 손잡이임 */}
          <div
            className="post-detail-resize-handle"
            onMouseDown={handleDetailModalResizeMouseDown}
          />

          {/* 위쪽 외곽선 크기 조정 영역임 */}
          <div
            className="post-detail-resize-handle resize-n"
            onMouseDown={(e) => handleDetailModalResizeMouseDown(e, "n")}
          />

          {/* 아래쪽 외곽선 크기 조정 영역임 */}
          <div
            className="post-detail-resize-handle resize-s"
            onMouseDown={(e) => handleDetailModalResizeMouseDown(e, "s")}
          />

          {/* 오른쪽 외곽선 크기 조정 영역임 */}
          <div
            className="post-detail-resize-handle resize-e"
            onMouseDown={(e) => handleDetailModalResizeMouseDown(e, "e")}
          />

          {/* 왼쪽 외곽선 크기 조정 영역임 */}
          <div
            className="post-detail-resize-handle resize-w"
            onMouseDown={(e) => handleDetailModalResizeMouseDown(e, "w")}
          />

          {/* 오른쪽 위 모서리 크기 조정 영역임 */}
          <div
            className="post-detail-resize-handle resize-ne"
            onMouseDown={(e) => handleDetailModalResizeMouseDown(e, "ne")}
          />

          {/* 왼쪽 위 모서리 크기 조정 영역임 */}
          <div
            className="post-detail-resize-handle resize-nw"
            onMouseDown={(e) => handleDetailModalResizeMouseDown(e, "nw")}
          />

          {/* 오른쪽 아래 모서리 크기 조정 영역임 */}
          <div
            className="post-detail-resize-handle resize-se"
            onMouseDown={(e) => handleDetailModalResizeMouseDown(e, "se")}
          />

          {/* 왼쪽 아래 모서리 크기 조정 영역임 */}
          <div
            className="post-detail-resize-handle resize-sw"
            onMouseDown={(e) => handleDetailModalResizeMouseDown(e, "sw")}
          />
        </section>
      </div>
    );
  }

  return (
    <div
      className={`post-overlay-card ${className}`.trim()}
      onClick={onCardClick}
    >
      <strong>{writerName}</strong>
      <p>{postText}</p>
      <div className="post-like-info">
        <span>{isLiked ? "♥" : "♡"}</span>
        <span>{likeNum}</span>
      </div>
      <button type="button" onClick={onButtonClick}>
        {buttonText}
      </button>
    </div>
  );
}

export default PostOverlayCard;

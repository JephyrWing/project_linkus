import { useEffect, useState } from "react";
import "./roadpost.css";

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

  // 다른 게시글을 열었을 때 이전 게시글의 수정 내용이나 좋아요 상태가 남지 않게 동기화함
  useEffect(() => {
    setEditText(post.text || "");
    setIsEditing(false);
    setLikeNum(post.likeNum ?? 0);
    setIsLiked(post.likeChecked ?? post.isLiked ?? false);
  }, [post]);

  // 하트 버튼을 눌렀을 때 실행되는 함수임
  // 부모인 RoadPost에 좋아요 변경을 요청하고, 응답으로 받은 최신 게시글 데이터로 화면을 갱신함
  const handleLikeClick = async () => {
    const savedPost = await onToggleLike?.({
      ...post,
      text: editText,
      likeNum,
      likeChecked: isLiked,
      isLiked,
    });

    if (savedPost) {
      setLikeNum(savedPost.likeNum ?? likeNum);
      setIsLiked(savedPost.likeChecked ?? savedPost.isLiked ?? !isLiked);
    }
  };

  const handleCompleteClick = async () => {
    const postId = post?.postId ?? post?.id;

    if (!postId) {
      console.log("수정할 게시글 id 없음:", post);
      alert("수정할 게시글 정보를 찾을 수 없습니다.");
      return;
    }

    const updatePost = {
      text: editText,
      latitude: post.latitude ?? post.lat,
      longitude: post.longitude ?? post.lng,
      likeNum: post.likeNum ?? 0,
      roadviewVisible: post.roadviewVisible ?? true,
      altitude: post.altitude ?? 3,
    };

    try {
      const response = await getCommonApi().put(`/posts/${postId}`, updatePost);

      const updatedPost = {
        ...post,
        ...response.data,
        postId: response.data.postId ?? response.data.id ?? postId,
        id: response.data.id ?? response.data.postId ?? postId,
        text: response.data.text ?? updatePost.text,
        lat: response.data.latitude ?? updatePost.latitude,
        lng: response.data.longitude ?? updatePost.longitude,
        latitude: response.data.latitude ?? updatePost.latitude,
        longitude: response.data.longitude ?? updatePost.longitude,
      };

      onUpdate?.(updatedPost);
      alert("게시글을 수정했습니다.");
    } catch (error) {
      console.error("게시글 수정 실패:", error);
      alert("게시글 수정에 실패했습니다.");
    }
  };

  if (variant === "detail") {
    return (
      <div className="post-detail-backdrop" onClick={onClose}>
        <section
          className="post-detail-window"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="post-detail-header">
            <div className="post-detail-title-group">
              <strong>게시물 상세</strong>
              <span>{writerName}</span>
            </div>
            <button
              type="button"
              className="post-detail-close-button"
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
            <button type="button">위치</button>
            <button type="button">반응</button>
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
          </main>

          <footer className="post-detail-footer">
            <div className="post-detail-like-area">
              <button
                type="button"
                className={`post-detail-like-button ${isLiked ? "liked" : ""}`}
                onClick={handleLikeClick}
                aria-label="좋아요"
              >
                ❤
              </button>
              <span>{likeNum}</span>
            </div>

            <button type="button" onClick={handleCompleteClick}>
              {isEditing ? "완료" : "확인"}
            </button>
          </footer>
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
        <span>❤︎</span>
        <span>{likeNum}</span>
      </div>

      <button type="button" onClick={onButtonClick}>
        {buttonText}
      </button>
    </div>
  );
}

export default PostOverlayCard;

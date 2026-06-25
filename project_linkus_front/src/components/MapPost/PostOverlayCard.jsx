import "./roadpost.css";

// 지도 위 게시글 카드와 로드뷰 안 게시글 카드가 같은 구조를 쓰도록 분리한 공통 컴포넌트
// 추후 "게시글 상세 보기" 버튼을 실제 상세 페이지 이동 기능으로 연결할 때,
// RoadPost와 RoadViewPost 양쪽 코드를 따로 고치지 않고 이 컴포넌트 사용부만 연결 가능
function PostOverlayCard({
  post,
  buttonText = "채팅하기",
  className = "",
  onCardClick,
  onButtonClick,
}) {
  const writerName = post.userId || post.title || "게시글";
  const postText = post.text || "";
  const likeNum = post.likeNum ?? 0;

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
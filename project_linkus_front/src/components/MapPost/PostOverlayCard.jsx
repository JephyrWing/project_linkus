import "./roadpost.css";

// 지도 위 작은 게시글 카드와 큰 게시글 상세 창을 한 컴포넌트에서 처리함
// 새 파일을 만들지 않고 variant 값으로 화면 역할만 나눔
function PostOverlayCard({
  post,
  buttonText = "게시글 상세 보기",
  className = "",
  variant = "overlay",
  onCardClick,
  onButtonClick,
  onClose,
  onMinimize,
}) {
  // 작성자 이름 표시값을 정리함
  // userId가 있으면 userId를 우선 사용하고, 없으면 title, 그것도 없으면 기본 문구 사용함
  const writerName = post.userId || post.title || "게시글";

  // 게시글 내용 표시값을 정리함
  // text가 없을 때 화면에 undefined가 나오지 않도록 빈 문자열 사용함
  const postText = post.text || "";

  // 좋아요 수 표시값을 정리함
  // likeNum이 0일 수 있으므로 || 대신 ?? 사용함
  const likeNum = post.likeNum ?? 0;

  // 게시글 상세 보기 버튼을 눌렀을 때 큰 게시물 창으로 보여주는 화면임
  // 새 파일을 만들지 않고 PostOverlayCard 안에서 상세 창 모드만 분기함
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

            <div className="post-detail-actions">
              <button
                type="button"
                className="post-detail-minimize-button"
                onClick={onMinimize}
                aria-label="게시물 상세 창 최소화"
              >
                <span></span>
              </button>

              <button
                type="button"
                className="post-detail-close-button"
                onClick={onClose}
                aria-label="게시물 상세 창 닫기"
              >
                ×
              </button>
            </div>
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
            <p>{postText || "게시글 내용이 없음"}</p>
          </main>

          <footer className="post-detail-footer">
            <span>❤︎ {likeNum}</span>
            <button type="button" onClick={onClose}>
              확인
            </button>
          </footer>
        </section>
      </div>
    );
  }

  // 지도 위와 로드뷰 안에서 쓰는 작은 게시글 카드 화면임
  // 기본 모드는 기존 카드 구조를 그대로 유지함
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
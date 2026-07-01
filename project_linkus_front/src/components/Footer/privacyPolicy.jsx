import "./footer.css";

function PrivacyPolicy() {
  return (
    <main className="footer-page">
      <section className="footer-page-container">
        <h1>개인정보 처리방침</h1>

        <p className="footer-page-summary">
          LinkUs는 이용자의 개인정보를 중요하게 생각하며, 서비스 제공에 필요한
          최소한의 정보만을 처리하기 위해 노력합니다.
        </p>

        <section className="footer-page-section">
          <h2>1. 수집하는 개인정보 항목</h2>

          <h3>회원 및 로그인 관련 정보</h3>
          <ul>
            <li>사용자 ID</li>
            <li>로그인 인증 토큰</li>
            <li>사용자 권한 정보</li>
          </ul>

          <h3>위치 기반 기능 관련 정보</h3>
          <ul>
            <li>사용자가 선택한 지도 좌표</li>
            <li>게시글 또는 채팅 작성 시 함께 저장한 위치 좌표</li>
            <li>현재 위치 이동 기능 사용 시 브라우저에서 제공한 위치 정보</li>
          </ul>

          <h3>게시글 및 채팅 관련 정보</h3>
          <ul>
            <li>게시글 내용</li>
            <li>게시글 작성 위치</li>
            <li>게시글 좋아요 정보</li>
            <li>실시간 채팅 내용</li>
            <li>신고 접수 정보</li>
          </ul>
        </section>

        <section className="footer-page-section">
          <h2>2. 개인정보의 이용 목적</h2>
          <ul>
            <li>회원 식별 및 로그인 상태 유지</li>
            <li>지도 기반 게시글 작성 및 표시</li>
            <li>위치 기반 실시간 채팅 제공</li>
            <li>로드뷰 내 게시글 마커 표시</li>
            <li>마이페이지의 작성글 및 좋아요 글 조회</li>
            <li>신고 접수 및 부적절한 콘텐츠 관리</li>
            <li>서비스 오류 확인 및 기능 개선</li>
          </ul>
        </section>

        <section className="footer-page-section">
          <h2>3. 위치 정보의 이용</h2>
          <p>
            LinkUs는 사용자가 허용하거나 직접 선택한 위치 정보를 서비스 기능
            제공을 위해 사용합니다. 위치 정보는 지도 표시, 게시글 위치 저장,
            로드뷰 표시, 실시간 채팅 위치 표시 등에 활용됩니다.
          </p>
        </section>

        <section className="footer-page-section">
          <h2>4. 개인정보의 보관 및 삭제</h2>
          <p>
            LinkUs는 서비스 제공에 필요한 기간 동안 개인정보를 보관합니다.
            불필요해진 개인정보는 복구가 어렵도록 안전하게 삭제합니다.
          </p>
        </section>

        <section className="footer-page-section">
          <h2>5. 외부 서비스 이용</h2>
          <p>
            LinkUs는 지도 및 로드뷰 기능 제공을 위해 카카오 지도 API를 사용할 수
            있습니다. 이 과정에서 지도 표시, 위치 검색, 로드뷰 표시 등 기능
            수행에 필요한 정보가 외부 API를 통해 처리될 수 있습니다.
          </p>
        </section>

        <section className="footer-page-section">
          <h2>6. 문의</h2>
          <p className="footer-page-muted">문의: linkus@example.com</p>
          <p className="footer-page-muted">시행일: 2026년 6월 26일</p>
        </section>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
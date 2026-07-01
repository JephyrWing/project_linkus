import "./footer.css";

function Terms() {
  return (
    <main className="footer-page">
      <section className="footer-page-container">
        <h1>이용약관</h1>

        <p className="footer-page-summary">
          본 약관은 LinkUs 서비스 이용과 관련하여 이용자와 운영자 간의 권리,
          의무 및 책임사항을 안내합니다.
        </p>

        <section className="footer-page-section">
          <h2>제1조 목적</h2>
          <p>
            본 약관은 LinkUs가 제공하는 위치 기반 커뮤니티 서비스의 이용과
            관련하여 서비스 이용자와 운영자 간의 권리, 의무 및 책임사항을 정하는
            것을 목적으로 합니다.
          </p>
        </section>

        <section className="footer-page-section">
          <h2>제2조 서비스의 내용</h2>
          <ul>
            <li>지도 기반 게시글 작성 및 조회 기능</li>
            <li>위치 기반 실시간 채팅 기능</li>
            <li>카카오 지도 및 로드뷰를 활용한 위치 정보 확인 기능</li>
            <li>게시글 좋아요 및 반응 기능</li>
            <li>마이페이지를 통한 작성글 및 좋아요 글 확인 기능</li>
            <li>신고 및 관리 기능</li>
          </ul>
        </section>

        <section className="footer-page-section">
          <h2>제3조 이용자의 의무</h2>
          <ul>
            <li>타인을 비방하거나 모욕하는 게시글 또는 채팅 작성 금지</li>
            <li>허위 정보, 광고성 정보, 스팸성 내용 게시 금지</li>
            <li>개인정보, 연락처, 계정 정보 등 민감한 정보 무단 공개 금지</li>
            <li>타인의 권리나 명예를 침해하는 행위 금지</li>
            <li>서비스의 정상적인 운영을 방해하는 행위 금지</li>
          </ul>
        </section>

        <section className="footer-page-section">
          <h2>제4조 위치 정보 이용</h2>
          <p>
            LinkUs는 위치 기반 서비스를 제공하기 위해 사용자가 선택한 위치 또는
            브라우저에서 허용한 현재 위치 정보를 활용할 수 있습니다. 위치 정보는
            게시글 작성, 지도 표시, 로드뷰 표시, 실시간 채팅 위치 표시 등의
            기능을 위해 사용됩니다.
          </p>
        </section>

        <section className="footer-page-section">
          <h2>제5조 게시글 및 채팅 관리</h2>
          <p>
            운영자는 욕설, 혐오, 차별, 비방, 개인정보 침해, 광고, 도배성 내용
            등이 포함된 게시글 또는 채팅을 사전 통보 없이 숨김 처리하거나 삭제할
            수 있습니다.
          </p>
        </section>

        <section className="footer-page-section">
          <h2>제6조 서비스 이용 제한</h2>
          <p>
            이용자가 약관을 위반하거나 서비스 운영을 방해한다고 판단되는 경우,
            운영자는 게시글 삭제, 채팅 제한, 계정 이용 제한 등의 조치를 취할 수
            있습니다.
          </p>
        </section>

        <section className="footer-page-section">
          <h2>제7조 책임의 제한</h2>
          <p>
            LinkUs는 이용자가 작성한 게시글, 채팅, 위치 정보의 정확성이나
            신뢰성을 보장하지 않습니다. 이용자는 서비스에서 확인한 정보를 참고
            자료로 활용해야 합니다.
          </p>
        </section>
      </section>
    </main>
  );
}

export default Terms;
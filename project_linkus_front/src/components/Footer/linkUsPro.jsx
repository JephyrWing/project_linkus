import "./footer.css";

function LinkUsPro() {
  return (
    <main className="footer-page">
      <section className="footer-page-container">
        <h1>LinkUs PRO</h1>

        <p className="footer-page-summary">
          LinkUs PRO는 더 확장된 위치 기반 커뮤니티 경험을 제공하기 위해 준비
          중인 기능입니다.
        </p>

        <section className="footer-page-section">
          <h2>현재 개발 단계입니다</h2>

          <p>
            LinkUs PRO는 아직 정식으로 제공되지 않는 기능이며, 현재 서비스 기획
            및 개발 단계에 있습니다.
          </p>

          <p>
            향후 LinkUs PRO에서는 더 정교한 위치 기반 기능, 확장된 커뮤니티
            기능, 사용자 맞춤형 기능 등을 제공하는 것을 목표로 하고 있습니다.
          </p>
        </section>

        <section className="footer-page-section">
          <h2>안내</h2>

          <p>
            현재 LinkUs PRO 메뉴는 향후 기능 확장을 위한 안내 페이지입니다.
            실제 PRO 기능은 추후 업데이트를 통해 제공될 예정입니다.
          </p>

          <p className="footer-page-muted">
            LinkUs PRO는 현재 개발 중이며, 제공 기능과 일정은 변경될 수 있습니다.
          </p>
        </section>
      </section>
    </main>
  );
}

export default LinkUsPro;
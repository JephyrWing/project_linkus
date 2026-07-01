import "./footer.css";

function ServiceIntro() {
  return (
    <main className="footer-page">
      <section className="footer-page-container">
        <h1>서비스 소개</h1>

        <p className="footer-page-summary">
          LinkUs는 지도 위에서 사람과 장소를 연결하는 위치 기반 커뮤니티
          서비스입니다.
        </p>

        <section className="footer-page-section">
          <h2>LinkUs란?</h2>
          <p>
            LinkUs는 사용자가 현재 위치 또는 원하는 위치를 기준으로 게시글을
            남기고, 주변의 다른 사용자들이 남긴 글과 실시간 채팅을 통해 장소에
            대한 정보와 경험을 공유할 수 있는 서비스입니다.
          </p>
          <p>
            단순히 지도를 보여주는 것이 아니라, 특정 장소에서 일어나는 이야기와
            사람들의 반응을 연결하는 것을 목표로 합니다.
          </p>
        </section>

        <section className="footer-page-section">
          <h2>주요 기능</h2>

          <h3>위치 기반 게시글 작성</h3>
          <p>
            사용자는 지도에서 원하는 위치를 선택한 뒤 해당 장소에 대한 게시글을
            작성할 수 있습니다. 게시글은 지도 위 마커 형태로 표시됩니다.
          </p>

          <h3>로드뷰 연동</h3>
          <p>
            LinkUs는 카카오 로드뷰 기능을 활용하여 선택한 위치 주변의 실제 거리
            화면을 확인할 수 있도록 돕습니다.
          </p>

          <h3>실시간 위치 채팅</h3>
          <p>
            사용자는 지도 기반 실시간 채팅을 통해 주변 장소에 대한 짧은 의견,
            질문, 정보 등을 남길 수 있습니다.
          </p>

          <h3>마이페이지</h3>
          <p>
            마이페이지에서는 사용자가 작성한 게시글과 좋아요한 게시글을 확인할
            수 있습니다.
          </p>
        </section>

        <section className="footer-page-section">
          <h2>LinkUs가 지향하는 가치</h2>
          <p>
            LinkUs는 사람과 장소 사이의 연결을 더 쉽고 직관적으로 만드는 것을
            목표로 합니다. 지도 위의 하나의 마커가 누군가의 경험이 되고, 그
            경험이 다른 사용자에게 도움이 되는 흐름을 만들고자 합니다.
          </p>
        </section>
      </section>
    </main>
  );
}

export default ServiceIntro;
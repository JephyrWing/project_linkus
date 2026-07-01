import "./footer.css";

function ReportGuide() {
  return (
    <main className="footer-page">
      <section className="footer-page-container">
        <h1>신고가이드</h1>

        <p className="footer-page-summary">
          LinkUs는 사용자가 안전하게 위치 기반 소통을 할 수 있는 환경을 만들기
          위해 신고 기능을 운영합니다.
        </p>

        <section className="footer-page-section">
          <h2>신고 대상</h2>

          <h3>욕설 및 비방</h3>
          <p>
            타인을 모욕하거나 불쾌감을 주는 욕설, 조롱, 비난, 인신공격성 표현이
            포함된 경우 신고할 수 있습니다.
          </p>

          <h3>혐오 및 차별 표현</h3>
          <p>
            성별, 나이, 국적, 지역, 장애, 종교, 직업, 외모 등을 이유로 특정
            개인이나 집단을 차별하거나 혐오하는 표현은 신고 대상입니다.
          </p>

          <h3>허위 정보</h3>
          <p>
            실제와 다른 장소 정보, 조작된 내용, 오해를 유발할 수 있는 허위
            게시글 또는 채팅은 신고할 수 있습니다.
          </p>

          <h3>개인정보 노출</h3>
          <p>
            타인의 이름, 연락처, 주소, 계정 정보, 사진 등 개인정보가 동의 없이
            공개된 경우 신고할 수 있습니다.
          </p>

          <h3>광고 및 도배</h3>
          <p>
            서비스 목적과 무관한 광고, 홍보성 글, 반복 게시글, 무분별한 채팅은
            신고 대상입니다.
          </p>

          <h3>위치 정보 악용</h3>
          <p>
            특정 사용자의 위치를 추적하거나 사생활을 침해할 우려가 있는 내용은
            신고 대상입니다.
          </p>
        </section>

        <section className="footer-page-section">
          <h2>신고 처리 절차</h2>
          <ol>
            <li>사용자가 게시글 또는 채팅을 신고합니다.</li>
            <li>운영자는 신고된 내용을 확인합니다.</li>
            <li>약관 및 운영 정책 위반 여부를 검토합니다.</li>
            <li>필요한 경우 게시글 숨김, 삭제, 사용자 이용 제한 등의 조치를 취합니다.</li>
            <li>반복적이거나 악의적인 위반 행위는 추가 제재가 적용될 수 있습니다.</li>
          </ol>
        </section>

        <section className="footer-page-section">
          <h2>신고 시 유의사항</h2>
          <p>
            단순히 의견이 다르거나 마음에 들지 않는다는 이유만으로 신고하는 것은
            적절하지 않습니다. 허위 신고 또는 악의적인 반복 신고는 서비스 운영을
            방해하는 행위로 판단될 수 있습니다.
          </p>
        </section>
      </section>
    </main>
  );
}

export default ReportGuide;
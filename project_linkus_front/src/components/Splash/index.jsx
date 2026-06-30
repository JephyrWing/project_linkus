import { useEffect } from "react";
import "./splash.css";

/**
 * Splash 컴포넌트
 * - 웹사이트 진입 전에 보여주는 스플래쉬 화면임
 * - duration 시간만큼 보여준 뒤 onFinish 실행함
 */
export default function Splash({ onFinish, duration = 3000 }) {
  useEffect(() => {
    /**
     * duration이 지나면 스플래쉬 종료 처리함
     * onFinish가 있으면 실행하고, 없으면 아무 동작 안 함
     */
    const timer = setTimeout(() => {
      onFinish?.();
    }, duration);

    /**
     * 컴포넌트가 사라질 때 타이머 정리함
     * 메모리 누수 방지용임
     */
    return () => clearTimeout(timer);
  }, [onFinish, duration]);

  return (
    /**
     * 전체 스플래쉬 화면 영역
     * - 화면 전체를 덮는 컨테이너 역할
     * - aria-label은 접근성용 설명임
     */
    <section className="splash-screen" aria-label="LinkUs splash screen">
      {/**
       * 로고 애니메이션 콘텐츠 묶음
       * - SVG 아이콘
       * - LinkUs 텍스트
       * - 서브 문구 포함함
       */}
      <div className="splash-content">
        {/**
         * 경로 + 위치 핀 + 링크 모티프를 표현하는 SVG
         * - 브랜드 컨셉인 위치, 경로, 연결을 시각화함
         */}
        <svg
          className="splash-symbol"
          viewBox="0 0 260 150"
          role="img"
          aria-label="LinkUs route animation"
        >
          {/* 출발점: 사용자 현재 위치 또는 시작 지점을 의미함 */}
          <circle className="splash-start-dot" cx="45" cy="102" r="5" />

          {/* 경로 그림자: 실제 경로 뒤에 깔리는 부드러운 보조선임 */}
          <path
            className="splash-route-shadow"
            d="M45 102 C78 58 115 118 148 78 C172 49 193 58 211 64"
          />

          {/* 실제 경로: 출발점에서 목적지까지 이어지는 길을 의미함 */}
          <path
            className="splash-route"
            d="M45 102 C78 58 115 118 148 78 C172 49 193 58 211 64"
          />

          {/* 도착 위치 핀: 경로의 최종 목적지를 의미함 */}
          <g transform="translate(183 13)">
            {/**
             * 위치 핀 전체 그룹
             * - CSS에서 pop 애니메이션 적용됨
             */}
            <g className="splash-pin">
              {/**
               * 핀 외형
               * - 위치 기반 서비스라는 느낌을 가장 직접적으로 보여주는 요소임
               */}
              <path
                className="splash-pin-body"
                d="M30 0C13.4 0 0 13.4 0 30c0 21.5 30 54 30 54s30-32.5 30-54C60 13.4 46.6 0 30 0z"
              />

              {/**
               * 핀 내부 링크 모티프
               * - LinkUs의 'Link' 의미를 보여주는 부분임
               * - 사람과 장소가 연결된다는 브랜드 컨셉 표현함
               */}
              <g className="splash-pin-link">
                <path d="M21 32l-5 5a8 8 0 0 0 11.3 11.3l6-6" />
                <path d="M39 28l5-5a8 8 0 0 0-11.3-11.3l-6 6" />
                <path d="M25 35l10-10" />
              </g>
            </g>
          </g>
        </svg>

        {/* 브랜드 이름: 아이콘 애니메이션 뒤에 등장하는 메인 로고 텍스트임 */}
        <h1 className="splash-logo">LinkUs</h1>

        {/* 브랜드 슬로건: 서비스 정체성을 짧게 설명하는 문구임 */}
        <p className="splash-subtitle">사람과 장소를 연결하다</p>
      </div>
    </section>
  );
}
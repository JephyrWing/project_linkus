import { useEffect, useMemo, useState } from "react";
import {
  MdArrowBack,
  MdArrowForward,
  MdCheck,
  MdClose,
} from "react-icons/md";
import "./tutorial.css";

const LOGGED_IN_TUTORIAL_STEPS = [
  {
    title: "LinkUs 튜토리얼",
    description:
      "Post 화면과 사이드바에서 자주 쓰는 기능을 빠르게 살펴봅니다. 이 안내는 언제든 다시 실행할 수 있습니다.",
    placement: "center",
  },
  {
    target: '[data-tutorial="mode-toggle"]',
    title: "Post / Chat 전환",
    description:
      "가운데 버튼으로 게시글 지도와 채팅 지도를 전환할 수 있습니다. 지금은 지도에 게시글을 남기는 Post 화면입니다.",
    placement: "bottom",
    sidebarOpen: false,
  },
  {
    target: '[data-tutorial="roadpost-map"]',
    title: "지도에서 위치 선택",
    description:
      "지도의 원하는 곳을 누르면 마커 위치가 바뀝니다. 마커를 누르면 그 위치에 게시글을 작성할 수 있습니다.",
    placement: "center",
    sidebarOpen: false,
  },
  {
    target: '[data-tutorial="roadpost-help"]',
    title: "도움말",
    description:
      "물음표 버튼은 Post 화면에서 게시글 작성 방법을 다시 확인하고 싶을 때 사용합니다.",
    placement: "right",
    sidebarOpen: false,
  },
  {
    target: '[data-tutorial="roadpost-controls"]',
    title: "지도 컨트롤",
    description:
      "C 버튼에서는 현재 위치로 이동, 로드뷰 확인, 마커 꾸미기, 게시글 박스 꾸미기를 열 수 있습니다.",
    placement: "right",
    sidebarOpen: false,
  },
  {
    target: '[data-tutorial="sidebar-open"]',
    title: "사이드바 열기",
    description:
      "오른쪽 메뉴 버튼을 누르면 내 정보, 꾸미기, 신고, 로그아웃 같은 메뉴를 볼 수 있습니다.",
    placement: "left",
    sidebarOpen: false,
  },
  {
    target: '[data-tutorial="sidebar-panel"]',
    title: "사이드바 메뉴",
    description:
      "이 영역에서 계정 관련 메뉴와 화면 이동 메뉴를 모아 볼 수 있습니다.",
    placement: "left",
    sidebarOpen: true,
  },
  {
    target: '[data-tutorial="sidebar-profile"]',
    title: "내 정보",
    description:
      "프로필 영역을 누르면 마이페이지로 이동해 내 정보를 확인할 수 있습니다.",
    placement: "left",
    sidebarOpen: true,
  },
  {
    target: '[data-tutorial="sidebar-custom"]',
    title: "꾸미기",
    description:
      "Post 화면에서는 마커 꾸미기를 열고, Chat 화면에서는 채팅 스타일 꾸미기를 열 수 있습니다.",
    placement: "left",
    sidebarOpen: true,
  },
  {
    target: '[data-tutorial="sidebar-report"]',
    title: "신고",
    description:
      "문제가 있는 게시글이나 사용자를 신고해야 할 때 이 버튼으로 신고 화면에 들어갑니다.",
    placement: "top-left",
    sidebarOpen: true,
  },
  {
    target: '[data-tutorial="sidebar-logout"]',
    title: "로그아웃",
    description:
      "사용을 마쳤다면 여기서 로그아웃할 수 있습니다.",
    placement: "top-left",
    sidebarOpen: true,
  },
];

const GUEST_TUTORIAL_STEPS = [
  {
    title: "LinkUs 튜토리얼",
    description:
      "로그인하지 않아도 Post 화면과 사이드바 안내를 볼 수 있습니다. 다만 계정이 필요한 기능은 안내 안에서 따로 알려드릴게요.",
    placement: "center",
  },
  {
    target: '[data-tutorial="mode-toggle"]',
    title: "Post / Chat 전환",
    description:
      "가운데 버튼으로 게시글 지도와 채팅 지도를 전환할 수 있습니다. 지금은 지도에 게시글을 남기는 Post 화면입니다.",
    placement: "bottom",
    sidebarOpen: false,
  },
  {
    target: '[data-tutorial="roadpost-map"]',
    title: "지도에서 위치 선택",
    description:
      "지도의 원하는 곳을 눌러 마커 위치를 바꿀 수 있습니다. 게시글 작성과 등록은 로그인해야 사용할 수 있습니다.",
    placement: "center",
    sidebarOpen: false,
    loginRequired: true,
  },
  {
    target: '[data-tutorial="roadpost-help"]',
    title: "도움말",
    description:
      "물음표 버튼은 Post 화면에서 게시글 작성 방법을 다시 확인하고 싶을 때 사용합니다.",
    placement: "right",
    sidebarOpen: false,
  },
  {
    target: '[data-tutorial="roadpost-controls"]',
    title: "지도 컨트롤",
    description:
      "C 버튼에서는 현재 위치 이동과 로드뷰 확인 같은 지도 기능을 열 수 있습니다. 마커 꾸미기처럼 개인 설정을 저장하는 기능은 로그인해야 사용할 수 있습니다.",
    placement: "right",
    sidebarOpen: false,
    loginRequired: true,
  },
  {
    target: '[data-tutorial="sidebar-open"]',
    title: "사이드바 열기",
    description:
      "오른쪽 메뉴 버튼을 누르면 현재 이용 가능한 메뉴를 볼 수 있습니다.",
    placement: "left",
    sidebarOpen: false,
  },
  {
    target: '[data-tutorial="sidebar-panel"]',
    title: "비로그인 사이드바",
    description:
      "비로그인 상태에서는 Home, Login, Sign Up처럼 기본 메뉴만 표시됩니다. 내 정보, 꾸미기, 신고, 로그아웃은 로그인 후 사용할 수 있습니다.",
    placement: "left",
    sidebarOpen: true,
    loginRequired: true,
  },
  {
    target: '[data-tutorial="sidebar-login"]',
    title: "로그인",
    description:
      "로그인하면 마이페이지, 신고, 꾸미기, 로그아웃 같은 회원 기능이 사이드바에 나타납니다.",
    placement: "left",
    sidebarOpen: true,
  },
  {
    target: '[data-tutorial="sidebar-signup"]',
    title: "회원가입",
    description:
      "아직 계정이 없다면 Sign Up에서 가입할 수 있습니다. 가입 후 로그인하면 모든 회원 기능을 사용할 수 있습니다.",
    placement: "left",
    sidebarOpen: true,
  },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getTargetRect = (selector) => {
  if (!selector) return null;

  const element = document.querySelector(selector);
  if (!element) return null;

  const rect = element.getBoundingClientRect();

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    right: rect.right,
    bottom: rect.bottom,
  };
};

function FirstRunTutorial({
  isOpen,
  isLoggedIn = false,
  onClose,
  onOpenSidebar,
  onCloseSidebar,
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const steps = isLoggedIn
    ? LOGGED_IN_TUTORIAL_STEPS
    : GUEST_TUTORIAL_STEPS;
  const step = steps[stepIndex] || steps[0];
  const progress = ((stepIndex + 1) / steps.length) * 100;
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    if (!isOpen) return;

    if (step.sidebarOpen) {
      onOpenSidebar?.();
    } else {
      onCloseSidebar?.();
    }
  }, [isOpen, onCloseSidebar, onOpenSidebar, step.sidebarOpen, stepIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const updateTargetRect = () => {
      setTargetRect(getTargetRect(step.target));
    };

    const timer = window.setTimeout(
      updateTargetRect,
      step.sidebarOpen ? 340 : 80,
    );

    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [isOpen, step.sidebarOpen, step.target, stepIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowRight" || event.key === "Enter") {
        if (stepIndex === steps.length - 1) {
          onClose();
          return;
        }

        setStepIndex((currentIndex) => currentIndex + 1);
        return;
      }

      if (event.key === "ArrowLeft") {
        setStepIndex((currentIndex) => Math.max(currentIndex - 1, 0));
      }
    };

    document.body.classList.add("first-run-tutorial-active");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("first-run-tutorial-active");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, stepIndex, steps.length]);

  const cardStyle = useMemo(() => {
    const margin = 16;
    const gap = 18;
    const width = Math.min(360, window.innerWidth - margin * 2);
    const estimatedHeight = 238;

    if (!targetRect || step.placement === "center") {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width,
      };
    }

    let left = targetRect.left + targetRect.width / 2 - width / 2;
    let top = targetRect.bottom + gap;

    if (step.placement === "top") {
      top = targetRect.top - estimatedHeight - gap;
    }

    if (step.placement === "right") {
      left = targetRect.right + gap;
      top = targetRect.top + targetRect.height / 2 - estimatedHeight / 2;
    }

    if (step.placement === "left") {
      left = targetRect.left - width - gap;
      top = targetRect.top + targetRect.height / 2 - estimatedHeight / 2;
    }

    if (step.placement === "top-left") {
      left = targetRect.left - width + targetRect.width;
      top = targetRect.top - estimatedHeight - gap;
    }

    left = clamp(left, margin, window.innerWidth - width - margin);
    top = clamp(top, margin, window.innerHeight - estimatedHeight - margin);

    return {
      left,
      top,
      width,
    };
  }, [step.placement, targetRect]);

  if (!isOpen) return null;

  const goNext = () => {
    if (isLastStep) {
      onClose();
      return;
    }

    setStepIndex((currentIndex) => currentIndex + 1);
  };

  const goPrevious = () => {
    setStepIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  };

  return (
    <div className="first-run-tutorial-layer" role="presentation">
      <div className="first-run-tutorial-scrim" />

      {targetRect && step.placement !== "center" && (
        <div
          className="first-run-tutorial-ring"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      <section
        className="first-run-tutorial-card"
        style={cardStyle}
        aria-live="polite"
      >
        <div className="first-run-tutorial-topline">
          <span>
            {stepIndex + 1} / {steps.length}
          </span>

          <button
            type="button"
            className="first-run-tutorial-icon-button"
            onClick={onClose}
            aria-label="튜토리얼 닫기"
          >
            <MdClose />
          </button>
        </div>

        <h2>{step.title}</h2>
        <p>{step.description}</p>
        {!isLoggedIn && step.loginRequired && (
          <div className="first-run-tutorial-login-note">
            로그인해야 사용할 수 있는 기능입니다.
          </div>
        )}

        <div
          className="first-run-tutorial-progress"
          aria-label="튜토리얼 진행률"
        >
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="first-run-tutorial-actions">
          <button
            type="button"
            className="first-run-tutorial-secondary"
            onClick={onClose}
          >
            건너뛰기
          </button>

          <div className="first-run-tutorial-step-actions">
            <button
              type="button"
              className="first-run-tutorial-icon-text"
              onClick={goPrevious}
              disabled={stepIndex === 0}
            >
              <MdArrowBack />
              이전
            </button>

            <button
              type="button"
              className="first-run-tutorial-primary"
              onClick={goNext}
            >
              {isLastStep ? (
                <>
                  <MdCheck />
                  완료
                </>
              ) : (
                <>
                  다음
                  <MdArrowForward />
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FirstRunTutorial;

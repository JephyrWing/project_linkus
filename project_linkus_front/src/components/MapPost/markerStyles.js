// markerStyles.js
// 마커 색상과 형태를 분리해서 관리함
// DB에는 "형태_색상" 문자열로 저장됨

export const CUSTOM_MARKER_COLOR_KEY = "custom";

export const MARKER_COLORS = {
  brown: {
    id: "brown",
    name: "브라운",
    color: "#92715c",
    borderColor: "white",
    innerColor: "white",
  },
  red: {
    id: "red",
    name: "레드",
    color: "#e74c3c",
    borderColor: "white",
    innerColor: "white",
  },
  blue: {
    id: "blue",
    name: "블루",
    color: "#184c88",
    borderColor: "white",
    innerColor: "white",
  },
  pink: {
    id: "pink",
    name: "핑크",
    color: "#ff7aa2",
    borderColor: "white",
    innerColor: "white",
  },
  green: {
    id: "green",
    name: "그린",
    color: "#4caf50",
    borderColor: "white",
    innerColor: "white",
  },
  yellow: {
    id: "yellow",
    name: "옐로우",
    color: "#f5b942",
    borderColor: "white",
    innerColor: "white",
  },

  purple: {
    id: "purple",
    name: "퍼플",
    color: "#8b5cf6",
    borderColor: "white",
    innerColor: "white",
  },
  blackGold: {
    id: "blackGold",
    name: "블랙 골드",
    color: "#111827",
    borderColor: "#f5b942",
    innerColor: "#f5b942",
  },
  whiteBrown: {
    id: "whiteBrown",
    name: "화이트 브라운",
    color: "#ffffff",
    borderColor: "#92715c",
    innerColor: "#92715c",
  },
  orange: {
    id: "orange",
    name: "오렌지",
    color: "#f97316",
    borderColor: "white",
    innerColor: "white",
  },
  mint: {
    id: "mint",
    name: "민트",
    color: "#14b8a6",
    borderColor: "white",
    innerColor: "white",
  },
  sky: {
    id: "sky",
    name: "스카이",
    color: "#38bdf8",
    borderColor: "white",
    innerColor: "white",
  },

  navy: {
    id: "navy",
    name: "네이비",
    color: "#1e3a8a",
    borderColor: "white",
    innerColor: "white",
  },
  rose: {
    id: "rose",
    name: "로즈",
    color: "#fb7185",
    borderColor: "white",
    innerColor: "white",
  },
  lime: {
    id: "lime",
    name: "라임",
    color: "#84cc16",
    borderColor: "white",
    innerColor: "white",
  },
  teal: {
    id: "teal",
    name: "틸",
    color: "#0f766e",
    borderColor: "white",
    innerColor: "white",
  },
  coral: {
    id: "coral",
    name: "코랄",
    color: "#ff6b6b",
    borderColor: "white",
    innerColor: "white",
  },
  lavender: {
    id: "lavender",
    name: "라벤더",
    color: "#a78bfa",
    borderColor: "white",
    innerColor: "white",
  },

  indigo: {
    id: "indigo",
    name: "인디고",
    color: "#4338ca",
    borderColor: "white",
    innerColor: "white",
  },
  emerald: {
    id: "emerald",
    name: "에메랄드",
    color: "#059669",
    borderColor: "white",
    innerColor: "white",
  },
  amber: {
    id: "amber",
    name: "앰버",
    color: "#f59e0b",
    borderColor: "white",
    innerColor: "white",
  },
  slate: {
    id: "slate",
    name: "슬레이트",
    color: "#475569",
    borderColor: "white",
    innerColor: "white",
  },
  wine: {
    id: "wine",
    name: "와인",
    color: "#9f1239",
    borderColor: "white",
    innerColor: "white",
  },
  cream: {
    id: "cream",
    name: "크림",
    color: "#fff7ed",
    borderColor: "#92715c",
    innerColor: "#92715c",
  },
};

const normalizeCustomColor = (color = "#92715c") => {
  const safeColor = color.startsWith("#") ? color : `#${color}`;
  return /^#[0-9a-fA-F]{6}$/.test(safeColor) ? safeColor : "#92715c";
};

// 사용자 지정 색이면 shape_custom_ff6699 형태로 저장됨
export const createMarkerCustomKey = (
  shapeKey,
  colorKey,
  customColor = "#92715c",
) => {
  if (colorKey === CUSTOM_MARKER_COLOR_KEY) {
    return `${shapeKey}_${CUSTOM_MARKER_COLOR_KEY}_${normalizeCustomColor(customColor).replace("#", "")}`;
  }

  return `${shapeKey}_${colorKey}`;
};

export const parseMarkerCustomKey = (markerCustom = "pin_brown") => {
  const normalizedKey = LEGACY_MARKER_STYLES[markerCustom] || markerCustom;
  const [shapeKey = "pin", colorKey = "brown", customHex] =
    normalizedKey.split("_");

  if (colorKey === CUSTOM_MARKER_COLOR_KEY) {
    return {
      shapeKey: MARKER_SHAPES[shapeKey] ? shapeKey : "pin",
      colorKey: CUSTOM_MARKER_COLOR_KEY,
      customColor: normalizeCustomColor(customHex || "#92715c"),
    };
  }

  if (MARKER_COLORS[shapeKey] && MARKER_SHAPES[colorKey]) {
    return {
      shapeKey: colorKey,
      colorKey: shapeKey,
      customColor: "#92715c",
    };
  }

  return {
    shapeKey: MARKER_SHAPES[shapeKey] ? shapeKey : "pin",
    colorKey: MARKER_COLORS[colorKey] ? colorKey : "brown",
    customColor: "#92715c",
  };
};

export const getMarkerStyleByCustom = (markerCustom = "pin_brown") => {
  const { shapeKey, colorKey, customColor } =
    parseMarkerCustomKey(markerCustom);
  const shape = MARKER_SHAPES[shapeKey];

  const color =
    colorKey === CUSTOM_MARKER_COLOR_KEY
      ? {
          id: CUSTOM_MARKER_COLOR_KEY,
          name: "사용자 지정",
          color: customColor,
          borderColor: "white",
          innerColor: "white",
        }
      : MARKER_COLORS[colorKey];

  return {
    id: createMarkerCustomKey(shapeKey, colorKey, customColor),
    name: `${color.name} ${shape.name}`,
    shape: shape.shape,
    color: color.color,
    borderColor: color.borderColor,
    innerColor: color.innerColor,
    colorKey,
    shapeKey,
    customColor,
  };
};

export const MARKER_SHAPES = {
  pin: { id: "pin", name: "핀", shape: "pin" },
  circle: { id: "circle", name: "원형", shape: "circle" },
  diamond: { id: "diamond", name: "다이아", shape: "diamond" },
  square: { id: "square", name: "사각", shape: "square" },
  shield: { id: "shield", name: "방패", shape: "shield" },
  flag: { id: "flag", name: "깃발", shape: "flag" },

  hexagon: { id: "hexagon", name: "육각형", shape: "hexagon" },
  pentagon: { id: "pentagon", name: "오각형", shape: "pentagon" },
  triangle: { id: "triangle", name: "삼각형", shape: "triangle" },
  capsule: { id: "capsule", name: "캡슐", shape: "capsule" },
  drop: { id: "drop", name: "물방울", shape: "drop" },
  badge: { id: "badge", name: "배지", shape: "badge" },

  star: { id: "star", name: "별", shape: "star" },
  heart: { id: "heart", name: "하트", shape: "heart" },
  cat: { id: "cat", name: "고양이", shape: "cat" },
  bear: { id: "bear", name: "곰돌이", shape: "bear" },
  flower: { id: "flower", name: "꽃", shape: "flower" },
  cloud: { id: "cloud", name: "구름", shape: "cloud" },

  crown: { id: "crown", name: "왕관", shape: "crown" },
  house: { id: "house", name: "집", shape: "house" },
  chat: { id: "chat", name: "말풍선", shape: "chat" },
  sparkle: { id: "sparkle", name: "반짝", shape: "sparkle" },
  ribbon: { id: "ribbon", name: "리본", shape: "ribbon" },
  paw: { id: "paw", name: "발자국", shape: "paw" },
};

// 이전 방식의 markerCustom 값도 깨지지 않게 처리함
export const LEGACY_MARKER_STYLES = {
  default: "pin_brown",
  brown: "pin_brown",
  red: "pin_red",
  blue: "pin_blue",
  pink: "pin_pink",
  green: "pin_green",
  yellow: "pin_yellow",
  purple: "pin_purple",
  brownCircle: "circle_brown",
  redDiamond: "diamond_red",
  blueSquare: "square_blue",
  greenShield: "shield_green",
  yellowFlag: "flag_yellow",
  blackGoldDiamond: "diamond_blackGold",
};

// 기존 코드 호환용 기본 마커 목록임
export const MARKER_STYLES = {
  default: getMarkerStyleByCustom("pin_brown"),
  brown: getMarkerStyleByCustom("pin_brown"),
  red: getMarkerStyleByCustom("pin_red"),
  blue: getMarkerStyleByCustom("pin_blue"),
  pink: getMarkerStyleByCustom("pin_pink"),
  green: getMarkerStyleByCustom("pin_green"),
  yellow: getMarkerStyleByCustom("pin_yellow"),
  purple: getMarkerStyleByCustom("pin_purple"),
};

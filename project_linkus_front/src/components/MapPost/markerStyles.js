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

const hexToRgb = (color) => {
  const safeColor = normalizeCustomColor(color).replace("#", "");

  return {
    r: parseInt(safeColor.slice(0, 2), 16),
    g: parseInt(safeColor.slice(2, 4), 16),
    b: parseInt(safeColor.slice(4, 6), 16),
  };
};

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map((value) => Math.round(value).toString(16).padStart(2, "0"))
    .join("")}`;

const mixHexColors = (color, target = "#ffffff", targetWeight = 0.85) => {
  const sourceRgb = hexToRgb(color);
  const targetRgb = hexToRgb(target);
  const sourceWeight = 1 - targetWeight;

  return rgbToHex({
    r: sourceRgb.r * sourceWeight + targetRgb.r * targetWeight,
    g: sourceRgb.g * sourceWeight + targetRgb.g * targetWeight,
    b: sourceRgb.b * sourceWeight + targetRgb.b * targetWeight,
  });
};

const getLuminance = (color) => {
  const { r, g, b } = hexToRgb(color);
  const [red, green, blue] = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const getContrastRatio = (firstColor, secondColor) => {
  const firstLuminance = getLuminance(firstColor);
  const secondLuminance = getLuminance(secondColor);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};

const getReadableTextColor = (backgroundColor) => {
  const darkTextColor = "#4b3528";
  const whiteContrast = getContrastRatio(backgroundColor, "#ffffff");
  const darkContrast = getContrastRatio(backgroundColor, darkTextColor);

  return whiteContrast >= darkContrast ? "#ffffff" : darkTextColor;
};

const getBoxAccentColor = (colorStyle) => {
  const baseColor = colorStyle?.color || MARKER_COLORS.brown.color;
  const borderColor = colorStyle?.borderColor || MARKER_COLORS.brown.color;

  if (getLuminance(baseColor) > 0.86 && borderColor !== "white") {
    return borderColor;
  }

  return baseColor;
};

export const createChatCustomKey = (colorKey, customColor = "#92715c") => {
  if (colorKey === CUSTOM_MARKER_COLOR_KEY) {
    return `${CUSTOM_MARKER_COLOR_KEY}_${normalizeCustomColor(customColor).replace("#", "")}`;
  }

  return MARKER_COLORS[colorKey] ? colorKey : "brown";
};

export const getChatColorStyleByCustom = (chatCustom = "brown") => {
  const normalizedKey = chatCustom || "brown";
  const parts = normalizedKey.split("_");
  const colorKey =
    parts[0] === CUSTOM_MARKER_COLOR_KEY || parts[1] === CUSTOM_MARKER_COLOR_KEY
      ? CUSTOM_MARKER_COLOR_KEY
      : MARKER_COLORS[normalizedKey]
        ? normalizedKey
        : MARKER_COLORS[parts[1]]
          ? parts[1]
          : normalizedKey;

  if (colorKey === CUSTOM_MARKER_COLOR_KEY) {
    const customHex =
      parts[0] === CUSTOM_MARKER_COLOR_KEY ? parts[1] : parts[2];
    const customColor = normalizeCustomColor(customHex || "#92715c");

    return {
      id: createChatCustomKey(CUSTOM_MARKER_COLOR_KEY, customColor),
      name: "사용자 지정",
      color: customColor,
      borderColor: "white",
      innerColor: "white",
      colorKey: CUSTOM_MARKER_COLOR_KEY,
      customColor,
    };
  }

  const color = MARKER_COLORS[colorKey] || MARKER_COLORS.brown;

  return {
    id: color.id,
    name: color.name,
    color: color.color,
    borderColor: color.borderColor,
    innerColor: color.innerColor,
    colorKey: color.id,
    customColor: "#92715c",
  };
};

export const DEFAULT_BOX_CUSTOM = "box_brown";

const LEGACY_BOX_STYLES = {
  default: DEFAULT_BOX_CUSTOM,
  box_default: DEFAULT_BOX_CUSTOM,
  box_gold: "box_amber",
  box_gray: "box_slate",
};

export const createBoxCustomKey = (colorKey, customColor = "#92715c") => {
  if (colorKey === CUSTOM_MARKER_COLOR_KEY) {
    return `box_${CUSTOM_MARKER_COLOR_KEY}_${normalizeCustomColor(customColor).replace("#", "")}`;
  }

  return MARKER_COLORS[colorKey] ? `box_${colorKey}` : DEFAULT_BOX_CUSTOM;
};

export const parseBoxCustomKey = (boxCustom = DEFAULT_BOX_CUSTOM) => {
  const safeBoxCustom =
    typeof boxCustom === "string" && boxCustom.trim()
      ? boxCustom.trim()
      : DEFAULT_BOX_CUSTOM;
  const normalizedKey = LEGACY_BOX_STYLES[safeBoxCustom] || safeBoxCustom;
  const parts = normalizedKey.split("_");
  const customIndex = parts.indexOf(CUSTOM_MARKER_COLOR_KEY);

  if (customIndex >= 0) {
    return {
      colorKey: CUSTOM_MARKER_COLOR_KEY,
      customColor: normalizeCustomColor(parts[customIndex + 1] || "#92715c"),
    };
  }

  if (parts[0] === "box" && MARKER_COLORS[parts[1]]) {
    return {
      colorKey: parts[1],
      customColor: "#92715c",
    };
  }

  if (MARKER_COLORS[normalizedKey]) {
    return {
      colorKey: normalizedKey,
      customColor: "#92715c",
    };
  }

  if (MARKER_COLORS[parts[1]]) {
    return {
      colorKey: parts[1],
      customColor: "#92715c",
    };
  }

  return {
    colorKey: "brown",
    customColor: "#92715c",
  };
};

export const getBoxStyleByCustom = (boxCustom = DEFAULT_BOX_CUSTOM) => {
  const { colorKey, customColor } = parseBoxCustomKey(boxCustom);
  const colorStyle =
    colorKey === CUSTOM_MARKER_COLOR_KEY
      ? {
          id: CUSTOM_MARKER_COLOR_KEY,
          name: "사용자 지정",
          color: customColor,
          borderColor: "white",
          innerColor: "white",
        }
      : MARKER_COLORS[colorKey] || MARKER_COLORS.brown;
  const accentColor = getBoxAccentColor(colorStyle);
  const accentHoverColor = mixHexColors(accentColor, "#000000", 0.18);
  const usesLightLikeButton =
    colorKey === "cream" || colorKey === "whiteBrown";
  const likeBackgroundColor = usesLightLikeButton
    ? colorStyle.color
    : accentColor;
  const likeBackgroundHoverColor = usesLightLikeButton
    ? mixHexColors(colorStyle.color, "#000000", 0.08)
    : accentHoverColor;
  const likeHeartColor = usesLightLikeButton ? accentColor : "#ffffff";

  return {
    id: createBoxCustomKey(colorKey, customColor),
    name: colorStyle.name,
    colorKey,
    customColor,
    accentColor,
    accentHoverColor,
    backgroundColor: mixHexColors(accentColor, "#ffffff", 0.9),
    borderColor: mixHexColors(accentColor, "#ffffff", 0.52),
    sliderTrackColor: mixHexColors(accentColor, "#ffffff", 0.78),
    mutedTextColor: getLuminance(accentColor) > 0.62 ? "#4b3528" : "#374151",
    buttonTextColor: "#ffffff",
    likeBackgroundColor,
    likeBackgroundHoverColor,
    likeOffColor: likeHeartColor,
    likeOnColor: likeHeartColor,
  };
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
  const safeMarkerCustom =
    typeof markerCustom === "string" && markerCustom.trim()
      ? markerCustom.trim()
      : "pin_brown";
  const normalizedKey =
    LEGACY_MARKER_STYLES[safeMarkerCustom] || safeMarkerCustom;
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

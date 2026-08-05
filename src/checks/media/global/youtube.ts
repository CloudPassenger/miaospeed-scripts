import { C_FAIL, C_UNK, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_UNK, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: youtube
// @name: YouTube
// @description: 检测 YouTube Premium 在当前地区是否可用
// @category: media
// @regions: global
// @tags: stream, video
// @priority: 4

// 参考 clash-verge-rev 的 media-unlock crate 实现：
// https://github.com/clash-verge-rev/clash-verge-rev/blob/main/crates/clash-verge-media-unlock/src/youtube.rs
// 采用多正则依次尝试提取地区，且不依赖固定过期 Cookie
const REGION_PATTERNS = [
  /id=["']country-code["'][^>]*>\s*([A-Za-z]{2,3})\s*</,
  /"GL"\s*:\s*"([A-Za-z]{2})"/,
  /"countryCode"\s*:\s*"([A-Za-z]{2})"/,
  /"country_code"\s*:\s*"([A-Za-z]{2})"/,
];

function extractRegion(body: string): string {
  for (var i = 0; i < REGION_PATTERNS.length; i++) {
    const match = body.match(REGION_PATTERNS[i]);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
  }
  return "";
}

function handler(): HandlerResult {
  const response = fetch("https://www.youtube.com/premium?hl=en", {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const body = response.body || "";
  const bodyLower = body.toLowerCase();

  if (bodyLower.indexOf("www.google.cn") > -1) {
    return {
      text: `${T_FAIL}(CN)`,
      background: C_FAIL,
    };
  }

  const region = extractRegion(body);

  if (
    bodyLower.indexOf("youtube premium is not available in your country") > -1 ||
    bodyLower.indexOf("premium is not available in your country") > -1 ||
    bodyLower.indexOf("premium is not available in your region") > -1
  ) {
    return {
      text: `${T_FAIL}${region ? `(${region})` : ""}`,
      background: C_FAIL,
    };
  }

  if (
    response.statusCode === 200 &&
    (bodyLower.indexOf("youtube premium") > -1 ||
      bodyLower.indexOf("ad-free") > -1 ||
      bodyLower.indexOf('"browseid":"spunlimited"') > -1)
  ) {
    return {
      text: `${T_UNL}${region ? `(${region})` : ""}`,
      background: C_UNL,
    };
  }

  return {
    text: T_UNK,
    background: C_UNK,
  };
}

export default handler;

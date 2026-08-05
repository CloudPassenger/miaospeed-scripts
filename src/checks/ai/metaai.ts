// @id: metaai
// @name: Meta.AI
// @description: 检测 Meta AI 在当前地区是否可用
// @category: ai
// @regions: global
// @tags: ai
// @priority: 9

import { C_FAIL, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/lib/constants/text";
import { SEC_CH_UA, UA_WINDOWS } from "@/lib/constants/ua";

const headers = {
  Accept: "*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-CH-UA": SEC_CH_UA,
  "Sec-CH-UA-Mobile": "?0",
  "Sec-CH-UA-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": UA_WINDOWS,
};

/** 从 "code":"xx_YY" 或 "code":"xx" 中提取地区代码 */
function extractRegionFromCode(body: string): string {
  const match = body.match(/"code"\s*:\s*"([^"]*)"/);
  const code = match ? match[1] : "";
  if (!code) return "";
  if (code.indexOf("_") > -1) {
    const parts = code.split("_");
    return parts.length >= 2 ? parts[1] : "";
  }
  if (code.length < 10) return code;
  return "";
}

/** 从跳转后的 /legal/ 页面路径中提取地区代码，如 /us/legal/ */
function extractRegionFromPath(path: string): string {
  const match = path.match(/^\/([a-zA-Z]{2})\/legal/);
  return match ? match[1].toUpperCase() : "";
}

function handler(): HandlerResult {
  const ajaxResponse = fetch("https://www.meta.ai/ajax", {
    method: "GET",
    headers,
    noRedir: false,
    retry: 3,
    timeout: 5000,
  });

  if (!ajaxResponse) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  if (ajaxResponse.statusCode === 200) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  if (ajaxResponse.statusCode === 400 || ajaxResponse.statusCode === 404) {
    let region = "";
    const legalResponse = fetch("https://www.meta.com/legal/", {
      method: "GET",
      headers,
      noRedir: false,
      retry: 2,
      timeout: 5000,
    });
    if (legalResponse) {
      const path = legalResponse.url.replace(/^https?:\/\/[^/]+/, "");
      region = extractRegionFromPath(path);
    }
    return {
      text: region ? `${T_UNL}(${region})` : T_UNL,
      background: C_UNL,
    };
  }

  const fallbackResponse = fetch("https://www.meta.ai/", {
    method: "GET",
    headers,
    noRedir: false,
    retry: 3,
    timeout: 5000,
  });

  if (!fallbackResponse) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  if (ajaxResponse.statusCode === 403) {
    let region = "";
    if (fallbackResponse.statusCode === 200) {
      region = extractRegionFromCode(fallbackResponse.body);
    }
    return {
      text: region ? `${T_UNL}(${region})` : T_UNL,
      background: C_UNL,
    };
  }

  const body = fallbackResponse.body || "";

  if (body.indexOf("GeoBlockedErrorRoot") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  if (
    body.indexOf("AbraHomeRoot.react") > -1 ||
    body.indexOf("AbraHomeRootConversationQuery") > -1 ||
    body.indexOf("HomeRootQuery") > -1 ||
    body.indexOf("AbraRateLimitedErrorRoot") > -1 ||
    body.indexOf("KadabraRootContainer") > -1
  ) {
    const region = extractRegionFromCode(body);
    return {
      text: region ? `${T_UNL}(${region})` : T_UNL,
      background: C_UNL,
    };
  }

  if (fallbackResponse.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  return {
    text: T_FAIL,
    background: C_FAIL,
  };
}

export default handler;

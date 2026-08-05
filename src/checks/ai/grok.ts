// @id: grok
// @name: Grok
// @description: 检测 xAI Grok 在当前地区是否可用
// @category: ai
// @regions: global
// @tags: ai
// @priority: 8

import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/lib/constants/colors";
import { T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL, S_WARN } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Grok.go
const GROK_RESTRICTED_COUNTRY = ["CN", "RU", "IR", "KP", "CU", "SY"];

function handler(): HandlerResult {
  const trace = fetch("https://grok.com/cdn-cgi/trace", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });
  if (!trace || trace.statusCode !== 200) {
    return {
      text: T_NA,
      background: C_NA,
      status: S_NA,
    };
  }
  const match = trace.body.match(/loc=([A-Z]{2})/);
  const loc = match ? match[1] : "";

  const response = fetch("https://grok.com/", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });
  if (!response) {
    return {
      text: T_NA,
      background: C_NA,
      status: S_NA,
    };
  }

  if (response.statusCode === 200) {
    return {
      text: `${T_UNL}${loc ? `(${loc})` : ""}`,
      background: C_UNL,
      status: S_UNL,
      region: loc,
    };
  }
  if (response.statusCode === 403) {
    if (loc && GROK_RESTRICTED_COUNTRY.indexOf(loc) === -1) {
      return {
        text: `${T_FAIL}(WAF)`,
        background: C_WARN,
        status: S_WARN,
        region: loc,
      };
    }
    return {
      text: `${T_FAIL}${loc ? `(${loc})` : ""}`,
      background: C_FAIL,
      status: S_FAIL,
      region: loc,
    };
  }
  return {
    text: T_NA,
    background: C_NA,
    status: S_NA,
  };
}

export default handler;

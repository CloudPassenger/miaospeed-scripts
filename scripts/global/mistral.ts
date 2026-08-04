import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Mistral AI
// @description: 检测 Mistral AI 在当前地区是否可用
// @regions: global
// @tags: ai
// @priority: 8

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Mistral.go
const MISTRAL_RESTRICTED_COUNTRY = ["RU", "BY", "KP", "IR", "SY", "CU", "CN", "TM"];

function handler(): HandlerResult {
  const trace = fetch("https://chat.mistral.ai/cdn-cgi/trace", {
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
    };
  }
  const match = trace.body.match(/loc=([A-Z]{2})/);
  const loc = match ? match[1] : "";

  const response = fetch("https://chat.mistral.ai/", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: true,
    retry: 3,
    timeout: 5000,
  });
  if (!response) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }

  if (response.statusCode === 403) {
    return {
      text: `${T_FAIL}${loc ? `(${loc})` : ""}`,
      background: C_FAIL,
    };
  }

  if ([200, 307, 308].indexOf(response.statusCode) > -1) {
    if (!loc || MISTRAL_RESTRICTED_COUNTRY.indexOf(loc) === -1) {
      return {
        text: `${T_UNL}${loc ? `(${loc})` : ""}`,
        background: C_UNL,
      };
    }
    return {
      text: `${T_FAIL}(${loc})`,
      background: C_FAIL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

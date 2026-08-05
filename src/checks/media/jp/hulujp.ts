// @id: hulujp
// @name: Hulu Japan
// @description: 检测 Hulu 日本站 解锁状态
// @category: media
// @regions: jp
// @tags: stream, video
// @priority: 41

import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_ANDROID } from "@/lib/constants/ua";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Hulu.go
function handler(): HandlerResult {
  const response = fetch("https://id.hulu.jp/", {
    headers: {
      "User-Agent": UA_ANDROID,
    },
    noRedir: true,
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  if (response.headers["location"] && response.headers["location"].indexOf("restrict.html") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  if (response.statusCode === 403) {
    return {
      text: `${T_FAIL}(WAF)`,
      background: C_WARN,
    };
  }
  if (response.statusCode === 302) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

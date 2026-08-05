// @id: amediateka
// @name: Amediateka
// @description: 检测 Amediateka 解锁状态
// @category: media
// @regions: ru
// @tags: stream, video
// @priority: 45

import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL, S_WARN } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Amediateka.go
function handler(): HandlerResult {
  const response = fetch("https://www.amediateka.ru/", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: true,
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_NETWORK,
    };
  }

  if (response.statusCode === 301 || response.statusCode === 302) {
    if (
      response.headers["location"] ===
      "https://www.amediateka.ru/unavailable/index.html?page=https://www.amediateka.ru/"
    ) {
      return {
        text: T_FAIL,
        background: C_FAIL,
        status: S_FAIL,
      };
    }
    return {
      text: T_NA,
      background: C_NA,
      status: S_NA,
    };
  }
  if (response.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
      status: S_UNL,
    };
  }
  if (response.statusCode === 503 || response.statusCode === 445) {
    return {
      text: `${T_FAIL}(WAF)`,
      background: C_WARN,
      status: S_WARN,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
    status: S_NA,
  };
}

export default handler;

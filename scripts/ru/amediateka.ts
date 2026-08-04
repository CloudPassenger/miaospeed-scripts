import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Amediateka
// @description: 检测 Amediateka 解锁状态
// @regions: ru
// @tags: stream, video
// @priority: 45

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
      };
    }
    return {
      text: T_NA,
      background: C_NA,
    };
  }
  if (response.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (response.statusCode === 503 || response.statusCode === 445) {
    return {
      text: `${T_FAIL}(WAF)`,
      background: C_WARN,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

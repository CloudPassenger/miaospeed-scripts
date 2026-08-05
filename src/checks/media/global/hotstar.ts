// @id: hotstar
// @name: Hotstar
// @description: 检测 Disney+ Hotstar 在当前地区是否可用
// @category: media
// @regions: global
// @tags: stream, video
// @priority: 40

import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/HotStar.go
function handler(): HandlerResult {
  const response = fetch("https://api.hotstar.com/o/v1/page/1557?offset=0&size=20&tao=0&tas=20", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  if (response.statusCode === 475) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (response.statusCode === 472 || response.statusCode === 473 || response.statusCode === 474) {
    return {
      text: `${T_FAIL}(WAF)`,
      background: C_WARN,
    };
  }

  if (response.statusCode === 401) {
    const resp2 = fetch("https://www.hotstar.com", {
      headers: {
        "User-Agent": UA_WINDOWS,
      },
      noRedir: true,
      retry: 3,
      timeout: 5000,
    });
    if (!resp2) {
      return {
        text: `${T_FAIL}(${M_NETWORK})`,
        background: C_FAIL,
      };
    }
    if (resp2.statusCode === 301) {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    }
    const location = resp2.headers["location"] || "";
    const parts = location.split("/");
    const region = parts.length > 3 ? parts[3] : "";
    if (region) {
      return {
        text: `${T_UNL}(${region})`,
        background: C_UNL,
      };
    }
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

export default handler;

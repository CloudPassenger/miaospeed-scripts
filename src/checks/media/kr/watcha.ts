// @id: watcha
// @name: Watcha
// @description: 检测 Watcha 解锁状态
// @category: media
// @regions: kr
// @tags: stream, video
// @priority: 41

import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL, S_WARN } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Watcha.go
function handler(): HandlerResult {
  const pre = fetch("https://watcha.com/api/aio_browses/tvod/all?size=3", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });
  if (!pre) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_NETWORK,
    };
  }
  if (pre.statusCode === 451) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }

  const response = fetch("https://watcha.com/browse/theater", {
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

  if (response.statusCode === 451) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }
  if (response.statusCode === 403) {
    return {
      text: `${T_FAIL}(WAF)`,
      background: C_WARN,
      status: S_WARN,
    };
  }
  if (response.statusCode === 200) {
    return {
      text: `${T_UNL}(KR)`,
      background: C_UNL,
      status: S_UNL,
    };
  }
  if (response.statusCode === 302) {
    const location = response.headers["location"] || "";
    if (location === "/ja-JP/browse/theater") {
      return {
        text: `${T_UNL}(JP)`,
        background: C_UNL,
        status: S_UNL,
      };
    }
    if (location === "/ko-KR/browse/theater") {
      return {
        text: `${T_UNL}(KR)`,
        background: C_UNL,
        status: S_UNL,
      };
    }
  }

  return {
    text: T_NA,
    background: C_NA,
    status: S_NA,
  };
}

export default handler;

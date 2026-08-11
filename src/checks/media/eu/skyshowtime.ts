// @id: skyshowtime
// @name: SkyShowtime
// @description: 检测 SkyShowtime 解锁状态
// @category: media
// @regions: eu
// @tags: stream, video
// @priority: 45

import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL, S_WARN } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/SkyShowTime.go
function handler(): HandlerResult {
  const response = fetch("https://www.skyshowtime.com/", {
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

  if (response.statusCode === 403) {
    return { text: `${T_FAIL}(WAF)`, background: C_WARN, status: S_WARN, statusReason: "waf_blocked" };
  }

  if (response.statusCode === 307) {
    const location = response.headers["location"] || "";
    if (location === "https://www.skyshowtime.com/where-can-i-stream") {
      return {
        text: T_FAIL,
        background: C_FAIL,
        status: S_FAIL,
      };
    }
    const match = location.match(/^https:\/\/www\.skyshowtime\.com\/([a-z]{2})\?/);
    if (match) {
      return {
        text: `${T_UNL}(${match[1]})`,
        background: C_UNL,
        status: S_UNL,
        region: match[1],
      };
    }
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

export default handler;

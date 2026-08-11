// @id: raiplay
// @name: RaiPlay
// @description: 检测 RaiPlay 解锁状态
// @category: media
// @regions: it
// @tags: stream, video
// @priority: 45

import { C_FAIL, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_UNL, S_WARN } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/RaiPlay.go
function handler(): HandlerResult {
  const response = fetch(
    "https://mediapolisvod.rai.it/relinker/relinkerServlet.htm?cont=VxXwi7UcqjApssSlashbjsAghviAeeqqEEqualeeqqEEqual&output=64",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
      },
      retry: 3,
      timeout: 5000,
    },
  );

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

  if (response.body.indexOf("no_available") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }
  if (response.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
      status: S_UNL,
    };
  }

  return {
    text: T_FAIL,
    background: C_FAIL,
    status: S_FAIL,
  };
}

export default handler;

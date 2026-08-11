// @id: mxplayer
// @name: MX Player
// @description: 检测 MX Player 解锁状态
// @category: media
// @regions: in
// @tags: stream, video
// @priority: 45

import { C_FAIL, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_UNL, S_WARN } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/MXPlayer.go
function handler(): HandlerResult {
  const response = fetch("https://www.mxplayer.in/", {
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
      status: S_FAIL,
      error: M_NETWORK,
    };
  }

  if (response.statusCode === 403) {
    return { text: `${T_FAIL}(WAF)`, background: C_WARN, status: S_WARN, statusReason: "waf_blocked" };
  }

  if (response.statusCode === 200) {
    if (response.body.indexOf("We are currently not available in your region") > -1) {
      return {
        text: T_FAIL,
        background: C_FAIL,
        status: S_FAIL,
      };
    }
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

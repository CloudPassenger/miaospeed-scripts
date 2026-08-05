// @id: threenow
// @name: ThreeNow
// @description: 检测 ThreeNow 解锁状态
// @category: media
// @regions: nz
// @tags: stream, video, live
// @priority: 45

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL } from "@/lib/constants/status";

// https://github.com/oneclickvirt/UnlockTests/blob/main/nz/ThreeNow.go
function handler(): HandlerResult {
  const response = fetch("https://bravo-livestream.fullscreen.nz/index.m3u8", {
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

  if (response.body.indexOf("Access Denied") > -1 || response.statusCode === 403 || response.statusCode === 451) {
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
    text: T_NA,
    background: C_NA,
    status: S_NA,
  };
}

export default handler;

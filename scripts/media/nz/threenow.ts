import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: threenow
// @name: ThreeNow
// @description: 检测 ThreeNow 解锁状态
// @category: media
// @regions: nz
// @tags: stream, video, live
// @priority: 45

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
    };
  }

  if (
    response.body.indexOf("Access Denied") > -1 ||
    response.statusCode === 403 ||
    response.statusCode === 451
  ) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (response.statusCode === 200) {
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

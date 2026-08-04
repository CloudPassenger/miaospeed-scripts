import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Galaxy Play
// @description: 检测 Galaxy Play 解锁状态
// @regions: vn
// @tags: stream, video
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/vn/GalaxyPlay.go
function handler(): HandlerResult {
  const response = fetch("https://api.glxplay.io/account/device/new", {
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

  if (response.statusCode === 404) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  if (response.statusCode === 400) {
    if (
      response.body.indexOf("<") === 0 ||
      response.body.indexOf('"errorCode": 495') > -1 ||
      response.body.indexOf("not available in your region") > -1
    ) {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    }
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

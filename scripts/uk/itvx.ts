import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: ITVX
// @description: 检测 ITVX(ITV Hub) 解锁状态
// @regions: uk
// @tags: stream, video, live
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/uk/ITVX.go
function handler(): HandlerResult {
  const response = fetch("https://simulcast.itv.com/playlist/itvonline/ITV", {
    headers: {
      "User-Agent": UA_WINDOWS,
      "x-custom-headers": "true",
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

  if (response.statusCode === 403) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (response.statusCode === 404) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (response.body.indexOf("Outside Of Allowed Geographic Region") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (response.body.indexOf("Playlist") > -1) {
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

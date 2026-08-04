import { C_FAIL, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: BritBox UK
// @description: 检测 BritBox 英国站解锁状态
// @regions: uk
// @tags: stream, video
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/uk/BritBox.go
function handler(): HandlerResult {
  const response = fetch("https://www.britbox.com/", {
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
    response.statusCode === 403 ||
    response.statusCode === 451 ||
    response.body.indexOf("locationnotsupported") > -1 ||
    response.body.indexOf("locationnotvalidated") > -1
  ) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  return {
    text: T_UNL,
    background: C_UNL,
  };
}

export default handler;

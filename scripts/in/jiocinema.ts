import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: JioCinema
// @description: 检测 JioCinema 解锁状态
// @regions: in
// @tags: stream, video
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/JioCinema.go
function handler(): HandlerResult {
  const response = fetch("https://content-jiovoot.voot.com/psapi/", {
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

  if (response.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (response.statusCode === 474) {
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

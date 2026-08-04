import { C_FAIL, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: J:COM On Demand
// @description: 检测 J:COM オンデマンド 解锁状态
// @regions: jp
// @tags: stream, video
// @priority: 41

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/J_COM_ON_DEMAND.go
function handler(): HandlerResult {
  const response = fetch("https://linkvod.myjcom.jp/auth/login", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  if (response.statusCode === 403 || response.statusCode === 502) {
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

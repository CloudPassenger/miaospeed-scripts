// @id: kancolle
// @name: 舰队Collection
// @description: 检测 舰队Collection(艦これ) 解锁状态
// @category: games
// @regions: jp
// @tags: stream, game
// @priority: 45

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { S_FAIL, S_NA, S_UNL } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Kancolle.go
const UA_DALVIK = "Dalvik/2.1.0 (Linux; U; Android 14; M2006J10C Build/RP1A.200720.011)";

function handler(): HandlerResult {
  const response = fetch("https://w00g.kancolle-server.com/kcscontents/news/", {
    headers: {
      "User-Agent": UA_DALVIK,
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

  if (response.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
      status: S_UNL,
    };
  }
  if (response.statusCode === 403 || response.statusCode === 302) {
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

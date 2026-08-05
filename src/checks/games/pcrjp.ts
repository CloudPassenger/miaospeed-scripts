import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";

// @id: pcrjp
// @name: 公主连结Re:Dive
// @description: 检测 プリンセスコネクト!Re:Dive 日服解锁状态
// @category: games
// @regions: jp
// @tags: game
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/PCRJP.go
const UA_DALVIK = "Dalvik/2.1.0 (Linux; U; Android 14; M2006J10C Build/RP1A.200720.011)";

function handler(): HandlerResult {
  const response = fetch("https://api-priconne-redive.cygames.jp/", {
    headers: {
      "User-Agent": UA_DALVIK,
    },
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
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
  if (response.statusCode === 403) {
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

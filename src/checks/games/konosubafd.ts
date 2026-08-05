// @id: konosubafd
// @name: 为美好的世界献上祝福 Fantastic Days
// @description: 检测 このすば ファンタスティックデイズ 日服解锁状态
// @category: games
// @regions: jp
// @tags: game
// @priority: 45

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/KonosubaFD.go
function handler(): HandlerResult {
  const response = fetch("https://api.konosubafd.jp/api/masterlist", {
    method: "POST",
    headers: {
      "User-Agent": "pj0007/212 CFNetwork/1240.0.4 Darwin/20.6.0",
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

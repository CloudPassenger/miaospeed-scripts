// @id: animefesta
// @name: AnimeFesta
// @description: 检测 AnimeFesta(アニメフェスタ) 解锁状态
// @category: media
// @regions: jp
// @tags: stream, video, anime
// @priority: 45

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/AnimeFesta.go
function handler(): HandlerResult {
  const response = fetch("https://api-animefesta.iowl.jp/v1/titles/1560", {
    headers: {
      "User-Agent": UA_WINDOWS,
      Accept: "application/json",
      Origin: "https://animefesta.iowl.jp",
      Referer: "https://animefesta.iowl.jp/",
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

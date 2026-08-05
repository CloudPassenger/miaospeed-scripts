// @id: erogamescape
// @name: ErogameScape
// @description: 检测 ErogameScape(エロゲー批評空間) 年龄验证解锁状态
// @category: media
// @regions: jp
// @tags: stream
// @priority: 45

import { C_FAIL, C_UNL } from "@/lib/constants/colors";
import { T_FAIL, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_UNL } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/ErogameScape.go
function handler(): HandlerResult {
  const response = fetch("https://erogamescape.org/~ap2/ero/toukei_kaiseki/", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }

  if (response.statusCode === 200 && response.body.indexOf("18歳") > -1) {
    return {
      text: T_UNL,
      background: C_UNL,
      status: S_UNL,
    };
  }

  return {
    text: T_FAIL,
    background: C_FAIL,
    status: S_FAIL,
  };
}

export default handler;

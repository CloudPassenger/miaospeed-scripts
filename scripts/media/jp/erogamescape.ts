import { C_FAIL, C_UNL } from "@/consts/colors";
import { T_FAIL, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: erogamescape
// @name: ErogameScape
// @description: 检测 ErogameScape(エロゲー批評空間) 年龄验证解锁状态
// @category: media
// @regions: jp
// @tags: stream
// @priority: 45

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
    };
  }

  if (response.statusCode === 200 && response.body.indexOf("18歳") > -1) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  return {
    text: T_FAIL,
    background: C_FAIL,
  };
}

export default handler;

import { C_FAIL, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: peacocktv
// @name: Peacock TV
// @description: 检测 Peacock TV 解锁状态
// @category: media
// @regions: us
// @tags: stream, video
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/PeacockTV.go
function handler(): HandlerResult {
  const response = fetch("https://www.peacocktv.com/", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: true,
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const location = response.headers["location"] || "";
  if (location.indexOf("unavailable") > -1) {
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

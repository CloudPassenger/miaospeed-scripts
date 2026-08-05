// @id: zee5
// @name: Zee5
// @description: 检测 Zee5 在当前地区是否可用
// @category: media
// @regions: global
// @tags: stream, video
// @priority: 45

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Zee5.go
function handler(): HandlerResult {
  const response = fetch("https://www.zee5.com/global", {
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

  if (response.statusCode === 403) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const setCookie = response.headers["set-cookie"] || "";
  const match = setCookie.match(/country=([A-Z]{2})/);

  if (match) {
    return {
      text: `${T_UNL}(${match[1]})`,
      background: C_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

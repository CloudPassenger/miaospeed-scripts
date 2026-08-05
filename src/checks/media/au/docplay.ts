// @id: docplay
// @name: DocPlay
// @description: 检测 DocPlay 解锁状态
// @category: media
// @regions: au
// @tags: stream, video
// @priority: 45

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/DocPlay.go
function handler(): HandlerResult {
  const response = fetch("https://www.docplay.com/subscribe", {
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

  if (response.body.indexOf("DocPlay hasn't launched in your part of the world yet.") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  if (response.statusCode === 307) {
    const location = response.headers["location"] || "";
    if (location.indexOf("geoblocked") > -1) {
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
  if (response.statusCode === 303 || response.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

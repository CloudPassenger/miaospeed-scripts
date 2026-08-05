// @id: tntsports
// @name: TNT Sports
// @description: 检测 TNT Sports 解锁状态
// @category: media
// @regions: eu
// @tags: stream, live
// @priority: 45

import { C_FAIL, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/TNTSports.go
function handler(): HandlerResult {
  const response = fetch("https://www.tntsports.co.uk/", {
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

  if (response.statusCode === 403) {
    return {
      text: `${T_FAIL}(WAF)`,
      background: C_WARN,
    };
  }

  if (response.statusCode === 307 && response.headers["location"] === "https://www.tntsports.co.uk/geoblocking.shtml") {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  if (response.statusCode === 200) {
    const match = response.body.match(/\\"countryCode\\":\\"([A-Z]{2})\\"/);
    if (match) {
      return {
        text: `${T_UNL}(${match[1].toLowerCase()})`,
        background: C_UNL,
      };
    }
  }

  return {
    text: T_FAIL,
    background: C_FAIL,
  };
}

export default handler;

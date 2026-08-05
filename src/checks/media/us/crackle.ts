// @id: crackle
// @name: Crackle
// @description: 检测 Crackle 解锁状态
// @category: media
// @regions: us
// @tags: stream, video
// @priority: 45

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Crackle.go
function handler(): HandlerResult {
  const response = fetch("https://prod-api.crackle.com/appconfig", {
    headers: {
      "User-Agent": UA_WINDOWS,
      Origin: "https://www.crackle.com",
      Referer: "https://www.crackle.com/",
      "x-crackle-apiversion": "v2.0.0",
      "x-crackle-brand": "crackle",
      "x-crackle-platform": "5FE67CCA-069A-42C6-A20F-4B47A8054D46",
    },
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

  const region = response.headers["x-crackle-region"] || "";

  if (region === "US") {
    return {
      text: T_UNL,
      background: C_UNL,
      status: S_UNL,
      region,
    };
  }
  if (region) {
    return {
      text: `${T_FAIL}(${region})`,
      background: C_FAIL,
      status: S_FAIL,
      region,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
    status: S_NA,
  };
}

export default handler;

import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: crackle
// @name: Crackle
// @description: 检测 Crackle 解锁状态
// @category: media
// @regions: us
// @tags: stream, video
// @priority: 45

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
    };
  }

  const region = response.headers["x-crackle-region"] || "";

  if (region === "US") {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (region) {
    return {
      text: `${T_FAIL}(${region})`,
      background: C_FAIL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

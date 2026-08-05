import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: mathsspot
// @name: MathsSpot Roblox
// @description: 检测 Roblox MathsSpot 解锁状态
// @category: games
// @regions: eu
// @tags: game
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/eu/MathsSpot.go
function handler(): HandlerResult {
  const response = fetch("https://mathsspot.com/", {
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

  if (response.body.indexOf("FailureServiceNotInRegion") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const match = response.body.match(/"countryCode"\s*:\s*"([^"]+)"/);
  if (match) {
    return {
      text: `${T_UNL}(${match[1].toLowerCase()})`,
      background: C_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

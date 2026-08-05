// @id: mathsspot
// @name: MathsSpot Roblox
// @description: 检测 Roblox MathsSpot 解锁状态
// @category: games
// @regions: eu
// @tags: game
// @priority: 45

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL } from "@/lib/constants/status";

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
      status: S_FAIL,
      error: M_NETWORK,
    };
  }

  if (response.body.indexOf("FailureServiceNotInRegion") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }

  const match = response.body.match(/"countryCode"\s*:\s*"([^"]+)"/);
  if (match) {
    return {
      text: `${T_UNL}(${match[1].toLowerCase()})`,
      background: C_UNL,
      status: S_UNL,
      region: match[1],
    };
  }

  return {
    text: T_NA,
    background: C_NA,
    status: S_NA,
  };
}

export default handler;

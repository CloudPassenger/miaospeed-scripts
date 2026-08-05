// @id: cbcgem
// @name: CBC Gem
// @description: 检测 CBC Gem 解锁状态
// @category: media
// @regions: ca
// @tags: stream, video
// @priority: 45

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL } from "@/lib/constants/status";

// https://github.com/oneclickvirt/UnlockTests/blob/main/ca/CBCGem.go
function handler(): HandlerResult {
  const response = fetch("https://www.cbc.ca/g/stats/js/cbc-stats-top.js", {
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

  if (response.body.indexOf('country":"CA"') > -1) {
    return {
      text: `${T_UNL}(CA)`,
      background: C_UNL,
      status: S_UNL,
    };
  }
  if (response.statusCode === 200) {
    return {
      text: `${T_UNL}(全球)`,
      background: C_UNL,
      status: S_UNL,
    };
  }
  if (response.statusCode === 451) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
    status: S_NA,
  };
}

export default handler;

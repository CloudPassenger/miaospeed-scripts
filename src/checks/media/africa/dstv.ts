// @id: dstv
// @name: DSTV
// @description: 检测 DSTV Now 解锁状态
// @category: media
// @regions: africa
// @tags: stream, video, live
// @priority: 45

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// https://github.com/oneclickvirt/UnlockTests/blob/main/africa/DSTV.go
function handler(): HandlerResult {
  const resp1 = fetch("https://now.dstv.com/", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });

  if (resp1) {
    if (resp1.statusCode === 451 || resp1.statusCode === 403) {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    }
    if (resp1.statusCode === 200 || resp1.statusCode === 404) {
      return {
        text: T_UNL,
        background: C_UNL,
      };
    }
  }

  const resp2 = fetch("https://authentication.dstv.com/favicon.ico", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });

  if (!resp2) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  if (resp2.statusCode === 403 || resp2.statusCode === 451) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (resp2.statusCode === 404) {
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

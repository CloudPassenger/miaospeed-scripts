// @id: amcplus
// @name: AMC+
// @description: 检测 AMC+ 解锁状态
// @category: media
// @regions: us
// @tags: stream, video
// @priority: 45

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/AMCPlus.go
function handler(): HandlerResult {
  const resp1 = fetch("https://www.amcplus.com/", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: true,
    retry: 3,
    timeout: 5000,
  });

  if (!resp1) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_NETWORK,
    };
  }

  if (resp1.statusCode === 302) {
    const location1 = resp1.headers["location"] || "";
    const resp2 = fetch(location1, {
      headers: {
        "User-Agent": UA_WINDOWS,
      },
      noRedir: true,
      retry: 3,
      timeout: 5000,
    });
    if (!resp2) {
      return {
        text: `${T_FAIL}(${M_NETWORK})`,
        background: C_FAIL,
        status: S_FAIL,
        error: M_NETWORK,
      };
    }
    if (resp2.statusCode === 301) {
      const location2 = resp2.headers["location"] || "";
      if (location2 === "https://www.amcplus.com/pages/geographic-restriction") {
        return {
          text: T_FAIL,
          background: C_FAIL,
          status: S_FAIL,
        };
      }
      const match = location1.match(/^https:\/\/www\.amcplus\.com\/countries\/(\w{2})/);
      const region = match ? match[1] : "";
      return {
        text: `${T_UNL}${region ? `(${region})` : ""}`,
        background: C_UNL,
        status: S_UNL,
        region,
      };
    }
    return {
      text: T_NA,
      background: C_NA,
      status: S_NA,
    };
  }

  if (resp1.statusCode === 200) {
    return {
      text: `${T_UNL}(US)`,
      background: C_UNL,
      status: S_UNL,
    };
  }
  if (resp1.statusCode === 403) {
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

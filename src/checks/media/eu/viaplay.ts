import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: viaplay
// @name: Viaplay
// @description: 检测 Viaplay 解锁状态
// @category: media
// @regions: eu
// @tags: stream, video
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Viaplay.go
function handler(): HandlerResult {
  const resp1 = fetch("https://viaplay.pl", {
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
    };
  }

  if (resp1.statusCode === 403) {
    return {
      text: `${T_FAIL}(WAF)`,
      background: C_WARN,
    };
  }

  const location1 = resp1.headers["location"] || "";
  if (resp1.statusCode === 302 && location1 === "/region-blocked") {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  if (resp1.statusCode === 302 && location1 === "https://viaplay.pl/pl-pl/") {
    const resp2 = fetch("https://viaplay.com/", {
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
      };
    }
    if (resp2.statusCode === 404) {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    }
    if (resp2.statusCode === 302) {
      const location2 = resp2.headers["location"] || "";
      const match1 = location2.match(/\/([a-z]{2})\//);
      if (match1) {
        return {
          text: `${T_UNL}(${match1[1]})`,
          background: C_UNL,
        };
      }
      const match2 = location2.match(/viaplay\.([a-z]{2})/);
      if (match2) {
        return {
          text: `${T_UNL}(${match2[1]})`,
          background: C_UNL,
        };
      }
    }
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

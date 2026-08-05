import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: amcplus
// @name: AMC+
// @description: 检测 AMC+ 解锁状态
// @category: media
// @regions: us
// @tags: stream, video
// @priority: 45

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
      };
    }
    if (resp2.statusCode === 301) {
      const location2 = resp2.headers["location"] || "";
      if (location2 === "https://www.amcplus.com/pages/geographic-restriction") {
        return {
          text: T_FAIL,
          background: C_FAIL,
        };
      }
      const match = location1.match(
        /^https:\/\/www\.amcplus\.com\/countries\/(\w{2})/
      );
      const region = match ? match[1] : "";
      return {
        text: `${T_UNL}${region ? `(${region})` : ""}`,
        background: C_UNL,
      };
    }
    return {
      text: T_NA,
      background: C_NA,
    };
  }

  if (resp1.statusCode === 200) {
    return {
      text: `${T_UNL}(US)`,
      background: C_UNL,
    };
  }
  if (resp1.statusCode === 403) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

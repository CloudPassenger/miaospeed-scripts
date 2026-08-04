import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Tubi TV
// @description: 检测 Tubi TV 解锁状态
// @regions: us
// @tags: stream, video
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/TubiTV.go
function handler(): HandlerResult {
  const response = fetch("https://tubitv.com", {
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

  if (response.statusCode === 503 && response.body.indexOf("geoblock") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  if (response.statusCode === 302) {
    const gdpr = fetch("https://gdpr.tubi.tv", {
      headers: {
        "User-Agent": UA_WINDOWS,
      },
      retry: 3,
      timeout: 5000,
    });
    if (!gdpr) {
      return {
        text: `${T_FAIL}(${M_NETWORK})`,
        background: C_FAIL,
      };
    }
    if (gdpr.body.indexOf("Unfortunately") > -1) {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    }
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  if (response.statusCode === 403) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (response.statusCode === 200) {
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

import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: SPOTV NOW
// @description: 检测 SPOTV NOW 解锁状态
// @regions: kr
// @tags: stream, video, live
// @priority: 41

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/SpotvNow.go
function handler(): HandlerResult {
  const response = fetch(
    "https://edge.api.brightcove.com/playback/v1/accounts/5764318566001/videos/6349973203112",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
        Accept:
          "application/json;pk=BCpkADawqM0U3mi_PT566m5lvtapzMq3Uy7ICGGjGB6v4Ske7ZX_ynzj8ePedQJhH36nym_5mbvSYeyyHOOdUsZovyg2XlhV6rRspyYPw_USVNLaR0fB_AAL2HSQlfuetIPiEzbUs1tpNF9NtQxt3BAPvXdOAsvy1ltLPWMVzJHiw9slpLRgI2NUufc",
        Origin: "https://www.spotvnow.co.kr",
        Referer: "https://www.spotvnow.co.kr/",
      },
      retry: 3,
      timeout: 5000,
    }
  );

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  if (response.body.indexOf("CLIENT_GEO") > -1 || response.statusCode === 403) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (response.statusCode === 200 || response.statusCode === 404) {
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

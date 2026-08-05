import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: kayosports
// @name: Kayo Sports
// @description: 检测 Kayo Sports 解锁状态
// @category: media
// @regions: au
// @tags: stream, live
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/au/KayoSports.go
function handler(): HandlerResult {
  const response = fetch("https://kayosports.com.au", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const setCookie = response.headers["set-cookie"] || "";
  if (setCookie.indexOf("geoblocked=true") > -1) {
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

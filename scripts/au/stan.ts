import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Stan
// @description: 检测 Stan 解锁状态
// @regions: au
// @tags: stream, video
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/au/Stan.go
function handler(): HandlerResult {
  const response = fetch("https://api.stan.com.au/login/v1/sessions/web/account", {
    method: "POST",
    body: "{}",
    headers: {
      "User-Agent": UA_WINDOWS,
      "Content-Type": "application/json",
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

  if (
    response.body.indexOf("Access Denied") > -1 ||
    response.statusCode === 404 ||
    response.statusCode === 451
  ) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (response.body.indexOf("VPNDetected") > -1) {
    return {
      text: `${T_FAIL}(VPN)`,
      background: C_FAIL,
    };
  }
  if (response.statusCode === 400) {
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

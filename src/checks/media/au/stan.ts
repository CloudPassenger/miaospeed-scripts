// @id: stan
// @name: Stan
// @description: 检测 Stan 解锁状态
// @category: media
// @regions: au
// @tags: stream, video
// @priority: 45

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL } from "@/lib/constants/status";

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
      status: S_FAIL,
      error: M_NETWORK,
    };
  }

  if (response.body.indexOf("Access Denied") > -1 || response.statusCode === 404 || response.statusCode === 451) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }
  if (response.body.indexOf("VPNDetected") > -1) {
    return {
      text: `${T_FAIL}(VPN)`,
      background: C_FAIL,
      status: S_FAIL,
    };
  }
  if (response.statusCode === 400) {
    return {
      text: T_UNL,
      background: C_UNL,
      status: S_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
    status: S_NA,
  };
}

export default handler;

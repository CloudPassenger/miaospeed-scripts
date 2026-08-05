// @id: viu
// @name: Viu+
// @description: 检测 Viu+ 解锁状态
// @category: media
// @regions: global
// @tags: stream, video
// @priority: 8

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL } from "@/lib/constants/status";

function handler(): HandlerResult {
  const response = fetch("https://www.viu.com", {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (!response || response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_NETWORK,
    };
  }

  const location = response.redirects[0];
  println(response.redirects);
  if (location) {
    const region = location.split("/")[4];
    if (region === "no-service") {
      return {
        text: T_FAIL,
        background: C_FAIL,
        status: S_FAIL,
      };
    } else {
      return {
        text: `${T_UNL}(${region.toUpperCase()})`,
        background: C_UNL,
        status: S_UNL,
        region,
      };
    }
  }

  return {
    text: T_NA,
    background: C_NA,
    status: S_NA,
  };
}

export default handler;

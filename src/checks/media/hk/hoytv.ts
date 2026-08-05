// @id: hoytv
// @name: 香港開電視
// @description: 检测 HoyTV / 香港開電視 解锁状态
// @category: media
// @regions: hk
// @tags: stream, video
// @priority: 20

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL } from "@/lib/constants/status";

function handler(): HandlerResult {
  const response = fetch("https://hoytv-live-stream.hoy.tv/ch78/index-fhd.m3u8", {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_NETWORK,
    };
  }
  if (response.statusCode === 403) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  } else if (response.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
      status: S_UNL,
    };
  } else {
    return {
      text: T_NA,
      background: C_NA,
      status: S_NA,
    };
  }
}

export default handler;

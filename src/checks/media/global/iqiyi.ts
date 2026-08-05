// @id: iqiyi
// @name: 爱奇艺国际版
// @description: 检测 iQiyi Global 在当前地区是否可用
// @category: media
// @regions: global
// @tags: stream, video
// @priority: 10

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL } from "@/lib/constants/status";

function handler(): HandlerResult {
  const response = fetch("https://www.iq.com", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: T_NA,
      background: C_NA,
      status: S_NA,
    };
  }

  const clientIp = response.headers["x-custom-client-ip"] || "";
  const parts = clientIp.split(":");
  let region = parts.length >= 2 ? parts[parts.length - 1] : "";

  if (!region) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }

  if (region === "ntw") {
    region = "tw";
  }

  return {
    text: `${T_UNL}(${region.toUpperCase()})`,
    background: C_UNL,
    status: S_UNL,
    region,
  };
}

export default handler;

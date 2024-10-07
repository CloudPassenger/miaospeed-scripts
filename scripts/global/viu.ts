import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Viu+
// @description: 检测 Viu+ 解锁状态
// @regions: global
// @tags: stream, video
// @priority: 8

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
    };
  }

  const location = response.headers["location"];
  if (location) {
    const region = location.split("/")[4];
    if (region === "no-service") {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    } else {
      return {
        text: `${T_UNL}(${region})`,
        background: C_UNL,
      };
    }
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

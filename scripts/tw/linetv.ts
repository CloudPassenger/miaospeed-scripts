import { C_FAIL, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Line TV
// @description: 检测 Line TV 解锁状态
// @regions: tw
// @tags: stream, video, live
// @priority: 35

function handler(): HandlerResult {
  const response = fetch("https://www.linetv.tw/drama/11829/eps/1", {
    method: "GET",
    headers: {
      "user-agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const body = response.body;

  if (body.indexOf("window.__INITIAL_STATE__") === -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const hasEpsInfo = /"eps_info"\s*:\s*\[/.test(body);
  const hasDuration = /"durationInMs"\s*:\s*\d+/.test(body);

  if (hasEpsInfo && hasDuration) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  return {
    text: T_FAIL,
    background: C_FAIL,
  };
}

export default handler;

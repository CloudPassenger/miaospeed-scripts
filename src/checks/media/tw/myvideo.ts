import { C_FAIL, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: myvideo
// @name: MyVideo
// @description: 检测 MyVideo 线上影音 解锁状态
// @category: media
// @regions: tw
// @tags: stream, video, movie, anime
// @priority: 32

function handler(): HandlerResult {
  const response = fetch("https://www.myvideo.net.tw/login.do", {
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

  const finalUrl = response.url || "";

  if (finalUrl.indexOf("serviceAreaBlock") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (finalUrl.indexOf("goLoginPage") > -1) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  const body = response.body;

  if (body.indexOf("serviceAreaBlock") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  } else {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
}

export default handler;

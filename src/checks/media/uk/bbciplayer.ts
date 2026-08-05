// @id: bbciplayer
// @name: BBC iPlayer
// @description: 检测 BBC iPlayer 解锁状态
// @category: media
// @regions: uk
// @tags: stream, video, live
// @priority: 50

import { C_FAIL, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/lib/constants/text";
import { S_FAIL, S_UNL } from "@/lib/constants/status";

function handler(): HandlerResult {
  const response = fetch(
    "https://open.live.bbc.co.uk/mediaselector/6/select/version/2.0/mediaset/pc/vpid/bbc_one_london/format/json/jsfunc/JS_callbacks0",
    {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36",
      },
      noRedir: false,
      retry: 3,
      timeout: 5000,
    },
  );

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_NETWORK,
    };
  } else if (response.statusCode === 200) {
    const isBlocked = response.body.includes("geolocation");
    if (isBlocked) {
      return {
        text: T_FAIL,
        background: C_FAIL,
        status: S_FAIL,
      };
    }
    return {
      text: T_UNL,
      background: C_UNL,
      status: S_UNL,
    };
  } else if (response.statusCode === 403 || response.statusCode === 451) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  } else {
    return {
      text: `${T_FAIL}(${response.statusCode})`,
      background: C_FAIL,
      status: S_FAIL,
    };
  }
}

export default handler;

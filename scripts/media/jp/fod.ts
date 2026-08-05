import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: fod
// @name: FOD
// @description: 检测 FOD (Fuji TV On Demand) 解锁状态
// @category: media
// @regions: jp
// @tags: stream, video
// @priority: 41

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/FOD.go
function handler(): HandlerResult {
  const response = fetch(
    "https://geocontrol1.stream.ne.jp/fod-geo/check.xml?time=1624504256",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
      },
      retry: 3,
      timeout: 5000,
    }
  );

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  if (response.body.indexOf("true") > -1) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (response.body.indexOf("false") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

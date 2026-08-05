import { C_FAIL, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: radiko
// @name: Radiko
// @description: 检测 Radiko 网络电台解锁状态
// @category: media
// @regions: jp
// @tags: stream, radio
// @priority: 41

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Radiko.go
function handler(): HandlerResult {
  const response = fetch(`https://radiko.jp/area?_=${Date.now()}`, {
    headers: {
      "User-Agent": UA_WINDOWS,
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

  if (response.body.indexOf('class="OUT"') > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (response.body.indexOf("JAPAN") > -1) {
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

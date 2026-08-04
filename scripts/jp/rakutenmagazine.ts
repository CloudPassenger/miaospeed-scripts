import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: 楽天マガジン
// @description: 检测 楽天マガジン(Rakuten Magazine) 解锁状态
// @regions: jp
// @tags: stream
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/RakutenMagazine.go
function handler(): HandlerResult {
  const response = fetch(
    "https://data-cloudauthoring.magazine.rakuten.co.jp/rem_repository/////////.key",
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

  if (response.statusCode === 404) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (response.statusCode === 403) {
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

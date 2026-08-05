// @id: rakutentv-jp
// @name: 楽天TV
// @description: 检测 楽天TV(Rakuten TV) 日本站解锁状态
// @category: media
// @regions: jp
// @tags: stream, video
// @priority: 41

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/RakutenTV.go
function handler(): HandlerResult {
  const response = fetch(
    "https://api.tv.rakuten.co.jp/content/playinfo.json?content_id=476611&device_id=14&trailer=1&auth=0&log=0&serial_code=&tmp_eng_flag=1&multi_audio_support=1",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
        Origin: "https://tv.rakuten.co.jp",
        Referer: "https://tv.rakuten.co.jp/",
      },
      retry: 3,
      timeout: 5000,
    },
  );

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  if (response.statusCode === 200) {
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

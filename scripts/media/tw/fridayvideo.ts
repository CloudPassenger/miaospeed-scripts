import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: fridayvideo
// @name: friDay 影音
// @description: 检测 friDay 影音 (video.friday.tw) 解锁状态
// @category: media
// @regions: tw
// @tags: stream, video
// @priority: 33

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/FridayVideo.go
type FridayVideoResponse = {
  code: string;
};

function handler(): HandlerResult {
  const response = fetch(
    "https://video.friday.tw/api2/streaming/get?streamingId=122581&streamingType=2&contentType=4&contentId=1&clientId=",
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

  const res = safeParse<FridayVideoResponse>(response.body);
  const code = get<string>(res, "code", "");

  if (code === "1006") {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (code === "0000") {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

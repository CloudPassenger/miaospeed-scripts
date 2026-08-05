import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: abciview
// @name: ABC iview
// @description: 检测 ABC iview 解锁状态
// @category: media
// @regions: au
// @tags: stream, video, live
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/au/ABCiView.go
function handler(): HandlerResult {
  const response = fetch(
    "https://api.iview.abc.net.au/v2/show/abc-kids-live-stream/video/LS1604H001S00?embed=highlightVideo,selectedSeries",
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

  if (response.body.indexOf("unavailable outside Australia") > -1 || response.statusCode === 451) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (response.statusCode === 200) {
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

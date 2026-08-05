import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: unext
// @name: U-NEXT
// @description: 检测 U-NEXT 解锁状态
// @category: media
// @regions: jp
// @tags: stream, video
// @priority: 41

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/UNext.go
type UNextResponse = {
  data: {
    webfront_playlistUrl: {
      resultStatus: number;
    };
  };
};

function handler(): HandlerResult {
  const response = fetch("https://cc.unext.jp", {
    method: "POST",
    body: JSON.stringify({
      operationName: "cosmo_getPlaylistUrl",
      variables: {
        code: "ED00479780",
        playMode: "caption",
        bitrateLow: 192,
        bitrateHigh: null,
        validationOnly: false,
      },
      query:
        "query cosmo_getPlaylistUrl($code: String, $playMode: String, $bitrateLow: Int, $bitrateHigh: Int, $validationOnly: Boolean) { webfront_playlistUrl(code: $code, playMode: $playMode, bitrateLow: $bitrateLow, bitrateHigh: $bitrateHigh, validationOnly: $validationOnly) { resultStatus } }",
    }),
    headers: {
      "User-Agent": UA_WINDOWS,
      "Content-Type": "application/json",
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

  const res = safeParse<UNextResponse>(response.body);
  const status = get<number>(res, "data.webfront_playlistUrl.resultStatus", 0);

  if (!status) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (status === 200 || status === 475) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (status === 467) {
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

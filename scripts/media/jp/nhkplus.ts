import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_IP_BLOCK, M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: nhkplus
// @name: NHK+
// @description: 检测 NHK プラス 解锁状态
// @category: media
// @regions: jp
// @tags: stream, video, live
// @priority: 41

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/NHKPlus.go
type NHKPlusResponse = {
  country_code: string;
};

function handler(): HandlerResult {
  const response = fetch("https://location-plus.nhk.jp/geoip/area.json", {
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

  if (response.statusCode === 403) {
    return {
      text: `${T_FAIL}(${M_IP_BLOCK})`,
      background: C_FAIL,
    };
  }

  const res = safeParse<NHKPlusResponse>(response.body);
  const countryCode = get<string>(res, "country_code", "");

  if (countryCode === "JP") {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (countryCode) {
    return {
      text: `${T_FAIL}(${countryCode})`,
      background: C_FAIL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

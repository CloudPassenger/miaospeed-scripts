// @id: tvbanywhere
// @name: TVB Anywhere
// @description: 检测 TVB Anywhere 解锁状态
// @category: media
// @regions: global
// @tags: stream, video
// @priority: 8

import { C_NA, C_UNL, C_FAIL, C_UNK } from "@/lib/constants/colors";
import { T_FAIL, T_UNK, T_UNL } from "@/lib/constants/text";
import { UA_ANDROID } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNK, S_UNL } from "@/lib/constants/status";

type ResponseBody = {
  ip: string;
  country: string;
  is_europe: boolean;
  allow_in_this_country: boolean;
  login_button: any[];
  allow_super: boolean;
};

function handler(): HandlerResult {
  const response = fetch("https://uapisfm.tvbanywhere.com.sg/geoip/check/platform/android", {
    headers: {
      "User-Agent": UA_ANDROID,
    },
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (!response) {
    return {
      text: "N/A",
      background: C_NA,
      status: S_NA,
    };
  } else if (response.statusCode === 200) {
    const body = response.body;
    const result = safeParse<ResponseBody>(body);

    const region = result.country;
    if (region === "HK" || result.allow_in_this_country) {
      return {
        text: `${T_UNL}(${region})`,
        background: C_UNL,
        status: S_UNL,
        region,
      };
    } else {
      return {
        text: `${T_FAIL}(${region})`,
        background: C_FAIL,
        status: S_FAIL,
        region,
      };
    }
  } else {
    return {
      text: T_UNK,
      background: C_UNK,
      status: S_UNK,
    };
  }
}

export default handler;

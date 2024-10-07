import { C_NA, C_UNL, C_FAIL, C_UNK } from "@/consts/colors";
import { T_FAIL, T_UNK, T_UNL } from "@/consts/text";
import { UA_ANDROID } from "@/consts/ua";

// @name: TVB Anywhere
// @description: 检测 TVB Anywhere 解锁状态
// @regions: global
// @tags: stream, video
// @priority: 8

type ResponseBody = {
  ip: string;
  country: string;
  is_europe: boolean;
  allow_in_this_country: boolean;
  login_button: any[];
  allow_super: boolean;
};

function handler(): HandlerResult {
  const response = fetch(
    "https://uapisfm.tvbanywhere.com.sg/geoip/check/platform/android",
    {
      headers: {
        "User-Agent": UA_ANDROID,
      },
      noRedir: false,
      retry: 3,
      timeout: 15000,
    }
  );

  if (!response) {
    return {
      text: "N/A",
      background: C_NA,
    };
  } else if (response.statusCode == 200) {
    const body = response.body;
    const result = safeParse<ResponseBody>(body);

    const region = result.country;
    if (result.allow_in_this_country) {
      return {
        text: `${T_UNL}(${region})`,
        background: C_UNL,
      };
    } else {
      return {
        text: `${T_FAIL}(${region})`,
        background: C_FAIL,
      };
    }
  } else {
    return {
      text: T_UNK,
      background: C_UNK,
    };
  }
}

export default handler;
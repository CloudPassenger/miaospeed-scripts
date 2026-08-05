import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: coze
// @name: Coze
// @description: 检测字节跳动 Coze (coze.com) 在当前地区是否可用
// @category: ai
// @regions: global
// @tags: ai
// @priority: 8

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Coze.go
type CozeResponse = {
  code: number;
  data: {
    IsForbiddenRegion: boolean;
    CountryCode: string;
  };
};

function handler(): HandlerResult {
  const response = fetch("https://www.coze.com/api/developer/get_login_info", {
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
      text: `${T_FAIL}(WAF)`,
      background: C_WARN,
    };
  }

  if (response.body.indexOf("Your region is not supported") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const res = safeParse<CozeResponse>(response.body);
  const countryCode = get(res, "data.CountryCode", "");
  const isForbidden = get(res, "data.IsForbiddenRegion", false);

  if (isForbidden) {
    return {
      text: `${T_FAIL}${countryCode ? `(${countryCode})` : ""}`,
      background: C_FAIL,
    };
  }
  if (countryCode) {
    return {
      text: `${T_UNL}(${countryCode})`,
      background: C_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

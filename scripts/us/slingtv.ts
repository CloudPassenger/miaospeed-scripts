import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Sling TV
// @description: 检测 Sling TV 解锁状态
// @regions: us
// @tags: stream, video, live
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/SlingTV.go
// ISO 3166-1 alpha-3 -> alpha-2 国家/地区代码映射表（仅本脚本使用）
const ALPHA3_TO_ALPHA2: Record<string, string> = {
  USA: "US", CAN: "CA", GBR: "GB", MEX: "MX", AUS: "AU", DEU: "DE", FRA: "FR",
  ITA: "IT", ESP: "ES", JPN: "JP", KOR: "KR", CHN: "CN", IND: "IN", BRA: "BR",
};

function threeToTwoCode(code: string): string {
  return ALPHA3_TO_ALPHA2[(code || "").toUpperCase()] || code;
}

type SlingTVResponse = {
  ip_restricted: boolean;
  country: string;
};

function handler(): HandlerResult {
  const response = fetch("https://p-geo.movetv.com/geo", {
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

  const res = safeParse<SlingTVResponse>(response.body);
  const restricted = get<boolean>(res, "ip_restricted", false);
  const country = get<string>(res, "country", "");
  const region = threeToTwoCode(country);

  if (!country) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }
  if (restricted) {
    return {
      text: `${T_FAIL}(${region})`,
      background: C_FAIL,
    };
  }

  return {
    text: `${T_UNL}(${region})`,
    background: C_UNL,
  };
}

export default handler;

import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: francetv
// @name: France TV
// @description: 检测 France TV 解锁状态
// @category: media
// @regions: fr
// @tags: stream, video, live
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/FranceTV.go
type FranceTVResponse = {
  reponse: {
    geo_info: {
      country_code: string;
    };
  };
};

function handler(): HandlerResult {
  const response = fetch("https://geo-info.ftven.fr/ws/edgescape.json", {
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

  const res = safeParse<FranceTVResponse>(response.body);
  const countryCode = get<string>(res, "reponse.geo_info.country_code", "");

  if (countryCode === "FR") {
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

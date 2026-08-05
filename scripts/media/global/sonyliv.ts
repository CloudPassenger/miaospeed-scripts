import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: sonyliv
// @name: SonyLIV
// @description: 检测 SonyLIV 在当前地区是否可用
// @category: media
// @regions: global
// @tags: stream, video
// @priority: 40

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/SonyLiv.go
const SONYLIV_SUPPORT_COUNTRY = [
  "AE", "AF", "AT", "AU", "BD", "BE", "BH", "BT", "CA", "CH", "CN", "DE", "DK", "ES", "FI",
  "FR", "GB", "GR", "HK", "ID", "IE", "IN", "IT", "KW", "LK", "MO", "MV", "MY", "NL", "NO",
  "NP", "NZ", "OM", "PH", "PK", "PL", "PT", "QA", "SA", "SE", "SG", "TH", "TW", "US",
];

function handler(): HandlerResult {
  const response = fetch("https://www.sonyliv.com/signin", {
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

  const match = response.body.match(/country_code:"([A-Z]{2})"/);
  const region = match ? match[1] : "";

  if (region && SONYLIV_SUPPORT_COUNTRY.indexOf(region) > -1) {
    return {
      text: `${T_UNL}(${region})`,
      background: C_UNL,
    };
  }
  if (region) {
    return {
      text: `${T_FAIL}(${region})`,
      background: C_FAIL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: nlziet
// @name: NLZIET
// @description: 检测 NLZIET 解锁状态
// @category: media
// @regions: nl
// @tags: stream, video
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/NLZIET.go
const NLZIET_SUPPORT_COUNTRY = [
  "BE", "BG", "CZ", "DK", "DE", "EE", "IE", "EL", "ES", "FR", "HR", "IT", "CY",
  "LV", "LT", "LU", "HU", "MT", "NL", "AT", "PL", "PT", "RO", "SI", "SK", "FI", "SE",
];

function handler(): HandlerResult {
  const response = fetch("https://nlziet.nl/cdn-cgi/trace", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });

  if (!response || response.statusCode !== 200) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }

  const match = response.body.match(/loc=([A-Z]{2})/);
  const loc = match ? match[1] : "";

  if (loc && NLZIET_SUPPORT_COUNTRY.indexOf(loc) > -1) {
    return {
      text: `${T_UNL}(${loc})`,
      background: C_UNL,
    };
  }
  if (loc) {
    return {
      text: `${T_FAIL}(${loc})`,
      background: C_FAIL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

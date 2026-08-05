import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: claude
// @name: Claude
// @description: 检测 Anthropic Claude 在当前地区是否可用
// @category: ai
// @regions: global
// @tags: ai
// @priority: 7

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Claude.go
const CLAUDE_SUPPORT_COUNTRY = [
  "AL", "DZ", "AD", "AO", "AG", "AR", "AM", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BE", "BZ",
  "BJ", "BT", "BO", "BA", "BW", "BR", "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "TD", "CL",
  "CO", "KM", "CG", "CR", "CI", "HR", "CY", "CZ", "DK", "DJ", "DM", "DO", "EC", "EG", "SV", "GQ",
  "EE", "SZ", "FJ", "FI", "FR", "GA", "GM", "GE", "DE", "GH", "GR", "GD", "GT", "GN", "GW", "GY",
  "HT", "HN", "HU", "IS", "IN", "ID", "IQ", "IE", "IL", "IT", "JM", "JP", "JO", "KZ", "KE", "KI",
  "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LI", "LT", "LU", "MG", "MW", "MY", "MV", "MT", "MH",
  "MR", "MU", "MX", "FM", "MD", "MC", "MN", "ME", "MA", "MZ", "NA", "NR", "NP", "NL", "NZ", "NE",
  "NG", "MK", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PL", "PT", "QA", "RO",
  "RW", "KN", "LC", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SK", "SI", "SB",
  "ZA", "KR", "ES", "LK", "SR", "SE", "CH", "TW", "TJ", "TZ", "TH", "TL", "TG", "TO", "TT", "TN",
  "TR", "TM", "TV", "UG", "UA", "AE", "GB", "US", "UY", "UZ", "VU", "VA", "VN", "ZM", "ZW",
];

function handler(): HandlerResult {
  const response = fetch("https://claude.ai/cdn-cgi/trace", {
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

  if (loc === "T1") {
    return {
      text: `${T_UNL}(Tor)`,
      background: C_UNL,
    };
  }
  if (!loc) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }
  if (CLAUDE_SUPPORT_COUNTRY.indexOf(loc) > -1) {
    return {
      text: `${T_UNL}(${loc})`,
      background: C_UNL,
    };
  }
  return {
    text: `${T_FAIL}(${loc})`,
    background: C_FAIL,
  };
}

export default handler;

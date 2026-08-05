import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: poe
// @name: Poe
// @description: 检测 Quora Poe 在当前地区是否可用
// @category: ai
// @regions: global
// @tags: ai
// @priority: 8

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Poe.go
const POE_SUPPORT_COUNTRY = [
  "AF", "AL", "DZ", "AS", "AD", "AO", "AI", "AG", "AR", "AM", "AW", "AU", "AT", "AZ", "BS",
  "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BA", "BW", "BR", "VG", "BN",
  "BG", "BF", "BI", "KH", "CM", "CA", "CV", "KY", "CF", "TD", "IO", "CL", "CN", "CX", "CC",
  "CO", "KM", "CG", "CD", "CK", "CR", "CI", "HR", "CU", "CY", "CZ", "DK", "DJ", "DM", "DO",
  "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF",
  "GA", "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW",
  "GY", "HT", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM",
  "JP", "JE", "JO", "KZ", "KE", "KI", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI",
  "LT", "LU", "MO", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX",
  "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ",
  "NI", "NE", "NG", "NU", "NF", "KP", "MK", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG",
  "PY", "PE", "PH", "PN", "PL", "PT", "PR", "QA", "RE", "RO", "RU", "RW", "WS", "SM", "ST",
  "SA", "SN", "RS", "SC", "SL", "SG", "SK", "SI", "GS", "SB", "SO", "ZA", "KR", "ES", "LK",
  "BL", "SH", "KN", "LC", "MF", "PM", "VC", "SD", "SR", "SJ", "SE", "CH", "SY", "TW", "TJ",
  "TZ", "TH", "TL", "TG", "TK", "TO", "TT", "TN", "TR", "TM", "TC", "TV", "VI", "UG", "UA",
  "AE", "GB", "US", "UY", "UZ", "VU", "VA", "VE", "VN", "WF", "YE", "ZM", "ZW",
];

function handler(): HandlerResult {
  const trace = fetch("https://poe.com/cdn-cgi/trace", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });
  if (!trace || trace.statusCode !== 200) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }
  const match = trace.body.match(/loc=([A-Z]{2})/);
  const loc = match ? match[1] : "";

  const response = fetch("https://poe.com/", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });
  if (!response) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }

  if (response.statusCode === 403) {
    return {
      text: `${T_FAIL}${loc ? `(${loc})` : ""}`,
      background: C_FAIL,
    };
  }

  if (loc && POE_SUPPORT_COUNTRY.indexOf(loc) > -1) {
    return {
      text: `${T_UNL}(${loc})`,
      background: C_UNL,
    };
  }
  return {
    text: `${T_FAIL}${loc ? `(${loc})` : ""}`,
    background: C_FAIL,
  };
}

export default handler;

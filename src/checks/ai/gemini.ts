import { C_FAIL, C_UNL } from "@/lib/constants/colors";
import { M_IP_BLOCK, M_NETWORK, T_FAIL, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: gemini
// @name: Google Gemini
// @description: 检测 Google Gemini 在当前地区是否可用
// @category: ai
// @regions: global
// @tags: ai
// @priority: 8

// ISO 3166-1 alpha-3 -> alpha-2 国家/地区代码映射表（仅本脚本使用）
// 来源: https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/core/country.go
const ALPHA3_TO_ALPHA2: Record<string, string> = {
  AND: "AD", ARE: "AE", AFG: "AF", ATG: "AG", AIA: "AI", ALB: "AL", ARM: "AM",
  AGO: "AO", ATA: "AQ", ARG: "AR", ASM: "AS", AUT: "AT", AUS: "AU", ABW: "AW",
  ALA: "AX", AZE: "AZ", BIH: "BA", BRB: "BB", BGD: "BD", BEL: "BE", BFA: "BF",
  BGR: "BG", BHR: "BH", BDI: "BI", BEN: "BJ", BLM: "BL", BMU: "BM", BRN: "BN",
  BOL: "BO", BES: "BQ", BRA: "BR", BHS: "BS", BTN: "BT", BVT: "BV", BWA: "BW",
  BLR: "BY", BLZ: "BZ", CAN: "CA", CCK: "CC", COD: "CD", CAF: "CF", COG: "CG",
  CHE: "CH", CIV: "CI", COK: "CK", CHL: "CL", CMR: "CM", CHN: "CN", COL: "CO",
  CRI: "CR", CUB: "CU", CPV: "CV", CUW: "CW", CXR: "CX", CYP: "CY", CZE: "CZ",
  DEU: "DE", DJI: "DJ", DNK: "DK", DMA: "DM", DOM: "DO", DZA: "DZ", ECU: "EC",
  EST: "EE", EGY: "EG", ESH: "EH", ERI: "ER", ESP: "ES", ETH: "ET", FIN: "FI",
  FJI: "FJ", FLK: "FK", FSM: "FM", FRO: "FO", FRA: "FR", GAB: "GA", GBR: "GB",
  GRD: "GD", GEO: "GE", GUF: "GF", GGY: "GG", GHA: "GH", GIB: "GI", GRL: "GL",
  GMB: "GM", GIN: "GN", GLP: "GP", GNQ: "GQ", GRC: "GR", SGS: "GS", GTM: "GT",
  GUM: "GU", GNB: "GW", GUY: "GY", HKG: "HK", HMD: "HM", HND: "HN", HRV: "HR",
  HTI: "HT", HUN: "HU", IDN: "ID", IRL: "IE", ISR: "IL", IMN: "IM", IND: "IN",
  IOT: "IO", IRQ: "IQ", IRN: "IR", ISL: "IS", ITA: "IT", JEY: "JE", JAM: "JM",
  JOR: "JO", JPN: "JP", KEN: "KE", KGZ: "KG", KHM: "KH", KIR: "KI", COM: "KM",
  KNA: "KN", PRK: "KP", KOR: "KR", KWT: "KW", CYM: "KY", KAZ: "KZ", LAO: "LA",
  LBN: "LB", LCA: "LC", LIE: "LI", LKA: "LK", LBR: "LR", LSO: "LS", LTU: "LT",
  LUX: "LU", LVA: "LV", LBY: "LY", MAR: "MA", MCO: "MC", MDA: "MD", MNE: "ME",
  MAF: "MF", MDG: "MG", MHL: "MH", MKD: "MK", MLI: "ML", MMR: "MM", MNG: "MN",
  MAC: "MO", MNP: "MP", MTQ: "MQ", MRT: "MR", MSR: "MS", MLT: "MT", MUS: "MU",
  MDV: "MV", MWI: "MW", MEX: "MX", MYS: "MY", MOZ: "MZ", NAM: "NA", NCL: "NC",
  NER: "NE", NFK: "NF", NGA: "NG", NIC: "NI", NLD: "NL", NOR: "NO", NPL: "NP",
  NRU: "NR", NIU: "NU", NZL: "NZ", OMN: "OM", PAN: "PA", PER: "PE", PYF: "PF",
  PNG: "PG", PHL: "PH", PAK: "PK", POL: "PL", SPM: "PM", PCN: "PN", PRI: "PR",
  PSE: "PS", PRT: "PT", PLW: "PW", PRY: "PY", QAT: "QA", REU: "RE", ROU: "RO",
  SRB: "RS", RUS: "RU", RWA: "RW", SAU: "SA", SLB: "SB", SYC: "SC", SDN: "SD",
  SWE: "SE", SGP: "SG", SHN: "SH", SVN: "SI", SJM: "SJ", SVK: "SK", SLE: "SL",
  SMR: "SM", SEN: "SN", SOM: "SO", SUR: "SR", SSD: "SS", STP: "ST", SLV: "SV",
  SXM: "SX", SYR: "SY", SWZ: "SZ", TCA: "TC", TCD: "TD", ATF: "TF", TGO: "TG",
  THA: "TH", TJK: "TJ", TKL: "TK", TLS: "TL", TKM: "TM", TUN: "TN", TON: "TO",
  TUR: "TR", TTO: "TT", TUV: "TV", TWN: "TW", TZA: "TZ", UKR: "UA", UGA: "UG",
  UMI: "UM", USA: "US", URY: "UY", UZB: "UZ", VAT: "VA", VCT: "VC", VEN: "VE",
  VGB: "VG", VIR: "VI", VNM: "VN", VUT: "VU", WLF: "WF", WSM: "WS", YEM: "YE",
  MYT: "YT", ZAF: "ZA", ZMB: "ZM", ZWE: "ZW",
};

/**
 * 将 ISO 3166-1 alpha-3 三位国家代码转换为 alpha-2 两位代码
 *
 * @param {string} code 三位国家代码
 * @return {*}  {string} 两位国家代码，找不到时返回空字符串
 */
function threeToTwoCode(code: string): string {
  return ALPHA3_TO_ALPHA2[(code || "").toUpperCase()] || "";
}

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Gemini.go
const GEMINI_SUPPORT_COUNTRY = [
  "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR",
  "AM", "AW", "AU", "AT", "AZ", "BH", "BD", "BB", "BE", "BZ",
  "BJ", "BM", "BT", "BO", "BA", "BW", "BR", "IO", "VG", "BN",
  "BG", "BF", "BI", "CV", "KH", "CM", "CA", "BQ", "KY", "CF",
  "TD", "CL", "CX", "CC", "CO", "KM", "CK", "CR", "CI", "HR",
  "CW", "CZ", "CD", "DK", "DJ", "DM", "DO", "EC", "EG", "SV",
  "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR",
  "GF", "PF", "TF", "GA", "GE", "DE", "GH", "GI", "GR", "GL",
  "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY", "HT", "HM",
  "HN", "HU", "IS", "IN", "ID", "IQ", "IE", "IM", "IL", "IT",
  "JM", "JP", "JE", "JO", "KZ", "KE", "KI", "XK", "KW", "KG",
  "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU", "MG",
  "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT",
  "MX", "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM",
  "NA", "NR", "NP", "NL", "NC", "NZ", "NI", "NE", "NG", "NU",
  "NF", "MK", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG",
  "PY", "PE", "PH", "PN", "PL", "PT", "PR", "QA", "CY", "CG",
  "RE", "RO", "RW", "BL", "SH", "KN", "LC", "MF", "PM", "VC",
  "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX",
  "SK", "SI", "SB", "SO", "ZA", "GS", "KR", "SS", "ES", "LK",
  "SD", "SR", "SJ", "SE", "CH", "TW", "TJ", "TZ", "TH", "BS",
  "GM", "TL", "TG", "TK", "TO", "TT", "TN", "TR", "TM", "TC",
  "TV", "VI", "UG", "UA", "AE", "GB", "US", "UM", "UY", "UZ",
  "VU", "VA", "VE", "VN", "WF", "EH", "YE", "ZM", "ZW",
];

function handler(): HandlerResult {
  // Send a request to the Google Gemini URL
  const response = fetch("https://gemini.google.com/?hl=en", {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: true,
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
  if (response.statusCode === 302) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const countryMatch = response.body.match(/,2,1,200,"([A-Z]{3})"/);
  const threeCode = countryMatch ? countryMatch[1] : "";
  const region = threeToTwoCode(threeCode);

  if (!threeCode || !region) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  if (GEMINI_SUPPORT_COUNTRY.indexOf(region) === -1) {
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

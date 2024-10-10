import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: 哔哩国际
// @description: 检测 Bilibili 国际版 解锁状态
// @regions: tw, hk
// @tags: stream, video, anime
// @priority: 30

enum REGIONS {
  HKMO = "HKMO",
  TW = "TW",
  // SEA = "SEA",
  // Thailand = "Thailand",
  // Indonesia = "Indonesia",
}

const REGION_URLs = {
  HKMO: "https://api.bilibili.com/pgc/player/web/playurl?avid=473502608&cid=845838026&qn=0&type=&otype=json&ep_id=678506&fourk=1&fnver=0&fnval=16&module=bangumi",
  TW: "https://api.bilibili.com/pgc/player/web/playurl?avid=50762638&cid=100279344&qn=0&type=&otype=json&ep_id=268176&fourk=1&fnver=0&fnval=16&module=bangumi",
  // "SEA": "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=347666",
  // "Thailand": "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=10077726",
  // "Indonesia": "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=11130043",
  // "Vietnam": "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=11405745"
} as Record<REGIONS, string>;

type RegionCheckResults = Record<REGIONS, boolean | null>;

type ResponseBody = {
  code?: number;
  message?: string;
};

/**
 * Bilibili Test By URL
 *
 * @param {string} url JSON API URL
 * @return {*}  {(null | boolean)} {null: Network Error, false: Not Available, true: Available}
 */
function bilibiliTest(url: string): null | boolean {
  const response = fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 15000,
  });

  if (!response) {
    return null; // Network Error
  }

  if (response.statusCode === 412) return false;

  println(response.body); // Ensure 200 OK
  const code = safeParse<ResponseBody>(response.body)?.code;
  if (code === 0) return true;
  return false;
}

function handler(): HandlerResult {
  const results: RegionCheckResults = {
    HKMO: null,
    TW: null,
  };
  for (const regionCode in REGION_URLs) {
    results[regionCode] = bilibiliTest(REGION_URLs[regionCode]);
  }
  if (results.HKMO === true && results.TW === true) {
    return {
      text: `${T_UNL}(台港澳)`,
      background: C_UNL,
    };
  } else if (results.HKMO === true) {
    return {
      text: `${T_UNL}(港澳)`,
      background: C_UNL,
    };
  } else if (results.TW === true) {
    return {
      text: `${T_UNL}(台湾)`,
      background: C_UNL,
    };
  } else if (results.HKMO === false && results.TW === false) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  } else {
    return {
      text: T_NA,
      background: C_NA,
    };
  }
}

export default handler;
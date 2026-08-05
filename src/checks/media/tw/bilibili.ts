// @id: bilibili
// @name: 哔哩国际
// @description: 检测 Bilibili 国际版 解锁状态
// @category: media
// @regions: tw, hk
// @tags: stream, video, anime
// @priority: 30

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL } from "@/lib/constants/status";

// 国际电话区号 -> ISO alpha-2 地区码（仅覆盖 bilibili 分区测试用到的地区）
const CALLING_CODE_TO_ALPHA2: Record<string, string> = {
  "852": "HK",
  "853": "MO",
  "886": "TW",
  "66": "TH",
  "62": "ID",
  "84": "VN",
  "60": "MY",
  "65": "SG",
  "63": "PH",
  "673": "BN",
  "855": "KH",
  "856": "LA",
  "95": "MM",
  "670": "TL",
};

// 各地区对应的分区限定内容播放地址
const REGION_TEST_URL: Record<string, string> = {
  HK: "https://api.bilibili.com/pgc/player/web/playurl?avid=473502608&cid=845838026&qn=0&type=&otype=json&ep_id=678506&fourk=1&fnver=0&fnval=16&module=bangumi",
  MO: "https://api.bilibili.com/pgc/player/web/playurl?avid=473502608&cid=845838026&qn=0&type=&otype=json&ep_id=678506&fourk=1&fnver=0&fnval=16&module=bangumi",
  TW: "https://api.bilibili.com/pgc/player/web/playurl?avid=50762638&cid=100279344&qn=0&type=&otype=json&ep_id=268176&fourk=1&fnver=0&fnval=16&module=bangumi",
  TH: "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=10077726",
  ID: "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=11130043",
  VN: "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=11405745",
  MY: "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=347666",
  SG: "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=347666",
  PH: "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=347666",
  BN: "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=347666",
  KH: "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=347666",
  LA: "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=347666",
  MM: "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=347666",
  TL: "https://api.bilibili.tv/intl/gateway/web/playurl?s_locale=en_US&platform=web&ep_id=347666",
};

type ZoneResponse = {
  code?: number;
  data?: {
    country_code?: number;
  };
};

type PlayUrlResponse = {
  code?: number;
  message?: string;
};

/**
 * 请求分区限定内容播放地址，判断是否可播放
 *
 * @return {*} true: 可播放, false: 不可播放, null: 网络错误
 */
function testPlayUrl(url: string): null | boolean {
  const response = fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 15000,
  });

  if (!response) {
    return null;
  }
  if (response.statusCode === 412) {
    return false;
  }

  const code = safeParse<PlayUrlResponse>(response.body)?.code;
  if (code === 0) return true;
  if (code === -10403 || code === 10004001 || code === 10003003) return false;
  return false;
}

function handler(): HandlerResult {
  const zoneResponse = fetch("https://api.bilibili.com/x/web-interface/zone", {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 15000,
  });

  if (!zoneResponse) {
    return {
      text: T_NA,
      background: C_NA,
      status: S_NA,
    };
  }

  const zoneData = safeParse<ZoneResponse>(zoneResponse.body);
  if (zoneData?.code !== 0) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }

  const countryCode = String(get<number>(zoneData, "data.country_code", 0));
  const region = CALLING_CODE_TO_ALPHA2[countryCode] || countryCode;

  const testUrl = REGION_TEST_URL[region];
  if (!testUrl) {
    // 不在分区限定内容覆盖的地区列表内，说明该地区没有额外限制
    return {
      text: `${T_UNL}(${region})`,
      background: C_UNL,
      status: S_UNL,
      region,
    };
  }

  const playable = testPlayUrl(testUrl);
  if (playable === true) {
    return {
      text: `${T_UNL}(${region})`,
      background: C_UNL,
      status: S_UNL,
      region,
    };
  } else if (playable === false) {
    return {
      text: `${T_FAIL}(${region})`,
      background: C_FAIL,
      status: S_FAIL,
      region,
    };
  } else {
    return {
      text: T_NA,
      background: C_NA,
      status: S_NA,
    };
  }
}

export default handler;

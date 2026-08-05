import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, M_RESPONSE, T_FAIL, T_UNL } from "@/lib/constants/text";
import { SEC_CH_UA, UA_WINDOWS } from "@/lib/constants/ua";

// @id: tiktok
// @name: Tiktok
// @description: 检测 Tiktok 是否可用
// @category: social
// @regions: global
// @tags: social
// @priority: 3

function handler(): HandlerResult {
  const response = fetch("https://www.tiktok.com/explore", {
    method: "GET",
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en",
      "sec-ch-ua": SEC_CH_UA,
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",

      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (!response || response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const body = response.body;

  if (body.includes("https://www.tiktok.com/hk/notfound")) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const match = body.match(/"region":"(\w+)"/);
  const region = match && match[1] ? match[1] : "";

  if (region) {
    return {
      text: `${T_UNL}(${region})`,
      background: C_UNL,
    };
  }

  // 首页兜底重试一次
  const rootResponse = fetch("https://www.tiktok.com/", {
    method: "GET",
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en",
      "sec-ch-ua": SEC_CH_UA,
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (rootResponse && rootResponse.statusCode === 200) {
    if (rootResponse.body.includes("https://www.tiktok.com/hk/notfound")) {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    }
    const rootMatch = rootResponse.body.match(/"region":"(\w+)"/);
    const rootRegion = rootMatch && rootMatch[1] ? rootMatch[1] : "";
    if (rootRegion) {
      return {
        text: `${T_UNL}(${rootRegion})`,
        background: C_UNL,
      };
    }
  }

  return {
    text: T_FAIL,
    background: C_FAIL,
  };
}

export default handler;

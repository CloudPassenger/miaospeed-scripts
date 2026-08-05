// @id: netflix
// @name: Netflix
// @description: 检测 Netflix 可用性
// @category: media
// @regions: global
// @tags: stream, video
// @priority: 1

import { C_FAIL, C_UNL, C_UNK, C_WARN } from "@/lib/constants/colors";
import { T_FAIL, T_UNK, T_UNL } from "@/lib/constants/text";
import { SEC_CH_UA, UA_WINDOWS } from "@/lib/constants/ua";

const T_ORIGINAL_ONLY = "仅自制";

const requestHeaders = {
  Accept: "*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-CH-UA": SEC_CH_UA,
  "Sec-CH-UA-Mobile": "?0",
  "Sec-CH-UA-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": UA_WINDOWS,
};

/** 从内容页 body 中用多种正则提取地区代码 */
function extractRegionFromPage(body: string): string {
  const patterns = [
    /"country"\s*:\s*"([A-Z]{2})"/,
    /"requestCountry"\s*:\s*\{\s*"id"\s*:\s*"([A-Z]{2})"/,
    /"preferredLocale"\s*:\s*\{\s*"country"\s*:\s*"([A-Z]{2})"/,
    /"geo"\s*:\s*\{[^}]*"country"\s*:\s*"([A-Z]{2})"/,
    /data-country\s*=\s*"([A-Z]{2})"/,
  ];
  for (let i = 0; i < patterns.length; i++) {
    const match = body.match(patterns[i]);
    if (match && match[1]) {
      return match[1];
    }
  }
  return "";
}

function requestTitle(url: string): FetchResponse {
  return fetch(url, {
    method: "GET",
    headers: requestHeaders,
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });
}

function handler(): HandlerResult {
  const resp1 = requestTitle("https://www.netflix.com/title/70143836"); // Breaking Bad
  const resp2 = requestTitle("https://www.netflix.com/title/81280792"); // Originals

  if (resp1.statusCode === 404 && resp2.statusCode === 404) {
    return { text: T_ORIGINAL_ONLY, background: C_WARN };
  }

  if (resp1.statusCode === 403 && resp2.statusCode === 403) {
    return { text: T_FAIL, background: C_FAIL };
  }

  const resp1Ok = resp1.statusCode === 200 || resp1.statusCode === 301;
  const resp2Ok = resp2.statusCode === 200 || resp2.statusCode === 301;

  if (resp1Ok || resp2Ok) {
    let bodyToCheck = "";
    let region = "";
    let hasOhNo1 = false;
    let hasOhNo2 = false;

    if (resp1Ok) {
      const body1 = resp1.body || "";
      hasOhNo1 = body1.indexOf("Oh no!") > -1;
      const looksPlayable =
        body1.indexOf('property="og:video"') > -1 ||
        body1.indexOf('data-uia="episodes"') > -1 ||
        body1.indexOf("playableVideo") > -1;
      if (looksPlayable) {
        bodyToCheck = body1;
        region = extractRegionFromPage(body1);
      }
    }

    if (!bodyToCheck && resp2Ok) {
      const body2 = resp2.body || "";
      hasOhNo2 = body2.indexOf("Oh no!") > -1;
      const looksPlayable =
        body2.indexOf('property="og:video"') > -1 ||
        body2.indexOf('data-uia="episodes"') > -1 ||
        body2.indexOf("playableVideo") > -1;
      if (looksPlayable) {
        bodyToCheck = body2;
        region = extractRegionFromPage(body2);
      }
    }

    if (bodyToCheck) {
      if (!region) {
        const resp3 = requestTitle("https://www.netflix.com/title/80018499"); // Test Patterns
        const finalUrl = resp3.url || "";
        if (finalUrl && finalUrl.indexOf("/title/80018499") === -1) {
          const parts = finalUrl.replace(/^https?:\/\//, "").split("/");
          if (parts.length >= 4) {
            region = parts[3].split("-")[0];
          }
        }
        if (!region) {
          region = "Unknown";
        }
      }
      return { text: `${T_UNL}(${region.toLowerCase()})`, background: C_UNL };
    }

    if (hasOhNo1 && hasOhNo2) {
      return { text: T_FAIL, background: C_FAIL };
    }

    return { text: T_ORIGINAL_ONLY, background: C_WARN };
  }

  const redirects = (resp1.redirects || []).concat(resp2.redirects || []).join(" ");
  if (redirects.indexOf("browse") > -1) {
    return { text: T_FAIL, background: C_FAIL };
  }

  return { text: T_UNK, background: C_UNK };
}

export default handler;

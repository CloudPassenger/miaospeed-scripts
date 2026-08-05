// @id: primevideo
// @name: Amazon Prime Video
// @description: 检测 Amazon Prime Video 在当前地区是否可用
// @category: media
// @regions: global
// @tags: stream, video
// @priority: 5

import { C_FAIL, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_UNL } from "@/lib/constants/status";

function handler(): HandlerResult {
  const response = fetch("https://www.primevideo.com", {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_NETWORK,
    };
  }

  let body = response.body || "";

  // 若当前页面没有地区信息，尝试从页面中提取 storefront 跳转链接二次请求
  if (body.indexOf('"currentTerritory":') === -1) {
    const linkMatches = body.match(/https:\/\/www\.amazon\.[a-z.]+\/[^"'\s>]+/g) || [];
    for (let i = 0; i < linkMatches.length; i++) {
      if (linkMatches[i].indexOf("storefront") > -1) {
        const storefrontUrl = linkMatches[i].replace(/&amp;/g, "&");
        const storefrontResponse = fetch(storefrontUrl, {
          method: "GET",
          headers: {
            "User-Agent": UA_WINDOWS,
          },
          noRedir: false,
          retry: 2,
          timeout: 5000,
        });
        if (storefrontResponse) {
          body = storefrontResponse.body || "";
        }
        break;
      }
    }
  }

  // WAF 拦截 / 验证码检测
  if (body.indexOf("api-services-support@amazon.com") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }

  const regionMatch = body.match(/"currentTerritory":"([A-Z]{2})"/);
  const region = regionMatch ? regionMatch[1] : "";

  if (region) {
    return {
      text: `${T_UNL}(${region})`,
      background: C_UNL,
      status: S_UNL,
      region,
    };
  }

  return {
    text: T_FAIL,
    background: C_FAIL,
    status: S_FAIL,
  };
}

export default handler;

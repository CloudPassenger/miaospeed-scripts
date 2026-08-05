import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: spotify
// @name: Spotify
// @description: 检测 Spotify 在当前地区是否可用
// @category: media
// @regions: global
// @tags: stream, music
// @priority: 9

// 参考 oneclickvirt/UnlockTests 的实现：改用 open.spotify.com 首页解析
// appServerConfig 中的 market 字段，避免 spclient.wg.spotify.com 注册接口
// 自带的代理/VPN 检测导致误判（该接口面向反欺诈场景，与实际内容区域可用性无关）。
// https://github.com/oneclickvirt/UnlockTests/blob/main/transnation/Spotify.go

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** 纯 JS 实现的 base64 解码，避免依赖运行环境未必提供的 atob/Buffer */
function decodeBase64(input: string): string {
  const clean = input.replace(/[^A-Za-z0-9+/=]/g, "");
  let output = "";
  let i = 0;
  while (i < clean.length) {
    const enc1 = BASE64_CHARS.indexOf(clean.charAt(i++));
    const enc2 = BASE64_CHARS.indexOf(clean.charAt(i++));
    const enc3 = BASE64_CHARS.indexOf(clean.charAt(i++));
    const enc4 = BASE64_CHARS.indexOf(clean.charAt(i++));

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    output += String.fromCharCode(chr1);
    if (enc3 !== -1 && enc3 !== 64) output += String.fromCharCode(chr2);
    if (enc4 !== -1 && enc4 !== 64) output += String.fromCharCode(chr3);
  }
  return output;
}

function handler(): HandlerResult {
  const response = fetch("https://open.spotify.com/", {
    headers: {
      "User-Agent": UA_WINDOWS,
      "Accept-Language": "en",
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
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const match = response.body.match(
    /<script[^>]+id="appServerConfig"[^>]*type="text\/plain"[^>]*>([^<]+)<\/script>/
  );
  if (!match) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  let market = "";
  try {
    const decoded = decodeBase64(match[1].trim());
    const config = safeParse<{ market: string }>(decoded);
    market = config && config.market ? config.market : "";
  } catch (error) {
    market = "";
  }

  if (!market) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  return {
    text: `${T_UNL}(${market.toLowerCase()})`,
    background: C_UNL,
  };
}

export default handler;

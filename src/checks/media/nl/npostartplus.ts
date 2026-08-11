// @id: npostartplus
// @name: NPO Start Plus
// @description: 检测 NPO Start Plus 解锁状态
// @category: media
// @regions: nl
// @tags: stream, video, live
// @priority: 45

import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL, S_WARN } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/NPOStartPlus.go
type NPOTokenResponse = {
  token: string;
};

function handler(): HandlerResult {
  const tokenResp = fetch("https://npo.nl/start/api/domain/player-token?productId=LI_NL1_4188102", {
    headers: {
      "User-Agent": UA_WINDOWS,
      Referer: "https://npo.nl/start/live?channel=NPO1",
    },
    retry: 3,
    timeout: 5000,
  });

  if (!tokenResp) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_NETWORK,
    };
  }
  if (tokenResp.statusCode === 403) {
    return { text: `${T_FAIL}(WAF)`, background: C_WARN, status: S_WARN, statusReason: "waf_blocked" };
  }

  const tokenRes = safeParse<NPOTokenResponse>(tokenResp.body);
  const token = get<string>(tokenRes, "token", "");

  if (!token) {
    return {
      text: T_NA,
      background: C_NA,
      status: S_NA,
    };
  }

  const streamResp = fetch("https://prod.npoplayer.nl/stream-link", {
    method: "POST",
    body: JSON.stringify({
      profileName: "dash",
      drmType: "playready",
      referrerUrl: "https://npo.nl/start/live?channel=NPO1",
    }),
    headers: {
      "User-Agent": UA_WINDOWS,
      Authorization: token,
      Origin: "https://npo.nl",
      Referer: "https://npo.nl/",
    },
    retry: 3,
    timeout: 5000,
  });

  if (!streamResp) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_NETWORK,
    };
  }

  if (streamResp.statusCode === 403) {
    return { text: `${T_FAIL}(WAF)`, background: C_WARN, status: S_WARN, statusReason: "waf_blocked" };
  }
  if (streamResp.statusCode === 451 || streamResp.statusCode === 401) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }
  if (streamResp.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
      status: S_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
    status: S_NA,
  };
}

export default handler;

import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import {
  M_DEVICE,
  M_NETWORK,
  M_TOKEN,
  T_FAIL,
  T_NA,
  T_UNL,
} from "@/consts/text";
import { SEC_CH_UA, UA_WINDOWS } from "@/consts/ua";
import { parseCookies } from "@/utils";

// @name: 動畫瘋
// @description: 检测 Bahamut / 動畫瘋 解锁状态
// @regions: tw
// @tags: stream, video, anime
// @priority: 31

type TokenResponse = {
  animeSn?: number;
  deviceid?: string;
};

function handler(): HandlerResult {
  // 获取设备ID
  const deviceIdResponse = fetch(
    "https://ani.gamer.com.tw/ajax/getdeviceid.php",
    {
      method: "GET",
      headers: {
        "User-Agent": UA_WINDOWS,
      },
      noRedir: false,
      retry: 3,
      timeout: 15000,
    }
  );

  if (!deviceIdResponse || deviceIdResponse.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK}1)`,
      background: C_FAIL,
    };
  }

  // 命中风控/Cloudflare 拦截时会返回 HTML 而非 JSON
  if (deviceIdResponse.body.trim().indexOf("<") === 0) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  let cookies = parseCookies(deviceIdResponse.cookies);
  const deviceIdJSON = safeParse<TokenResponse>(deviceIdResponse.body);
  const deviceId = deviceIdJSON.deviceid;

  if (!deviceId) {
    return {
      text: `${T_FAIL}(${M_DEVICE})`,
      background: C_FAIL,
    };
  }

  // 检查全球可看内容是否可播放
  const tokenResponse = fetch(
    `https://ani.gamer.com.tw/ajax/token.php?adID=89422&sn=37783&device=${deviceId}`,
    {
      method: "GET",
      headers: {
        "User-Agent": UA_WINDOWS,
      },
      cookies: cookies,
      noRedir: false,
      retry: 3,
      timeout: 15000,
    }
  );
  if (!tokenResponse || tokenResponse.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK}2)`,
      background: C_FAIL,
    };
  }
  cookies = parseCookies(tokenResponse.cookies);
  const tokenData = safeParse<TokenResponse>(tokenResponse.body);

  if (!tokenData.animeSn) {
    return {
      text: `${T_FAIL}(${M_TOKEN})`,
      background: C_FAIL,
    };
  }

  // 再检查台湾专属内容是否可播放，用于区分"全球解锁"与"台湾解锁"
  const twOnlyResponse = fetch(
    `https://ani.gamer.com.tw/ajax/token.php?adID=89422&sn=38832&device=${deviceId}`,
    {
      method: "GET",
      headers: {
        "User-Agent": UA_WINDOWS,
      },
      cookies: cookies,
      noRedir: false,
      retry: 3,
      timeout: 15000,
    }
  );

  if (twOnlyResponse && twOnlyResponse.statusCode === 200) {
    const twOnlyData = safeParse<TokenResponse>(twOnlyResponse.body);
    if (twOnlyData.animeSn) {
      return {
        text: `${T_UNL}(TW)`,
        background: C_UNL,
      };
    }
  }

  // 台湾专属内容不可播放，仅解锁了全球内容，用 cdn-cgi/trace 获取真实地区
  const traceResponse = fetch("https://ani.gamer.com.tw/cdn-cgi/trace", {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
      accept: "*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "zh-TW,zh;q=0.9",
      "sec-ch-ua": SEC_CH_UA,
    },
    cookies: cookies,
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (traceResponse && traceResponse.statusCode === 200) {
    const match = traceResponse.body.match(/loc=([A-Z]{2})/);
    if (match) {
      return {
        text: `${T_UNL}(${match[1]})`,
        background: C_UNL,
      };
    }
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;

import { C_FAIL, C_NA, C_UNL, C_UNK } from "@/consts/colors";
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

function handler(): HandlerResult  {
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

  let cookies = parseCookies(deviceIdResponse.cookies);
  const deviceIdContent = deviceIdResponse.body;
  const deviceIdJSON = safeParse(deviceIdContent);
  const deviceId = deviceIdJSON.deviceid;

  if (!deviceId) {
    return {
      text: `$${T_FAIL}(${M_DEVICE})`,
      background: C_FAIL,
    };
  }

  // 检查动画解锁状态
  const sn = "37783";
  const tokenResponse = fetch(
    `https://ani.gamer.com.tw/ajax/token.php?adID=89422&sn=${sn}&device=${deviceId}`,
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
  const tokenContent = tokenResponse.body;
  const tokenData = safeParse(tokenContent);
  const animeSn = tokenData.animeSn;

  if (!animeSn) {
    return {
      text: `${T_FAIL}(${M_TOKEN})`,
      background: C_NA,
    };
  }

  // 获取地区信息
  const regionResponse = fetch("https://ani.gamer.com.tw/", {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
      accept: "*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "zh-TW,zh;q=0.9",
      "sec-ch-ua": SEC_CH_UA,
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-model": '""',
      "sec-ch-ua-platform": '"Windows"',
      "sec-ch-ua-platform-version": '"15.0.0"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
    },
    cookies: cookies,
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (!regionResponse || regionResponse.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK}3)`,
      background: C_FAIL,
    };
  }

  const regionContent = regionResponse.body;
  const region = regionContent.match(/data-geo="([^"]+)/)?.[1];

  if (region) {
    return {
      text: `${T_UNL}(${region})`,
      background: C_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;
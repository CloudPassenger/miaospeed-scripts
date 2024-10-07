import { C_FAIL, C_UNL, C_NA, C_WARN } from "@/consts/colors";
import {
  M_NETWORK,
  M_RESPONSE,
  T_FAIL,
  T_OVERSEAS,
  T_UNL,
} from "@/consts/text";
import { UA_ANDROID } from "@/consts/ua";

// @name: Abema
// @description: 检测 Abema TV 网络电视解锁状态
// @regions: jp
// @tags: stream, video, live
// @priority: 40

type ResponseBody = {
  isoCountryCode?: string;
  timeZone?: string;
  utcOffset?: string;
  cdnRegionUrl?: string;
  division?: number;
};

function handler(): HandlerResult {
  const response = fetch("https://api.abema.io/v1/ip/check?device=android", {
    method: "GET",
    headers: { "user-agent": UA_ANDROID },
    noRedir: true,
    retry: 3,
    timeout: 5000,
  });

  if (!response || response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const content = response.body;
  const data = safeParse<ResponseBody>(content);

  if (!data) {
    return {
      text: `${T_FAIL}(${M_RESPONSE})`,
      background: C_FAIL,
    };
  }

  const region = data.isoCountryCode;

  if (!region) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  if (region === "JP") {
    return {
      text: `${T_UNL}(${region})`,
      background: C_UNL,
    };
  } else {
    return {
      text: `${T_OVERSEAS}(${region})`,
      background: C_WARN,
    };
  }
}

export default handler;

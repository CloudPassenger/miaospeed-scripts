// @id: abema
// @name: Abema
// @description: 检测 Abema TV 网络电视解锁状态
// @category: media
// @regions: jp
// @tags: stream, video, live
// @priority: 40

import { C_FAIL, C_UNL, C_NA, C_WARN } from "@/lib/constants/colors";
import { M_IP_BLOCK, M_NETWORK, M_RESPONSE, T_FAIL, T_OVERSEAS, T_UNL } from "@/lib/constants/text";
import { UA_ANDROID } from "@/lib/constants/ua";

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

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }
  if (response.statusCode === 403) {
    return {
      text: `${T_FAIL}(${M_IP_BLOCK})`,
      background: C_FAIL,
    };
  }
  if (response.statusCode !== 200) {
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

  if (!data.isoCountryCode && (content.indexOf("blocked_location") > -1 || content.indexOf("anonymous_ip") > -1)) {
    return {
      text: T_FAIL,
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

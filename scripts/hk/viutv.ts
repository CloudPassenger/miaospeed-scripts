import { T_FAIL, T_UNL, M_NETWORK, M_STATUS, M_PARSE } from "@/consts/text";
import { C_FAIL, C_UNL } from "@/consts/colors";
import { UA_ANDROID } from "@/consts/ua";

// @name: ViuTV
// @description: 检测 ViuTV 本地内容 解锁状态
// @regions: hk
// @tags: stream, video
// @priority: 20

function handler() {
  const response = fetch("https://api.viu.now.com/p8/3/getLiveURL", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": UA_ANDROID,
    },
    body: safeStringify({
      callerReferenceNo: "20210726112323",
      contentId: "099",
      contentType: "Channel",
      channelno: "099",
      mode: "prod",
      deviceId: "29b3cb117a635d5b56",
      deviceType: "ANDROID_WEB",
    }),
    noRedir: false,
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  } else if (response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_STATUS})`,
      background: C_FAIL,
    };
  } else {
    const content = response.body;
    const data = safeParse(content);
    if (!data) {
      return {
        text: `${T_FAIL}(${M_PARSE})`,
        background: C_FAIL,
      };
    }

    const result = data.responseCode;

    switch (result) {
      case "GEO_CHECK_FAIL":
        return {
          text: T_FAIL,
          background: C_FAIL,
        };
      case "SUCCESS":
        return {
          text: T_UNL,
          background: C_UNL,
        };
      default:
        return {
          text: T_FAIL,
          background: C_FAIL,
        };
    }
  }
};

export default handler;

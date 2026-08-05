// @id: catchplay
// @name: CatchPlay+
// @description: 检测 CatchPlay+ 解锁状态
// @category: media
// @regions: tw
// @tags: stream, video, movie
// @priority: 39

import { C_FAIL, C_UNL } from "@/lib/constants/colors";
import { M_STATUS, M_NETWORK, M_PARSE, T_FAIL, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_UNL } from "@/lib/constants/status";

const AUTHORIZATION_HEADER = "Basic NTQ3MzM0NDgtYTU3Yi00MjU2LWE4MTEtMzdlYzNkNjJmM2E0Ok90QzR3elJRR2hLQ01sSDc2VEoy";

function handler(): HandlerResult {
  const response = fetch("https://sunapi.catchplay.com/geo", {
    method: "GET",
    headers: {
      authorization: AUTHORIZATION_HEADER,
      "user-agent": UA_WINDOWS,
    },
    noRedir: true,
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
  } else if (response.statusCode === 200) {
    const content = response.body;
    const data = safeParse(content);

    if (!data) {
      return {
        text: `${T_FAIL}(${M_PARSE})`,
        background: C_FAIL,
        status: S_FAIL,
        error: M_PARSE,
      };
    }

    const resultCode = data.code;
    if (resultCode === "100016") {
      return {
        text: T_FAIL,
        background: C_FAIL,
        status: S_FAIL,
      };
    }

    const isoCode = get<string>(data, "data.isoCode");
    if (isoCode) {
      return {
        text: `${T_UNL}(${isoCode})`,
        background: C_UNL,
        status: S_UNL,
        region: isoCode,
      };
    }

    return {
      text: `${T_FAIL}(${resultCode || M_STATUS})`,
      background: C_FAIL,
      status: S_FAIL,
      error: resultCode || M_STATUS,
    };
  } else {
    return {
      text: `${T_FAIL}(${response.statusCode})`,
      background: C_FAIL,
      status: S_FAIL,
    };
  }
}

export default handler;

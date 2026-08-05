// @id: mytvsuper
// @name: TVB
// @description: 检测 TVB 本地内容 解锁状态
// @category: media
// @regions: hk
// @tags: stream, video
// @priority: 20

import { C_NA, C_UNL, C_FAIL, C_UNK } from "@/lib/constants/colors";
import { T_FAIL, T_NA, T_UNK, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNK, S_UNL } from "@/lib/constants/status";

type ResponseBody = {
  region: number;
  country_code: string;
};

function handler(): HandlerResult {
  const response = fetch("https://www.mytvsuper.com/api/auth/getSession/self/", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: T_NA,
      background: C_NA,
      status: S_NA,
    };
  } else if (response.statusCode === 403) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  } else if (response.statusCode === 200) {
    const body = safeParse<ResponseBody>(response.body);
    const region = body.region;

    if (region === 1) {
      return {
        text: T_UNL,
        background: C_UNL,
        status: S_UNL,
      };
    } else {
      return {
        text: T_FAIL,
        background: C_FAIL,
        status: S_FAIL,
      };
    }
  } else {
    return {
      text: T_UNK,
      background: C_UNK,
      status: S_UNK,
    };
  }
}

export default handler;

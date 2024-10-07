import { C_FAIL, C_UNL } from "@/consts/colors";
import { M_NETWORK, M_PARSE, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: KKTV
// @description: 检测 KKTV 解锁状态
// @regions: tw
// @tags: stream, video, live
// @priority: 37

type ResponseBody = {
  status: {
    type: string;
    subtype?: string | null;
    message?: string | null;
  };
  data: {
    country: string | null;
    ip: string | null;
    is_allowed?: boolean;
  };
};

function handler(): HandlerResult {
  const response = fetch("https://api.kktv.me/v3/ipcheck", {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (!response || response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const body = response.body;
  const data = safeParse<ResponseBody>(body);

  if (!body || !data) {
    return {
      text: `${T_FAIL}(${M_PARSE})`,
      background: C_FAIL,
    };
  }

  const country = data.data.country;
  const isAllowed = data.data.is_allowed;

  if (isAllowed) {
    return {
      text: `${T_UNL}(${country})`,
      background: C_UNL,
    };
  } else {
    return {
      text: `${T_FAIL}(${country})`,
      background: C_FAIL,
    };
  }
}

export default handler;

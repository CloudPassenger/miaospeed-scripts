import { C_FAIL, C_UNL } from "@/consts/colors";
import { T_FAIL, M_NETWORK, M_PARSE, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Hami Video
// @description: 检测 Hami Video 解锁状态
// @regions: tw
// @tags: stream, video, live
// @priority: 33

type ResponseBody = {
  LogSN: string;
  code: string;
  msg: string;
};

function handler(): HandlerResult {
  const response = fetch(
    "https://hamivideo.hinet.net/api/play.do?id=OTT_VOD_0000249064&freeProduct=1",
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

  const code = data.code || "00000-000";

  if (code === "06001-107") {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  } else {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
}

export default handler;

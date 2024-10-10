import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, M_STATUS, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Tving
// @description: 检测 Tving 的解锁状态
// @regions: kr
// @tags: stream, ott
// @priority: 50

type ResponseBody = {
  header: {
    message: string;
    status: number;
  };
  body: {
    server: {
      time: string;
      host: string;
      port: number;
      context: string;
    };
    user: {
      id: string;
      age: number;
      type: string;
      ip: string;
      profile_no: string;
      no: string;
    };
    result: {
      code: string;
      message: string;
      sub_message: string;
      auth_type: unknown;
      content_type: unknown;
      link_url: unknown;
      link_target: unknown;
    };
    content: unknown;
    bill: unknown;
    ad: unknown;
    stream: unknown;
    adProxy: unknown;
  };
};

function handler(): HandlerResult {
  const response = fetch(
    "https://api.tving.com/v2a/media/stream/info?apiKey=1e7952d0917d6aab1f0293a063697610&mediaCode=RV60891248",
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

  if (data && data.body && data.body.result && data.body.result.code) {
    const code = data.body.result.code;
    if (code === "000") {
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
  } else {
    return {
      text: T_NA,
      background: C_NA,
    };
  }
}

export default handler;

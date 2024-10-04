import { C_NA, C_UNL, C_FAIL, C_UNK } from "@/consts/colors";
import { T_FAIL, T_NA, T_UNK, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

type ResponseBody = {
  region: number;
  country_code: string;
}

function handler(): HandlerResult {
  const response = fetch('https://www.mytvsuper.com/api/auth/getSession/self/', {
    headers: {
      'User-Agent': UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: T_NA,
      background: C_NA,
    };
  } else if (response.statusCode == 200) {
    const body = safeParse<ResponseBody>(response.body);
    const region = body.region;

    if (region === 1) {
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
      text: T_UNK,
      background: C_UNK,
    };
  }
}

export default handler;
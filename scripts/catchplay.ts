import { C_FAIL, C_UNK, C_UNL } from "@/consts/colors";
import { M_STATUS, M_NETWORK, M_PARSE, T_FAIL, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

const AUTHORIZATION_HEADER =
  "Basic NTQ3MzM0NDgtYTU3Yi00MjU2LWE4MTEtMzdlYzNkNjJmM2E0Ok90QzR3elJRR2hLQ01sSDc2VEoy";

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
    };
  } else if (response.statusCode === 200) {
    const content = response.body;
    const data = safeParse(content);

    if (!data) {
      return {
        text: `${T_FAIL}(${M_PARSE})`,
        background: C_FAIL,
      };
    }

    const resultCode = data.code;
    if (!resultCode) {
      return {
        text: `${T_FAIL}(${M_STATUS})`,
        background: C_UNK,
      };
    }

    switch (resultCode) {
      case "0":
        return {
          text: T_UNL,
          background: C_UNL,
        };
      case "100016":
        return {
          text: T_FAIL,
          background: C_FAIL,
        };
      default:
        return {
          text: `${T_FAIL}(${resultCode})`,
          background: C_FAIL,
        };
    }
  } else {
    return {
      text: `${T_FAIL}(${response.statusCode})`,
      background: C_FAIL,
    };
  }
};

export default handler;

import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

function handler(): HandlerResult {
  const response = fetch(
    "https://hoytv-live-stream.hoy.tv/ch78/index-fhd.m3u8",
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

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }
  if (response.statusCode === 403) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  } else if (response.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  } else {
    return {
      text: T_NA,
      background: C_NA,
    };
  }
}

export default handler;

import { C_NA, C_UNL, C_FAIL, C_UNK } from "@/consts/colors";
import { T_FAIL, T_NA, T_UNK, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

type ResponseBody = {
  responseCode: string;
  callerReferenceNo: string;
  serverReferenceNo: string;
  elapsedTime: number;
};

function handler(): HandlerResult {
  const response = fetch("https://webtvapi.nowe.com/16/1/getVodURL", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": UA_WINDOWS,
    },
    body: JSON.stringify({
      contentId: "202403181904703",
      contentType: "Vod",
      pin: "",
      deviceName: "Browser",
      deviceId: "w-663bcc51-913c-913c-913c-913c913c",
      deviceType: "WEB",
      secureCookie: null,
      callerReferenceNo: "W17151951620081575",
      profileId: null,
      mupId: null,
    }),
    noRedir: false,
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: T_NA,
      background: C_NA,
    };
  } else if (response.statusCode === 200) {
    const body = response.body;
    const data = safeParse<ResponseBody>(body);

    if (data.responseCode === "GEO_CHECK_FAIL") {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    } else if (
      data.responseCode === "SUCCESS" ||
      data.responseCode === "PRODUCT_INFORMATION_INCOMPLETE"
    ) {
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

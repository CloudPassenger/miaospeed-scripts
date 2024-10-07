import { C_FAIL, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

function handler(): HandlerResult {
  const response = fetch("https://www.litv.tv/api/get-urls-no-auth", {
    method: "POST",
    body: JSON.stringify({
      AssetId: "vod71211-000001M001_1500K",
      MediaType: "vod",
      puid: "d66267c2-9c52-4b32-91b4-3e482943fe7e",
    }),
    headers: {
      "Content-Type": "application/json",
      Origin: "https://www.litv.tv",
      Referer: "https://www.litv.tv/drama/watch/VOD00331042",
      Priority: "u=1, i",
      "User-Agent": UA_WINDOWS,
    },
    cookies: {
      PUID: "34eb9a17-8834-4f83-855c-69382fd656fa",
      L_PUID: "34eb9a17-8834-4f83-855c-69382fd656fa",
      "device-id": "f4d7faefc54f476bb2e7e27b7482469a",
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

  if (body.indexOf("OutsideRegionError") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  } else {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
}

export default handler;

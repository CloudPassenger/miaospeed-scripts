import { C_FAIL, C_UNL } from "@/consts/colors";
import { M_NETWORK, M_STATUS, T_FAIL, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Wavve
// @description: 检测 Wavve 的解锁状态
// @regions: kr
// @tags: stream, ott
// @priority: 50

function handler(): HandlerResult {
  const response = fetch(
    "https://apis.wavve.com/fz/streaming?device=pc&partner=pooq&apikey=E5F3E0D30947AA5440556471321BB6D9&credential=none&service=wavve&pooqzone=none&region=kor&drm=pr&targetage=all&contentid=MV_C3001_C300000012559&contenttype=movie&hdr=sdr&videocodec=avc&audiocodec=ac3&issurround=n&format=normal&withinsubtitle=n&action=dash&protocol=dash&quality=auto&deviceModelId=Windows%2010&guid=1a8e9c88-6a3b-11ed-8584-eed06ef80652&lastplayid=none&authtype=cookie&isabr=y&ishevc=n",
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

  if (response.statusCode !== 200) {
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

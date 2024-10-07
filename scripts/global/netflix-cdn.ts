import { C_NA, C_FAIL, C_UNL, C_UNK, C_WARN } from "@/consts/colors";
import {
  M_IP_BLOCK,
  M_STATUS,
  T_FAIL,
  T_NA,
  T_UNK,
  T_UNL,
} from "@/consts/text";
import { SEC_CH_UA, UA_WINDOWS } from "@/consts/ua";

// @name: Netflix CDN
// @description: 检测 Netflix CDN 地理位置
// @regions: global
// @tags: stream, video
// @priority: 2

type Location = {
  city: string;
  country: string;
};
type Client = {
  ip: string;
  asn: string;
  location: Location;
};
type Target = {
  name: string;
  url: string;
  location: Location;
};

interface ResponseBody {
  client: Client;
  targets: Target[];
}

function handler(): HandlerResult {
  const response = fetch(
    "https://api.fast.com/netflix/speedtest/v2?https=true&token=YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm&urlCount=5",
    {
      method: "GET",
      headers: {
        Accept: "*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-CH-UA": SEC_CH_UA,
        "Sec-CH-UA-Mobile": "?0",
        "Sec-CH-UA-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": UA_WINDOWS,
      },
      noRedir: true,
      retry: 3,
      timeout: 15000,
    }
  );

  if (!response) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }

  if (response.statusCode === 403) {
    return {
      text: `${T_FAIL}(${M_IP_BLOCK})`,
      background: C_FAIL,
    };
  }

  const body = response.body;
  const result = safeParse<ResponseBody>(body);

  if (!result) {
    return {
      text: `${T_FAIL}(${M_STATUS})`,
      background: C_FAIL,
    };
  }

  const country = result?.targets?.[0]?.location?.country;
  if (country) {
    return {
      text: `${T_UNL}(${country})`,
      background: C_UNL,
    };
  }

  return {
    text: T_UNK,
    background: C_UNK,
  };
}

export default handler;

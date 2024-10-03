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

const T_ORIGINAL_ONLY = "仅自制";

/*
Example: 
{"client":{"ip":"143.47.226.18","asn":"31898","location":{"city":"London","country":"GB"}},"targets":[{"name":"https://ipv4-c075-lhr005-ix.1.oca.nflxvideo.net/speedtest?c=gb&n=31898&v=82&e=1727966875&t=ywvU7QOITULqTMOpDMbayU4ZPm0ldKjCXmhzUA","url":"https://ipv4-c075-lhr005-ix.1.oca.nflxvideo.net/speedtest?c=gb&n=31898&v=82&e=1727966875&t=ywvU7QOITULqTMOpDMbayU4ZPm0ldKjCXmhzUA","location":{"city":"Slough","country":"GB"}},{"name":"https://ipv4-c071-lhr005-ix.1.oca.nflxvideo.net/speedtest?c=gb&n=31898&v=82&e=1727966875&t=WnaXzpaHYWsx4vU2TjX-nuqnHR229CYylwKZvg","url":"https://ipv4-c071-lhr005-ix.1.oca.nflxvideo.net/speedtest?c=gb&n=31898&v=82&e=1727966875&t=WnaXzpaHYWsx4vU2TjX-nuqnHR229CYylwKZvg","location":{"city":"Slough","country":"GB"}},{"name":"https://ipv4-c141-lhr004-ix.1.oca.nflxvideo.net/speedtest?c=gb&n=31898&v=205&e=1727966875&t=hsqeAuDZmADgB60P5ShSKx4ZEIEZXRdJCzalPg","url":"https://ipv4-c141-lhr004-ix.1.oca.nflxvideo.net/speedtest?c=gb&n=31898&v=205&e=1727966875&t=hsqeAuDZmADgB60P5ShSKx4ZEIEZXRdJCzalPg","location":{"city":"London","country":"GB"}},{"name":"https://ipv4-c108-arn001-ix.1.oca.nflxvideo.net/speedtest?c=gb&n=31898&v=198&e=1727966875&t=UkHC1K07ceC1LdzBBjzrgaxpL4Ov27TBb-5chA","url":"https://ipv4-c108-arn001-ix.1.oca.nflxvideo.net/speedtest?c=gb&n=31898&v=198&e=1727966875&t=UkHC1K07ceC1LdzBBjzrgaxpL4Ov27TBb-5chA","location":{"city":"Stockholm","country":"SE"}},{"name":"https://ipv4-c113-arn001-ix.1.oca.nflxvideo.net/speedtest?c=gb&n=31898&v=35&e=1727966875&t=XTpXUlzT3YyW2rak49STsqFuOL_afHO4fTMFhQ","url":"https://ipv4-c113-arn001-ix.1.oca.nflxvideo.net/speedtest?c=gb&n=31898&v=35&e=1727966875&t=XTpXUlzT3YyW2rak49STsqFuOL_afHO4fTMFhQ","location":{"city":"Stockholm","country":"SE"}}]}
*/

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

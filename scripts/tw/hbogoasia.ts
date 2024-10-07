import { C_FAIL, C_UNL, C_UNK } from "@/consts/colors";
import { M_NETWORK, M_PARSE, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

type ResponseBody = {
  territory?: string;
  country?: string;
  continent?: string;
  city?: Record<string, string>;
  tv: boolean;
  channelPartnerIds: string[];
  ip: string;
};

function handler(): HandlerResult {
  const response = fetch(
    "https://api2.hbogoasia.com/v1/geog?lang=undefined&version=0&bundleId=www.hbogoasia.com",
    {
      method: "GET",
      headers: {
        "User-Agent": UA_WINDOWS,
      },
      noRedir: false,
      retry: 3,
      timeout: 5000,
    }
  );

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  } else if (response.statusCode === 200) {
    const content = response.body;
    const data = safeParse<ResponseBody>(content);

    if (!data) {
      return {
        text: `${T_FAIL}(${M_PARSE})`,
        background: C_FAIL,
      };
    }

    // Extract JSON data
    const territory = data.territory;
    const region = data.country;

    if (!territory) {
      return {
        text: `${T_FAIL}`,
        background: C_FAIL,
      };
    }

    // If region is found
    if (region) {
      return {
        text: `${T_UNL}(${region})`,
        background: C_UNL,
      };
    } else {
      return {
        text: `${T_FAIL}`,
        background: C_FAIL,
      };
    }
  } else {
    return {
      text: T_NA,
      background: C_UNK,
    };
  }
}

export default handler;

import { C_FAIL, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

function handler(): HandlerResult {
  // Send a request to the Google Gemini URL
  const response = fetch("https://gemini.google.com", {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 5000,
  });

  // Check if the content is not available
  if (!response || response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }
  const tmpResult = response.body;
  println(tmpResult);
  const isUnlocked = tmpResult.includes("45631641,null,true");
  const countryMatch = tmpResult.match(/,2,1,200,"([A-Z]{3})"/);
  const countryCode = countryMatch ? countryMatch[1] : "";

  if (isUnlocked && countryCode) {
    return {
      text: `${T_UNL}(${countryCode})`,
      background: C_UNL,
    };
  } else if (isUnlocked) {
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
}

export default handler;

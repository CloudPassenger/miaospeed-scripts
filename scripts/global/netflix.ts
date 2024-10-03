import { C_NA, C_FAIL, C_UNL, C_UNK, C_WARN } from "@/consts/colors";
import { T_FAIL, T_NA, T_UNK, T_UNL } from "@/consts/text";
import { SEC_CH_UA, UA_WINDOWS } from "@/consts/ua";

const T_ORIGINAL_ONLY = "仅自制";

function handler(): HandlerResult {
  const testUrls = [
    "https://www.netflix.com/title/81280792", // Originals
    "https://www.netflix.com/title/70143836", // Breaking Bad
    "https://www.netflix.com/title/80018499", // Test
  ];

  const responses = testUrls.map((url) =>
    fetch(url, {
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
    })
  );

  const [resp1, resp2, resp3] = responses;

  if (resp1.statusCode === 404 && resp2.statusCode === 404) {
    return { text: T_ORIGINAL_ONLY, background: C_WARN };
  }

  if (resp1.statusCode === 403 && resp2.statusCode === 403) {
    return { text: T_FAIL, background: C_FAIL };
  }

  if (
    resp1.statusCode === 200 ||
    resp1.statusCode === 301 ||
    resp2.statusCode === 200 ||
    resp2.statusCode === 301
  ) {
    const location = resp3.headers["location"];
    if (!location) {
      return { text: `${T_UNL}(US)`, background: C_UNL };
    }

    const match = location.match(/\/title\/[^\/]+\/([^\/]+)/);
    if (match && match[1]) {
      const region = match[1].split("-")[0];
      return { text: `${T_UNL}(${region})`, background: C_UNL };
    }
  }

  return { text: T_UNK, background: C_UNK };
}

export default handler;
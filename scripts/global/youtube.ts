import { C_FAIL, C_UNK, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_UNK, T_UNL } from "@/consts/text";

function handler(): HandlerResult {
  const response = fetch("https://www.youtube.com/premium", {
    method: "GET",
    cookies: {
      YSC: "BiCUU3-5Gdk",
      CONSENT: "YES+cb.20220301-11-p0.en+FX+700",
      GPS: "1",
      VISITOR_INFO1_LIVE: "4VwPMkB7W5A",
      SOCS: "CAISOAgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjQwNTIxLjA3X3AxGgV6aC1DTiACGgYIgNTEsgY",
      _gcl_au: "1.1.1809531354.1646633279",
      PREF: "tz=Asia.Shanghai",
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

  if (/www.google.cn/.test(body)) {
    return {
      text: `${T_FAIL}(CN)`,
      background: C_FAIL,
    };
  }

  if (/Premium is not available in your country/.test(body)) {
    return {
      text: `${T_FAIL}`,
      background: C_FAIL,
    };
  }

  let region = "";
  if (/"countryCode":"(.*?)"/.test(body)) {
    region = body.match(/"countryCode":"(.*?)"/)[1];
    return {
      text: `${T_UNL}(${region.toUpperCase()})`,
      background: C_UNL,
    };
  }

  if (
    /YouTube and YouTube Music ad-free, offline, and in the background/.test(
      body
    )
  ) {
    return {
      text: `${T_UNL}(US)`,
      background: C_UNL,
    };
  }

  return {
    text: `${T_UNK}`,
    background: C_UNK,
  };
}

export default handler;

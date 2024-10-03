import { C_NA, C_FAIL, C_UNL } from "@/consts/colors";
import { M_IP_BLOCK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

const cookie =
  "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange&latitude=0&longitude=0&platform=browser&subject_token=DISNEYASSERTION&subject_token_type=urn%3Abamtech%3Aparams%3Aoauth%3Atoken-type%3Adevice";
const gql =
  '{"query":"mutation refreshToken($input: RefreshTokenInput!) {refreshToken(refreshToken: $input) {activeSession {sessionId}}}","variables":{"input":{"refreshToken":"ILOVEDISNEY"}}}';

function handler(): HandlerResult {
  try {
    // First request
    const deviceResponse = fetch(
      "https://disney.api.edge.bamgrid.com/devices",
      {
        method: "POST",
        headers: {
          authorization:
            "Bearer ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84",
          "content-type": "application/json; charset=UTF-8",
          "user-agent": UA_WINDOWS,
        },
        body: JSON.stringify({
          deviceFamily: "browser",
          applicationRuntime: "chrome",
          deviceProfile: "windows",
          attributes: {},
        }),
        noRedir: true,
        retry: 3,
        timeout: 5000,
      }
    );

    if (!deviceResponse) {
      return {
        text: T_NA + "1",
        background: C_NA,
      };
    }
    if (
      deviceResponse.statusCode === 403 ||
      deviceResponse.body.includes("403 ERROR")
    ) {
      return {
        text: `${T_FAIL}(${M_IP_BLOCK})`,
        background: C_FAIL,
      };
    }

    const deviceData = safeParse(deviceResponse.body);
    const assertion = deviceData.assertion || "";
    const assertionCookie = cookie.replace("DISNEYASSERTION", assertion);
    if (!assertion) {
      return {
        text: T_NA + "2",
        background: C_NA,
      };
    }

    // Second request (token)
    const tokenResponse = fetch("https://disney.api.edge.bamgrid.com/token", {
      method: "POST",
      headers: {
        authorization:
          "Bearer ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84",
        "user-agent": UA_WINDOWS,
        "content-type": "application/x-www-form-urlencoded",
      },
      noRedir: true,
      retry: 3,
      timeout: 5000,
      body: assertionCookie,
    });

    if (
      !tokenResponse ||
      tokenResponse.statusCode === 403 ||
      tokenResponse.body.includes("forbidden-location")
    ) {
      return {
        text: `${T_FAIL}(${M_IP_BLOCK})`,
        background: C_FAIL,
      };
    }

    const tokenData = safeParse(tokenResponse.body);
    const refreshToken = tokenData.refresh_token || "";
    if (!refreshToken) {
      return {
        text: T_NA + "3",
        background: C_NA,
      };
    }
    // Third request (graph)
    const payload = gql.replace("ILOVEDISNEY", refreshToken);
    const graphResponse = fetch(
      "https://disney.api.edge.bamgrid.com/graph/v1/device/graphql",
      {
        method: "POST",
        headers: {
          "User-Agent": UA_WINDOWS,
          Authorization:
            "ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84",
        },
        body: payload,
        noRedir: true,
        retry: 3,
        timeout: 5000,
      }
    );
    if (!graphResponse) {
      return {
        text: "N/A4",
        background: C_NA,
      };
    }

    const graphData = safeParse(graphResponse.body) || {};
    var region = (
      get<string>(graphData, "extensions.sdk.session.location.countryCode") ||
      ""
    ).toLocaleUpperCase();
    const inSupportedLocation = get(
      graphData,
      "extensions.sdk.session.inSupportedLocation"
    );
    //        print("region:", region, "  inSupportedLocation: ", inSupportedLocation)

    // Preview check
    const previewResponse = fetch("https://disneyplus.com", {
      method: "GET",
      headers: { "user-agent": UA_WINDOWS },
      retry: 2,
      timeout: 5000,
    });
    let finalUrl = "https://disneyplus.com";
    try {
      finalUrl = previewResponse.redirects.pop();
    } catch (error) {
      finalUrl = "https://disneyplus.com";
    }
    const isUnavailable =
      finalUrl.includes("preview") || finalUrl.includes("unavailable");

    if (!region) {
      return {
        text: T_FAIL + "1",
        background: C_FAIL,
      };
    }
    if (isUnavailable) {
      return {
        text: T_FAIL + "2",
        background: C_FAIL,
      };
    }
    if (inSupportedLocation === false) {
      return {
        text: `${T_FAIL}(${region})`,
        background: C_FAIL,
      };
    }
    if (inSupportedLocation === true) {
      return {
        text: `${T_UNL}(${region})`,
        background: C_UNL,
      };
    }

    return {
      text: T_NA + "5",
      background: C_NA,
    };
  } catch (error) {
    println("Error:", error);
    return {
      text: T_NA,
      background: C_NA,
    };
  }
}

export default handler;

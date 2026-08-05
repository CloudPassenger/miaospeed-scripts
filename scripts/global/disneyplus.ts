import { C_NA, C_FAIL, C_UNL } from "@/consts/colors";
import { M_IP_BLOCK, M_RATE_LIMIT, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Disney+
// @description: 检测 Disney+ 解锁状态
// @regions: global
// @tags: stream, video
// @priority: 3

// 参考:
// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/DisneyPlus.go
// https://github.com/oneclickvirt/UnlockTests/blob/main/transnation/Disney.go
// https://github.com/clash-verge-rev/clash-verge-rev/blob/main/crates/clash-verge-media-unlock/src/disney_plus.rs
// 三方实现均以正则在整段响应体中提取 countryCode / inSupportedLocation，
// 而非依赖固定 JSON 路径，避免因响应结构调整导致误判。

const cookie =
  "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange&latitude=0&longitude=0&platform=browser&subject_token=DISNEYASSERTION&subject_token_type=urn%3Abamtech%3Aparams%3Aoauth%3Atoken-type%3Adevice";
const gql =
  '{"query":"mutation refreshToken($input: RefreshTokenInput!) {refreshToken(refreshToken: $input) {activeSession {sessionId}}}","variables":{"input":{"refreshToken":"ILOVEDISNEY"}}}';

/**
 * 兜底方案：GraphQL 主流程失败时，尝试从 disneyplus.com 首页 HTML 中提取 region 字段
 */
function regionFromMainPage(): string {
  const response = fetch("https://www.disneyplus.com/", {
    headers: { "user-agent": UA_WINDOWS },
    retry: 2,
    timeout: 5000,
  });
  if (!response) return "";
  const match = response.body.match(/region"\s*:\s*"([^"]+)/);
  return match ? match[1].toUpperCase() : "";
}

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
        text: T_NA,
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
    if (deviceResponse.statusCode === 429) {
      return {
        text: `${T_FAIL}(${M_RATE_LIMIT})`,
        background: C_FAIL,
      };
    }

    const deviceData = safeParse(deviceResponse.body);
    const assertion = deviceData.assertion || "";
    const assertionCookie = cookie.replace("DISNEYASSERTION", assertion);
    if (!assertion) {
      return {
        text: T_NA,
        background: C_NA,
      };
    }

    // Second request (token)
    const tokenResponse = fetch("https://disney.api.edge.bamgrid.com/token", {
      method: "POST",
      headers: {
        authorization:
          "ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84",
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
    if (tokenResponse.statusCode === 429) {
      return {
        text: `${T_FAIL}(${M_RATE_LIMIT})`,
        background: C_FAIL,
      };
    }

    const tokenData = safeParse(tokenResponse.body);
    const refreshToken = tokenData.refresh_token || "";
    if (!refreshToken) {
      return {
        text: T_NA,
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
        text: T_NA,
        background: C_NA,
      };
    }

    // 与上游 Go/Rust 实现保持一致：在整段响应体中用正则提取字段，
    // 不依赖具体 JSON 嵌套路径，避免因响应结构调整导致误判
    const countryMatch = graphResponse.body.match(/"countryCode"\s*:\s*"([^"]+)/);
    const region = countryMatch ? countryMatch[1].toUpperCase() : "";
    const supportedMatch = graphResponse.body.match(
      /"inSupportedLocation"\s*:\s*(false|true)/
    );
    const inSupportedLocation = supportedMatch ? supportedMatch[1] === "true" : null;

    // GraphQL 响应异常（无 region 信息）时，回退尝试从主页 HTML 中提取地区
    if (!region) {
      const fallbackRegion = regionFromMainPage();
      if (fallbackRegion) {
        return {
          text: `${T_UNL}(${fallbackRegion})`,
          background: C_UNL,
        };
      }
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    }

    // 日本地区存在已知特例：即使 inSupportedLocation 返回 false 也已实际上线
    if (region === "JP") {
      return {
        text: `${T_UNL}(${region})`,
        background: C_UNL,
      };
    }

    // Preview check
    const previewResponse = fetch("https://disneyplus.com", {
      method: "GET",
      headers: { "user-agent": UA_WINDOWS },
      retry: 2,
      timeout: 5000,
    });
    const finalUrl = previewResponse ? previewResponse.url || "" : "";
    const isUnavailable =
      finalUrl.includes("preview") || finalUrl.includes("unavailable");

    if (isUnavailable) {
      return {
        text: T_FAIL,
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
      text: T_NA,
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

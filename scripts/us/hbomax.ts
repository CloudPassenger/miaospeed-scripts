import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";

// @name: HBO Max
// @description: 检测 HBO Max(Max) 解锁状态
// @regions: us
// @tags: stream, video
// @priority: 40

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Max.go
const HEADERS = {
  "x-device-info":
    "beam/5.0.0 (desktop/desktop; Windows/10; afbb5daa-c327-461d-9460-d8e4b3ee4a1f/da0cdd94-5a39-42ef-aa68-54cbc1b852c3)",
  "x-disco-client": "WEB:10:beam:5.2.1",
  "x-disco-params": "realm=bolt",
};

type MaxTokenResponse = {
  data: { attributes: { token: string } };
};
type MaxBootstrapResponse = {
  routing: { domain: string; tenant: string; env: string; homeMarket: string };
};
type MaxMeResponse = {
  data: { attributes: { currentLocationTerritory: string } };
};

function handler(): HandlerResult {
  const tokenResp = fetch(
    "https://default.any-any.prd.api.max.com/token?realm=bolt&deviceId=afbb5daa-c327-461d-9460-d8e4b3ee4a1f",
    {
      headers: HEADERS,
      retry: 3,
      timeout: 5000,
    }
  );

  if (!tokenResp) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const tokenRes = safeParse<MaxTokenResponse>(tokenResp.body);
  const token = get<string>(tokenRes, "data.attributes.token", "");

  if (!token) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }

  const bootstrapResp = fetch(
    "https://default.any-any.prd.api.max.com/session-context/headwaiter/v1/bootstrap",
    {
      method: "POST",
      body: "{}",
      headers: { ...HEADERS, Cookie: `st=${token}`, "Content-Type": "application/json" },
      retry: 3,
      timeout: 5000,
    }
  );

  if (!bootstrapResp) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const bootstrapRes = safeParse<MaxBootstrapResponse>(bootstrapResp.body);
  const domain = get<string>(bootstrapRes, "routing.domain", "");
  const tenant = get<string>(bootstrapRes, "routing.tenant", "");
  const env = get<string>(bootstrapRes, "routing.env", "");
  const homeMarket = get<string>(bootstrapRes, "routing.homeMarket", "");

  if (!domain || !tenant || !env || !homeMarket) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }

  const meResp = fetch(
    `https://default.${tenant}-${homeMarket}.${env}.${domain}/users/me`,
    {
      headers: { ...HEADERS, Cookie: `st=${token}` },
      retry: 3,
      timeout: 5000,
    }
  );

  if (!meResp) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const meRes = safeParse<MaxMeResponse>(meResp.body);
  const region = get<string>(meRes, "data.attributes.currentLocationTerritory", "");

  const homepageResp = fetch("https://www.max.com/", {
    noRedir: true,
    retry: 3,
    timeout: 5000,
  });

  const location = homepageResp ? homepageResp.headers["location"] || "" : "";
  if (
    !region ||
    (homepageResp &&
      homepageResp.statusCode >= 300 &&
      homepageResp.statusCode < 400 &&
      (location.indexOf("hbomax.com") > -1 || location.indexOf("geo-availability") > -1))
  ) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  return {
    text: `${T_UNL}(${region.toLowerCase()})`,
    background: C_UNL,
  };
}

export default handler;

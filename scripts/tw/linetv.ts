import { C_FAIL, C_UNL } from "@/consts/colors";
import { M_NETWORK, M_PARSE, T_FAIL, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Line TV
// @description: 检测 Line TV 解锁状态
// @regions: tw
// @tags: stream, video, live
// @priority: 35

type BodyResponse = {
  code?: number;
  message?: string;
  countryCode?: number;
};

function handler(): HandlerResult {
  // Load page first
  const pageResponse = fetch("https://www.linetv.tw/", {
    method: "GET",
    headers: {
      "user-agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (!pageResponse) {
    return {
      text: `${T_FAIL}(${M_NETWORK}1)`,
      background: C_FAIL,
    };
  }

  const pageContent = pageResponse.body;
  println(pageContent); // Make sure we got the page
  const mainJsUrlMatch = pageContent.match(
    /src="([^"]+\/main-[a-z0-9]{8}[^"]*)"/
  );
  const mainJsUrl = mainJsUrlMatch ? mainJsUrlMatch[1] : null;

  if (!mainJsUrl) {
    return {
      text: `${T_FAIL}(${M_PARSE})`,
      background: C_FAIL,
    };
  }

  // Fetch JS to get appId
  const mainJsResponse = fetch(mainJsUrl, {
    method: "GET",
    headers: {
      referer: "https://www.linetv.tw/",
      "user-agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (!mainJsResponse) {
    return {
      text: `${T_FAIL}(JS)`,
      background: C_FAIL,
    };
  }

  const mainJsContent = mainJsResponse.body;
  println(mainJsContent); // Make sure we got the JS content
  const appIdMatch = mainJsContent.match(/appId:"([^"]+)"/);
  const appId = appIdMatch ? appIdMatch[1] : null;

  // Access API with appId
  const apiResponse = fetch(
    `https://www.linetv.tw/api/part/11829/eps/1/part?appId=${appId}&productType=FAST&version=10.38.0`,
    {
      method: "GET",
      headers: {
        "user-agent": UA_WINDOWS,
      },
      noRedir: false,
      retry: 3,
      timeout: 15000,
    }
  );

  if (!apiResponse) {
    return {
      text: `${T_FAIL}(API)`,
      background: C_FAIL,
    };
  }

  const apiData = safeParse<BodyResponse>(apiResponse.body);

  if (!apiData) {
    return {
      text: `${T_FAIL}(${M_PARSE})`,
      background: C_FAIL,
    };
  }
  const countryCode = apiData.countryCode;

  if (countryCode === 228) {
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

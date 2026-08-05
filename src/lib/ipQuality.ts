import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, M_RESPONSE, T_FAIL, T_NA, T_UNK } from "@/lib/constants/text";
import { UA_CURL } from "@/lib/constants/ua";

interface IPQueryResponse {
  ip?: string;
  isp?: {
    asn?: string;
    org?: string;
    isp?: string;
  };
  location?: {
    country?: string;
    country_code?: string;
    city?: string;
    state?: string;
  };
  risk?: {
    is_mobile?: boolean;
    is_vpn?: boolean;
    is_tor?: boolean;
    is_proxy?: boolean;
    is_datacenter?: boolean;
  };
}

function getPublicIp(protocol: "4" | "6"): string | null {
  const response = fetch(`https://api${protocol}.ipify.org`, {
    method: "GET",
    headers: {
      "User-Agent": UA_CURL,
    },
    retry: 3,
    timeout: 15000,
  });

  if (!response || response.statusCode !== 200) return null;

  const ip = response.body.replace(/\s+/g, "").trim();
  return ip || null;
}

function formatQuality(risk: IPQueryResponse["risk"]): string {
  const labels: string[] = [];

  if (risk?.is_datacenter) labels.push("机房");
  if (risk?.is_mobile) labels.push("移动");
  if (risk?.is_vpn) labels.push("VPN");
  if (risk?.is_proxy) labels.push("代理");
  if (risk?.is_tor) labels.push("Tor");

  return labels.length > 0 ? labels.join("/") : "普通";
}

function queryIpQuality(protocol: "4" | "6"): HandlerResult {
  const ip = getPublicIp(protocol);

  if (!ip) {
    return {
      text: `${T_NA} - 无IPv${protocol}`,
      background: C_NA,
    };
  }

  const response = fetch(`https://api.ipquery.io/${ip}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": UA_CURL,
    },
    retry: 3,
    timeout: 15000,
  });

  if (!response || response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const data = safeParse<IPQueryResponse>(response.body);
  if (!data?.ip || !data.isp || !data.location) {
    return {
      text: `${T_FAIL}(${M_RESPONSE})`,
      background: C_FAIL,
    };
  }

  const isp = data.isp.isp || data.isp.org || T_UNK;
  const rawAsn = data.isp.asn || T_UNK;
  const asn = rawAsn === T_UNK || rawAsn.indexOf("AS") === 0
    ? rawAsn
    : `AS${rawAsn}`;
  const city = data.location.city || data.location.state || T_UNK;
  const country = data.location.country_code || data.location.country || T_UNK;

  return {
    text: `${data.ip} - ${isp} (${asn}) - ${city}, ${country} - ${formatQuality(data.risk)}`,
    background: C_UNL,
  };
}

export { queryIpQuality };

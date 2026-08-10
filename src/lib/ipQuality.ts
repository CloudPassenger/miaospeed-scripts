import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, M_RESPONSE, T_FAIL, T_NA, T_UNK } from "@/lib/constants/text";
import { UA_CURL } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL } from "@/lib/constants/status";

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

interface IpApiIsEntity {
  type?: string;
  abuser_score?: string;
}

interface IpApiIsResponse {
  is_mobile?: boolean;
  is_satellite?: boolean;
  is_crawler?: boolean | string;
  is_datacenter?: boolean;
  is_tor?: boolean;
  is_proxy?: boolean;
  is_vpn?: boolean;
  is_abuser?: boolean;
  company?: IpApiIsEntity;
  asn?: IpApiIsEntity;
}

// ipapi.is 的 company.type / asn.type 取值，参考 https://ipapi.is/developers.html
const IP_TYPE_LABELS: Record<string, string> = {
  business: "商业",
  hosting: "机房",
  education: "教育",
  government: "政府",
  banking: "银行",
  isp: "ISP",
};

// ipapi.is 的 abuser_score 附带的风险等级文案
const RISK_LEVEL_LABELS: Record<string, string> = {
  "very low": "极低",
  low: "低",
  elevated: "较高",
  suspicious: "可疑",
  high: "高",
  "very high": "极高",
};

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

/**
 * 补充查询 ipapi.is 的风险数据（IP类型属性、风险评分、风险因子）
 * 携带 Origin 头以获取完整字段，与匿名精简响应区分，参考 xykt/IPQuality 脚本的做法
 * 该接口失败不应影响主查询结果，因此调用方需自行容错
 */
function queryIpRisk(ip: string): IpApiIsResponse | null {
  const response = fetch(`https://api.ipapi.is/?q=${ip}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Origin: "https://ipapi.is",
      "User-Agent": UA_CURL,
    },
    retry: 2,
    timeout: 10000,
  });

  if (!response || response.statusCode !== 200) return null;

  return safeParse<IpApiIsResponse>(response.body) || null;
}

function formatIpType(risk: IpApiIsResponse | null): string {
  const rawType = risk?.company?.type || risk?.asn?.type;
  if (!rawType) return T_UNK;

  return IP_TYPE_LABELS[rawType.toLowerCase()] || T_UNK;
}

function formatRiskScore(risk: IpApiIsResponse | null): string {
  const raw = risk?.company?.abuser_score || risk?.asn?.abuser_score;
  if (!raw) return T_UNK;

  const matched = raw.match(/^([\d.]+)\s*\(([^)]+)\)$/);
  if (!matched) return T_UNK;

  const percent = (parseFloat(matched[1]) * 100).toFixed(2);
  const level = RISK_LEVEL_LABELS[matched[2].toLowerCase()] || matched[2];
  return `${percent}% (${level}风险)`;
}

/**
 * 合并两个数据源的风险因子标签
 * ipquery.io 与 ipapi.is 均提供机房/移动/VPN/代理/Tor 这五项基础信号，为避免重复查询同一信号，
 * 这五项只取 ipquery.io（主查询，公开接口，无需特殊请求头）的结果；
 * ipapi.is 仅贡献其独有的卫星、滥用、爬虫三项
 */
function formatRiskFactors(base: IPQueryResponse["risk"], extra: IpApiIsResponse | null): string {
  const labels: string[] = [];

  if (base?.is_datacenter) labels.push("机房");
  if (base?.is_mobile) labels.push("移动");
  if (extra?.is_satellite) labels.push("卫星");
  if (base?.is_vpn) labels.push("VPN");
  if (base?.is_proxy) labels.push("代理");
  if (base?.is_tor) labels.push("Tor");
  if (extra?.is_abuser) labels.push("滥用");
  if (extra?.is_crawler) labels.push(typeof extra.is_crawler === "string" ? `爬虫(${extra.is_crawler})` : "爬虫");

  return labels.length > 0 ? labels.join("/") : "普通";
}

function queryIpQuality(protocol: "4" | "6"): HandlerResult {
  const ip = getPublicIp(protocol);

  if (!ip) {
    return {
      text: `${T_NA} - 无IPv${protocol}`,
      background: C_NA,
      status: S_NA,
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
      status: S_FAIL,
      error: M_NETWORK,
    };
  }

  const data = safeParse<IPQueryResponse>(response.body);
  if (!data?.ip || !data.isp || !data.location) {
    return {
      text: `${T_FAIL}(${M_RESPONSE})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_RESPONSE,
    };
  }

  const isp = data.isp.isp || data.isp.org || T_UNK;
  const rawAsn = data.isp.asn || T_UNK;
  const asn = rawAsn === T_UNK || rawAsn.indexOf("AS") === 0 ? rawAsn : `AS${rawAsn}`;
  const city = data.location.city || data.location.state || T_UNK;
  const country = data.location.country_code || data.location.country || T_UNK;

  const ipRisk = queryIpRisk(data.ip);
  const risk = formatRiskFactors(data.risk, ipRisk);
  const ipType = formatIpType(ipRisk);
  const riskScore = formatRiskScore(ipRisk);

  return {
    text: `${data.ip} - ${isp} (${asn}) - ${city}, ${country} - ${risk}`,
    background: C_UNL,
    status: S_UNL,
    region: country,
    extra: [
      { key: "ip", label: "IP地址", value: data.ip, type: "string" },
      { key: "isp", label: "运营商", value: isp, type: "string" },
      { key: "asn", label: "ASN", value: asn, type: "string" },
      { key: "city", label: "城市", value: city, type: "string" },
      { key: "country", label: "国家/地区", value: country, type: "string" },
      { key: "type", label: "IP类型", value: ipType, type: "string" },
      { key: "score", label: "风险评分", value: riskScore, type: "string" },
      { key: "risk", label: "风险因子", value: risk, type: "string" },
    ],
  };
}

export { queryIpQuality };

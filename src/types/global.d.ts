/**
 * 内置函数：安全的JSON.stringify
 *
 * @param {*} data
 * @return {*}  {string}
 */
declare function safeStringify(data: any): string;

/**
 * 内置函数：安全的JSON.parse
 *
 * @template T
 * @param {string} data
 * @return {*}  {T}
 */
declare function safeParse<T = any>(data: string): T;

/**
 * 命令行打印输出
 *
 * @param {*} [message]
 * @param {...any[]} optionalParams
 */
declare function println(message?: any, ...optionalParams: any[]): void;

/**
 * 内置函数，用于对象解析
 * @param data
 * @param path
 * @param defaults
 */
declare function get<T = any>(data: any, path: string, defaults?: T): T;

/**
 * 脚本运行的基础返回值
 *
 * @interface HandlerBasicResult
 */
interface HandlerBasicResult {
  /**
   * 显示文本
   *
   * @type {string}
   * @memberof HandlerBasicResult
   */
  text: string;
  /**
   * 背景颜色
   *
   * @type {string}
   * @memberof HandlerBasicResult
   */
  background: string;
}

/**
 * 附加信息条目，用于 {@link HandlerExtendedResult.extra}
 *
 * @interface ExtraField
 */
interface ExtraField {
  /**
   * 唯一标识
   *
   * @type {string}
   * @memberof ExtraField
   */
  key: string;
  /**
   * 展示用标签
   *
   * @type {string}
   * @memberof ExtraField
   */
  label?: string;
  /**
   * 具体数值
   *
   * @type {(string | number | boolean)}
   * @memberof ExtraField
   */
  value: string | number | boolean;
  /**
   * 数值类型，用于渲染，默认为 "string"
   *
   * @type {("string" | "number" | "percent" | "bool")}
   * @memberof ExtraField
   */
  type?: "string" | "number" | "percent" | "bool";
  /**
   * 单位
   *
   * @type {string}
   * @memberof ExtraField
   */
  unit?: string;
}

/**
 * 脚本运行的扩展返回值，在基础字段之上追加可选的扩展字段，用于更丰富的展示
 *
 * @interface HandlerExtendedResult
 * @extends {HandlerBasicResult}
 */
interface HandlerExtendedResult extends HandlerBasicResult {
  /**
   * 显式解锁状态，缺省时由调用方根据 background 颜色回退推断
   *
   * @type {("unlocked" | "failed" | "warning" | "unknown" | "na")}
   * @memberof HandlerExtendedResult
   */
  status?: "unlocked" | "failed" | "warning" | "unknown" | "na";
  /**
   * 动态检测到的地区，如 "US"，区别于脚本元数据中静态的 regions 配置
   *
   * @type {string}
   * @memberof HandlerExtendedResult
   */
  region?: string;
  /**
   * 展示在 text 旁的详细说明
   *
   * @type {string}
   * @memberof HandlerExtendedResult
   */
  message?: string;
  /**
   * 业务层面的失败原因（区别于脚本执行过程中的错误）
   *
   * @type {string}
   * @memberof HandlerExtendedResult
   */
  error?: string;
  /**
   * 附加信息列表，按顺序展示
   *
   * @type {ExtraField[]}
   * @memberof HandlerExtendedResult
   */
  extra?: ExtraField[];
}

/**
 * 脚本运行的返回值，兼容基础与扩展两种结构
 *
 * @interface HandlerResult
 */
type HandlerResult = HandlerBasicResult | HandlerExtendedResult;

interface FetchParams {
  /**
   * 请求方法，默认为 GET
   *
   * @type {("GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS")}
   * @memberof FetchParams
   */
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  /**
   * 请求体，仅在 method 为 POST、PUT、PATCH 时有效
   *
   * @type {string}
   * @memberof FetchParams
   */
  body?: string;
  /**
   * 是否使用当前环境的 host，默认为 false
   *
   * @type {boolean}
   * @memberof FetchParams
   */
  useHost?: boolean;
  /**
   * 是否禁用重定向，默认为 false
   *
   * @type {boolean}
   * @memberof FetchParams
   */
  noRedir?: boolean;
  /**
   * 最多重试次数，默认为1，最大为10
   *
   * @type {number}
   * @memberof FetchParams
   */
  retry?: number;
  /**
   * 超时时间，单位为毫秒，默认为 3000
   *
   * @type {number}
   * @memberof FetchParams
   */
  timeout?: number;
  /**
   * 自定义 TLS SNI，默认为空（使用请求 URL 的 host）
   *
   * @type {string}
   * @memberof FetchParams
   */
  sni?: string;
  /**
   * 附带的 HTTP 请求头，以键值对形式输入
   *
   * @type {Record<string, string>}
   * @memberof FetchParams
   */
  /**
   * 附带的 Cookies，以键值对形式输入
   *
   * @type {Record<string, string>}
   * @memberof FetchParams
   */
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}

interface Cookie extends Record<string, string | Date | boolean> {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
}

// 输出参数类型
interface FetchResponse {
  status: string;
  statusCode: number;
  cookies: Cookie[];
  headers: Record<string, string>;
  method: string;
  url: string;
  body: string;
  redirects: string[];
}

// Fetch函数类型定义
declare function fetch(url: string, params?: FetchParams): FetchResponse;

/**
 * 脚本处理函数
 *
 * @interface HandlerFunction
 */
type HandlerFunction = () => HandlerResult;

/**
 * 脚本元数据
 * 可用于生成脚本注释
 *
 * @interface ScriptMetaData
 */
interface ScriptMetaData {
  /** 平台名称 */
  name: string;
  /** 平台描述 */
  description: string;
  /** 脚本作者 */
  author?: string;
  /** 可用地区 */
  regions?: string[];
  /** 标签 */
  tags?: string[];
}

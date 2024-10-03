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
 * 脚本运行的返回值
 *
 * @interface HandlerResult
 */
interface HandlerResult {
  /**
   * 显示文本
   *
   * @type {string}
   * @memberof HandlerResult
   */
  text: string;
  /**
   * 背景颜色
   *
   * @type {string}
   * @memberof HandlerResult
   */
  background: string;
}

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

interface Cookie extends Record<string, string | Date | Boolean> {
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
interface HandlerFunction {
  (): HandlerResult;
}

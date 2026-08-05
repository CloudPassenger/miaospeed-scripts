# 开发文档

本项目使用 TypeScript 开发，每个检测脚本都是独立入口，由 rollup 打包为单个 CJS 文件，运行在 goja（ES5/ES6）沙箱中。检测脚本不在 Node 中运行，因此禁止 async/await 与 Node 内置模块。

## 项目结构

```text
src/
├── checks/                  # 检测脚本（每个脚本独立入口）
│   ├── ai/                  # 非媒体分类保持扁平
│   ├── games/
│   ├── media/<region>/      # 媒体按主要目标市场分目录
│   ├── network/
│   ├── search/
│   └── social/
├── lib/                     # 共享模块与常量
│   └── constants/           # colors / text / ua
└── types/                   # goja 全局类型声明

scripts/                     # Node.js 构建与脚手架工具
├── build.js
├── check-source.js
├── metadata.js
├── template.js
└── templates/
```

- `ai`、`games`、`network`、`search`、`social` 下的脚本保持扁平，路径为 `src/checks/<category>/<service>.ts`
- 媒体脚本使用 `src/checks/media/<region>/<service>.ts`，目录地区表示主要目标市场，且必须包含在脚本的 `@regions` 中；完整适用范围仍以 `@regions` 为准
- 原 `tools/` 下的 IP 与网络诊断脚本统一归入 `network/`
- `stream` 继续作为 tag 使用，不作为目录或 category
- 共享常量位于 `src/lib/constants/`（`colors.ts`：`C_UNL`/`C_FAIL`/`C_NA`/`C_UNK`/`C_WARN`；`text.ts`：中文状态文本；`ua.ts`：常见 UA），通用模块位于 `src/lib/`（`parseCookies`、`randomString`、`queryIpQuality`），goja 全局类型声明位于 `src/types/`

## 脚本规范

### 元数据

每个脚本必须在文件顶部以连续注释声明元数据，构建时 `scripts/build.js` 按行匹配解析，驱动 `index.json` 与 `koipy-config.yaml`：

```ts
// @id: netflix
// @name: Netflix
// @description: 检测 Netflix 的解锁状态
// @category: media
// @regions: global
// @tags: stream, video
// @priority: 10
```

- `id`、`name`、`category`、`regions`、`tags` 必填；`description` 与 `priority` 可选
- `@id` 使用 lowercase kebab-case，正则为 `^[a-z0-9]+(?:-[a-z0-9]+)*$`，与路径无关，全仓库唯一
- `@id` 是稳定身份；移动或重命名文件时不要同步修改，除非脚本身份本身改变
- `@name` 作为 Koipy 脚本注册与规则引用名称，也必须全仓库唯一
- 同一服务存在多个独立实现时使用主要市场后缀，例如 `britbox-us`、`britbox-uk`
- `@category` 只能是 `ai`、`games`、`media`、`network`、`search`、`social`
- metadata 必须是脚本的第一段内容，并按示例顺序连续声明
- 目录名、文件名和新 `id` 使用 lowercase kebab-case；已有连写品牌名不强制拆词，但 `_` 和空格必须改为 `-`

### Handler

每个 `src/checks/` 脚本必须提供同步、无参数的 `function handler(): HandlerResult`，并通过 `export default handler` 导出。`HandlerResult` 为 `{ text, background }`，其中 `background` 是 RGB 三元组字符串（如 `'239,107,115'`）。

运行时使用 goja 内置全局函数与同步 `fetch`，不要假设 Node 的 `JSON.parse` 等可用：

- `fetch(url, params?)` 是**同步**的，返回 `FetchResponse`（`statusCode`、`body`、`headers`、`cookies`、`redirects`），**不是 Promise**；参数支持 `useHost`、`noRedir`、`retry`（≤10）、`timeout`（ms）、`sni`、`headers`、`cookies`
- 使用全局函数 `safeParse` / `safeStringify` / `println` / `get`，类型声明见 `src/types/global.d.ts`

### ID 规范化记录

首次引入稳定 ID 时，`netflix_cdn`、`ipquality_v6` 分别规范化为 `netflix-cdn`、`ipquality-v6`；`rakutentv`、`britbox`、`discoveryplus` 的多地区实现增加了 `-eu`、`-jp`、`-uk` 或 `-us` 后缀。依赖旧 `index.json` ID 的外部工具需要同步更新。

## 脚手架

```bash
pnpm install   # 安装依赖（pnpm 是唯一包管理器）
pnpm run new   # 交互式脚手架
```

`pnpm run new` 基于 `scripts/templates/fetch.ts.mustache` 生成新脚本，按交互提示选择 category、regions 以及媒体脚本的主要市场，自动生成路径：media 使用 `src/checks/media/<primaryRegion>/<slug>.ts`，其他分类使用 `src/checks/<category>/<slug>.ts`。

## 构建与校验

```bash
pnpm run format        # 格式化 src/（biome）
pnpm run check         # 格式 + lint + 源码契约 + 类型检查
pnpm run build         # 先执行 check，再打包所有脚本到 dist/
```

- `check` 依次执行 Biome 格式检查、默认 lint 规则、`scripts/check-source.js` 的源码契约检查与 `tsc --noEmit`
- `build` 先 `rimraf dist`，再执行完整检查，最后将每个脚本编译并压缩为单个 JavaScript 文件，产物保留元数据文件头并附带 AGPL-3.0-only 版权与 SPDX 声明
- 检测入口相对于 `src/checks/` 的路径会映射到 `dist/`，例如 `src/checks/media/jp/radiko.ts` 构建为 `dist/media/jp/radiko.js`

```text
dist/
├── ai/  games/  network/  search/  social/
├── media/<region>/
├── index.json          # 脚本索引及元数据
└── koipy-config.yaml   # Koipy 配置片段
```

- Release 中的 `scripts.zip` 包含六个业务分类目录，不包含 `index.json` 和 `koipy-config.yaml`；后两者作为独立 Release 资产发布
- ZIP 解压到 Koipy 的 `resources/scripts/` 后，路径为 `resources/scripts/<category>/...` 或 `resources/scripts/media/<region>/...`
- 旧版 `resources/scripts/<region>/...` 与 `resources/scripts/tools/...` 路径不保留兼容副本；发布时必须同步使用同一版本的 ZIP、index 和 Koipy 配置

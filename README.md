# miaospeed-scripts

[![Build and Release](https://github.com/CloudPassenger/miaospeed-scripts/actions/workflows/build.yml/badge.svg)](https://github.com/CloudPassenger/miaospeed-scripts/actions/workflows/build.yml)

一些用于 [MiaoSpeed](https://github.com/AirportR/miaospeed) 的网络与区域可用性检测脚本。

项目覆盖媒体、AI、游戏、网络诊断、搜索和社交平台，并在 [Koipy 测试机器人](https://koipy.gitbook.io/koipy) 中测试通过。

## 使用方法

1. 参考 [Koipy 文档](https://koipy.gitbook.io/koipy/kuai-su-kai-shi) 部署可用的测试机器人及 Miaospeed 后端
2. 下载最新 Release 中的 `scripts.zip`，将压缩包解压至 Koipy 服务端的 `resources/scripts` 文件夹
3. 修改 [Koipy 配置](https://koipy.gitbook.io/koipy/pei-zhi-mu-ban)，启用需要的检测脚本；Release 中的 `koipy-config.yaml` 是 `scriptConfig` 与 `rules` 配置片段，需要合并到完整配置中
4. 重启 Koipy 服务端，进行检测

`scripts.zip`、`index.json` 和 `koipy-config.yaml` 应使用同一版本。从旧架构升级时，请先备份自定义脚本，并使用空的 `resources/scripts` 目录，或清理旧版地区目录与 `tools/`，避免旧脚本继续被自定义配置引用。新架构不保留旧版 `resources/scripts/<region>/...` 路径；自定义配置需要改用新的业务分类路径，例如：

```text
resources/scripts/ai/chatgpt.js
resources/scripts/media/global/netflix.js
resources/scripts/network/ipquality.js
```

## 开发文档

本项目使用 TypeScript 开发，每个检测脚本都是独立入口。检测入口位于 `src/checks/`，共享实现位于 `src/lib/`，Node.js 构建与脚手架工具位于根目录 `scripts/`：

```text
src/
├── checks/
│   ├── ai/
│   ├── games/
│   ├── media/<region>/
│   ├── network/
│   ├── search/
│   └── social/
├── lib/
│   └── constants/
└── types/

scripts/
├── build.js
├── template.js
└── templates/
```

- `ai`、`games`、`network`、`search`、`social` 下的脚本保持扁平，路径为 `src/checks/<category>/<service>.ts`
- 媒体脚本使用 `src/checks/media/<region>/<service>.ts`
- `media/<region>` 表示主要目标市场；脚本完整适用范围仍以 `@regions` 为准，且目录地区必须包含在 `@regions` 中
- 原 `tools/` 下的 IP 与网络诊断脚本统一归入 `network/`
- `stream` 继续作为 tag 使用，不作为目录或 category
- 目录名、文件名和 `@id` 使用 lowercase kebab-case；已有品牌连写名称无需强行拆词，但不得使用下划线或空格

每个脚本必须在文件顶部声明 `@id`、`@name`、`@category`、`@regions` 和 `@tags`：

```ts
// @id: netflix
// @name: Netflix
// @description: 检测 Netflix 的解锁状态
// @category: media
// @regions: global
// @tags: stream, video
// @priority: 10
```

`@category` 只能是 `ai`、`games`、`media`、`network`、`search`、`social`。`@id` 必须全仓库唯一且不依赖文件路径；`@name` 作为 Koipy 脚本注册与规则引用名称，也必须全仓库唯一。移动或重命名脚本时，不应随意修改稳定 ID。同一服务存在多个独立实现时可使用主要市场后缀，例如 `britbox-us` 和 `britbox-uk`。

首次引入稳定 ID 时，`netflix_cdn`、`ipquality_v6` 分别规范化为 `netflix-cdn`、`ipquality-v6`；`rakutentv`、`britbox`、`discoveryplus` 的多地区实现增加了 `-eu`、`-jp`、`-uk` 或 `-us` 后缀。依赖旧 `index.json` ID 的外部工具需要同步更新。

Fork 并克隆项目后，运行 `pnpm install` 安装依赖，再执行 `pnpm run new`，按交互提示选择 category、regions，以及媒体脚本的主要市场，并填写脚本 ID 和文件名。

共享常量位于 `src/lib/constants/`，通用模块位于 `src/lib/`，goja 全局类型声明位于 `src/types/`。

脚本开发完成后，运行 `pnpm run build`。构建会先校验全部元数据、ID 唯一性、category 与目录的一致性，再将每个脚本编译并压缩为单个 JavaScript 文件。产物会保留元数据文件头，并附带 AGPL-3.0-only 版权与 SPDX 声明：

```text
dist/
├── ai/
├── games/
├── media/<region>/
├── network/
├── search/
├── social/
├── index.json
└── koipy-config.yaml
```

检测入口相对于 `src/checks/` 的路径会映射到 `dist/`，例如 `src/checks/media/jp/radiko.ts` 构建为 `dist/media/jp/radiko.js`。Release 中的 `scripts.zip` 包含六个业务分类目录，不包含 `index.json` 和 `koipy-config.yaml`；后两者作为独立 Release 资产发布。

## 适配进度

更多的脚本正在紧锣密鼓地适配中，粗略情况请参见 [项目进度](./PROJECTS.md)

如果你开发了新的脚本，欢迎提交 Pull Request 到本项目！

## 特别鸣谢

- [Koipy 测试机器人](https://koipy.gitbook.io/koipy)
- [lmc999/RegionRestrictionCheck](https://github.com/lmc999/RegionRestrictionCheck)
- [oneclickvirt/UnlockTests](https://github.com/oneclickvirt/UnlockTests)
- [HsukqiLee/MediaUnlockTest](https://github.com/HsukqiLee/MediaUnlockTest)
- [1-stream/RegionRestrictionCheck](https://github.com/1-stream/RegionRestrictionCheck)
- [clash-verge-rev/clash-verge-rev](https://github.com/clash-verge-rev/clash-verge-rev/tree/main/crates/clash-verge-media-unlock)

本项目的脚本基于以上项目使用 Typescript 重构而成

## LICENSE

本项目遵循 [AGPL-3.0 License](./LICENSE) 开源

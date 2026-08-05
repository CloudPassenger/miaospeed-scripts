# 使用指南

## 快速开始

1. 参考 [Koipy 文档](https://koipy.gitbook.io/koipy/kuai-su-kai-shi) 部署可用的测试机器人及 Miaospeed 后端
2. 下载最新 Release 中的 `scripts.zip`，将压缩包解压至 Koipy 服务端的 `resources/scripts` 文件夹
3. 修改 [Koipy 配置](https://koipy.gitbook.io/koipy/pei-zhi-mu-ban)，启用需要的检测脚本；Release 中的 `koipy-config.yaml` 是 `scriptConfig` 与 `rules` 配置片段，需要合并到完整配置中
4. 重启 Koipy 服务端，进行检测

## 版本一致性

`scripts.zip`、`index.json` 和 `koipy-config.yaml` 应使用同一版本。从旧架构升级时，请先备份自定义脚本，并使用空的 `resources/scripts` 目录，或清理旧版地区目录与 `tools/`，避免旧脚本继续被自定义配置引用。

新架构不保留旧版 `resources/scripts/<region>/...` 路径，自定义配置需改用新的业务分类路径：

```text
resources/scripts/ai/chatgpt.js
resources/scripts/media/global/netflix.js
resources/scripts/network/ipquality.js
```

## Release 资产

- `scripts.zip`：六个业务分类目录的全部检测脚本，不包含索引与配置
- `index.json`：脚本索引及元数据（独立资产）
- `koipy-config.yaml`：Koipy 配置片段（独立资产）
- [nightly 预发布](https://github.com/CloudPassenger/miaospeed-scripts/releases/tag/nightly)：随 `main` 分支滚动更新，可能包含未充分验证的功能，请勿视为稳定版本

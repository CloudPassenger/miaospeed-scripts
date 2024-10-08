# miaospeed-scripts

[![Build and Release](https://github.com/CloudPassenger/miaospeed-scripts/actions/workflows/build.yml/badge.svg)](https://github.com/CloudPassenger/miaospeed-scripts/actions/workflows/build.yml)

一些用于 [miaospeed](https://github.com/AirportR/miaospeed) 的网络测试脚本

主要用于检测区域限制内容/特定地区流媒体的可用性

在 [Koipy 测试机器人](https://koipy.gitbook.io/koipy) 中测试通过

## 使用方法

1. 参考 [Koipy 文档](https://koipy.gitbook.io/koipy/kuai-su-kai-shi) 部署可用的测试机器人及 Miaospeed 后端
2. 下载本项目最新 release 中的 scripts.zip，将压缩包解压至 Koipy 服务端的 `resources/scripts` 文件夹中
3. 修改 [Koipy 配置](https://koipy.gitbook.io/koipy/pei-zhi-mu-ban)，启用你想要使用的检测脚本，或参考 release 中的 `koipy-config.yaml` 快速配置
4. 重启 Koipy 服务端，进行检测

## 开发文档

想要开发/适配新的脚本？本项目使用 TypeScript 进行开发，你可以 Fork 并克隆本项目

运行 `pnpm install` 安装依赖，再执行 `pnpm run new` 根据交互式界面创建新的脚本

本项目预先定义了一些共享常量，你可以在 `const` 文件夹下找到它们

脚本开发完成后，运行 `pnpm run build` 将脚本编译为 JavaScript 文件，在项目根目录下的 `dist` 文件夹中即可找到编译完成的脚本

## 适配进度

更多的脚本正在紧锣密鼓地适配中，粗略情况请参见 [项目进度](./PROJECTS.md)

如果你开发了新的脚本，欢迎提交 Pull Request 到本项目！

## 特别鸣谢

- [Koipy 测试机器人](https://koipy.gitbook.io/koipy)
- [lmc999/RegionRestrictionCheck](https://github.com/lmc999/RegionRestrictionCheck)
- [oneclickvirt/UnlockTests](https://github.com/oneclickvirt/UnlockTests)
- [HsukqiLee/MediaUnlockTest](https://github.com/HsukqiLee/MediaUnlockTest)

本项目的脚本基于以上项目使用 Typescript 重构而成

## LICENSE

本项目遵循 [AGPL-3.0 License](./LICENSE) 开源
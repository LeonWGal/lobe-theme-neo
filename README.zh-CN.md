# 🎨 Lobe Theme Neo

<div align="center">

**专为 Stable Diffusion WebUI 与 Forge Neo (Gradio 4) 打造的高颜值毛玻璃风格主题**

[![Release](https://img.shields.io/github/v/release/LeonWGal/lobe-theme-neo?color=7952F5&style=flat-square)](https://github.com/LeonWGal/lobe-theme-neo/releases)
[![Upstream LobeHub](https://img.shields.io/badge/Upstream-lobehub%2Fsd--webui--lobe--theme-18181b?style=flat-square&logo=github)](https://github.com/lobehub/sd-webui-lobe-theme)
[![Forge Neo Compatible](https://img.shields.io/badge/Forge_Neo-Gradio_4.x-00C7B7?style=flat-square)](https://github.com/Haoming02/sd-webui-forge-classic)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue?style=flat-square)](./LICENSE)
[![i18n Supported](https://img.shields.io/badge/i18n-11_Languages-success?style=flat-square)](#-多语言支持)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/LeonWGal/lobe-theme-neo/pulls)

[English](./README.md) · [Русский](./README.ru-RU.md) · [简体中文](./README.zh-CN.md)

<br/>

<img src="./docs/assets/screenshot01.png" alt="Lobe Theme Neo 界面预览" width="100%" />

</div>

---

## ✨ 核心特性

* 🌗 **即时暗黑/浅色模式切换**: 通过动态 CSS 类名与 URL 状态同步 (`history.replaceState`) 实现无缝切换，无需刷新网页，杜绝 Gradio 水合卡死。
* 🧩 **全面适配 Forge Neo & Gradio 4**: 针对 Gradio 4 布局及 Shadow DOM 重构了 DOM 注入机制与容错选择器。
* 📐 **SplitView (双栏分屏工作区)**: 参数调节区与生成画廊左右并排显示，支持 `agent-scheduler-neo` 加入队列按钮 (Enqueue) 自动布局。
* 🎴 **Extra Networks 附加网络侧边栏 2.0**: 专为 LoRA、Checkpoints 和 Embeddings 设计的抽屉式面板，支持实时卡片缩放调节、快速搜索及 Civitai Helper 按钮联动。
* 🪄 **Prompt Studio 提示词工坊**: 一键提示词格式化、权重快速微调、语法高亮与标点清理。
* 🛡️ **深度兼容热门扩展**: 原生提供对 ADetailer Neo、TIPO、Booru Tags Gacha、Dynamic Prompts、Aspect Ratio Plus 与 TagComplete 的界面美化与层级修复。
* 🌐 **多语言国际化 (i18n)**: 内置 11 种语言支持（简体中文、繁體中文、English、Русский、日本語、한국어、Deutsch、Español、Français、Português、Turkish）。

---

## 🏛 架构与集成设计

`lobe-theme-neo` 基于 React 18 与 Ant Design 构建了轻量级前端展示层，安全挂载于 Forge Neo / Gradio 4 之上：

```
┌───────────────────────────────────────────────────────────┐
│                     Lobe Theme Neo                        │
├─────────────────────────────┬─────────────────────────────┤
│  顶部导航栏 (Nav + Actions) │  快捷设置侧边栏 (QuickSet)   │
├─────────────────────────────┼─────────────────────────────┤
│  SplitView 工作区           │  Extra Networks 抽屉面板    │
│  - 生成参数配置 (左)        │  - LoRA / 模型卡片列表 (右) │
│  - 结果画廊预览 (右)        │  - Civitai 元数据快捷操作   │
└─────────────────────────────┴─────────────────────────────┘
                              │ (受控 DOM 注入与事件代理)
                              ▼
┌───────────────────────────────────────────────────────────┐
│              Forge Neo / Gradio 4 核心引擎                │
└───────────────────────────────────────────────────────────┘
```

* **受控 DOM 传送门 (`useInject`)**: Gradio DOM 节点在不被卸载销毁的前提下安全包裹与移动，确保事件监听器与组件生命周期完整有效。
* **响应式 Mutation Observer**: 自动侦听异步渲染的标签页、提示词文本域及扩展面板，防止界面元素丢失。
* **双向配置持久化**: 用户个性化设置自动同步至浏览器 `localStorage` (`SD-LOBE-SETTING`)，并通过 Fast-API `/lobe/config` 接口备份至服务端 `lobe_theme_config.json`。

---

## 📊 兼容性矩阵

| 运行环境 / 扩展插件 | 兼容状态 | 说明 |
| :--- | :---: | :--- |
| **Forge Neo (Gradio 4.x)** | 🟢 完美支持 | 原生适配 `#quicksettings`、模型 dtype 标签与显存管理项 |
| **SD WebUI (A1111 1.9+)** | 🟢 完美支持 | 具备向后兼容的回退选择器 |
| **ADetailer Neo** | 🟢 完美支持 | 优化折叠面板及响应式容器宽度 |
| **Agent Scheduler Neo** | 🟢 完美支持 | SplitView 模式下自动归位 Enqueue 队列按钮 |
| **TagComplete (a1111-tac)** | 🟢 完美支持 | 修复与 `PromptHighlight` 的 z-index 显示层级 |
| **Civitai Helper** | 🟢 完美支持 | 自动注入 Civitai 模型主页、触发词与预览图 Prompt 按钮 |

---

## 🚀 安装与快速上手

### 方式一：WebUI 扩展面板安装 (推荐)
1. 打开 Forge Neo / WebUI 界面。
2. 进入 **Extensions (扩展)** ➔ **Install from URL (从网址安装)**。
3. 粘贴仓库地址：
   ```text
   https://github.com/LeonWGal/lobe-theme-neo.git
   ```
4. 点击 **Install (安装)**。
5. 切换至 **Installed (已安装)** 标签页，点击 **Apply and restart UI (应用并重启)**。

### 方式二：Git 命令行克隆
```bash
cd extensions
git clone https://github.com/LeonWGal/lobe-theme-neo.git
```

### 更新版本
```bash
cd extensions/lobe-theme-neo
git pull origin main
```

> [!IMPORTANT]
> 为避免样式与脚本冲突，在启用 `lobe-theme-neo` 前，请确保已禁用其他旧版 Lobe Theme 或 Kitchen Theme 扩展。

---

## ⚙️ 设置与个性化定制

点击顶部导航栏右上角的 ⚙️ 图标即可打开设置面板：

| 分组 | 可用配置项 |
| :--- | :--- |
| **🎨 外观主题** | 14 种主色调预设、中性色调微调、自定义 Logo 图片与标题、网络字体支持、减少动画模式。 |
| **📐 布局与分屏** | 开启/关闭双栏画廊预览 (SplitView)、界面内边距调整、显示/隐藏页脚。 |
| **⬅️ 快捷设置侧边栏** | 固定 (Fixed) 或浮动 (Float) 模式、默认展开/收起、自定义初始宽度。 |
| **➡️ 附加网络侧边栏** | 固定/浮动模式、卡片网格尺寸无级缩放 (64px - 256px)、默认选中的模型分类。 |
| **🪄 提示词输入框** | 滚动或可拉伸模式、语法高亮、内置带标签管理的 Prompt Editor。 |

---

## 🛠️ 开发与构建指南

本项目基于 Vite、React 18 与 TypeScript 构建：

```bash
# 1. 安装依赖包
npm install

# 2. TypeScript 类型检查
npm run type-check

# 3. 构建生产包 (输出至 javascript/main.mjs)
npm run build
```

---

## 💖 致谢与上游项目

`lobe-theme-neo` 是一项面向社区的现代化延续开发与 Forge Neo 适配版本，建立在原版 **[sd-webui-lobe-theme](https://github.com/lobehub/sd-webui-lobe-theme)** 的卓越设计基础之上。

* **原版创建团队与设计师**: **[LobeHub](https://github.com/lobehub)** 与 **[CanisMinor](https://github.com/canisminor1990)** (`i@lobehub.com`)。
* **原版项目仓库**: [lobehub/sd-webui-lobe-theme](https://github.com/lobehub/sd-webui-lobe-theme) — 由衷感谢 LobeHub 团队打造的 `@lobehub/ui` 设计规范与在 AI 前端领域的先锋探索。
* **Forge Neo 适配与维护**: [LeonWGal](https://github.com/LeonWGal)（Gradio 4 响应式重构、SplitView 布局、DOM 异常修复及扩展兼容）。

---

## 📄 开源许可证

遵循 [AGPL-3.0 许可证](./LICENSE) 开源发布，与原版 LobeHub 项目保持一致。

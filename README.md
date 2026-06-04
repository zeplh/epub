# EPUB 漫画制作工具 V2

一个基于 Web 的图形界面工具，用于将漫画图片打包成符合日本电子漫画协会（[Digital-Comic-Association](http://www.digital-comic.jp/) / デジタルコミック協議会）规范的 EPUB 格式电子书。

[点击此处在线使用](https://zeplh.github.io/epub-manga-creator)

---

## 功能特性

- **图片导入**：支持直接导入图片文件（JPG、PNG、WebP、AVIF）或 ZIP 压缩包
- **图片排序**：智能文件名排序，确保漫画页码顺序正确（解决 `img1.jpg` → `img10.jpg` → `img2.jpg` 的排序问题）
- **页面设置**：支持自定义页面尺寸、显示方式（单页/双页）、图片适配模式等
- **目录管理**：可视化的目录编辑器，支持纯文本批量编辑
- **书籍元数据**：支持设置书名、作者、分类、出版社等信息
- **格式规范**：遵循日本电子漫画协会的 EPUB 固定版式规范
- **图片分割**：支持将跨页图片一键分割为两页
- **本地存储**：自动保存书籍信息预设和目录预设

## 技术栈

| 技术 | 说明 |
|------|------|
| [React](https://react.dev/) | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [MobX](https://mobx.js.org/) | 状态管理 |
| [JSZip](https://stuk.github.io/jszip/) | ZIP 文件解析 |
| [Bootstrap 5](https://getbootstrap.com/) | UI 组件样式 |

## 使用方法

### 在线使用

直接访问 [https://zeplh.github.io/epub-manga-creator]即可使用，无需安装。

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/zeplh/epub-manga-creator.git
cd epub-manga-creator

# 安装依赖（推荐使用 yarn）
yarn install

# 启动开发服务器
yarn start

# 构建生产版本
yarn build
```

> **注意**：本项目使用 Create React App 初始化构建。由于依赖版本较旧，建议在 Node.js 14-16 环境下运行。

### 操作指南

1. **导入图片**：点击左上角的「上传」按钮，选择「图片」直接导入，或选择「ZIP」导入压缩包
2. **编辑书籍信息**：点击「书籍」图标，填写书名、作者、分类等信息
3. **编辑目录**：点击「目录」图标，添加或编辑章节信息
4. **调整页面设置**：点击「设置」图标，调整页面尺寸、显示方向等参数
5. **插入空白页**：点击「铃铛」图标，在指定位置插入空白页
6. **生成 EPUB**：点击「下载」图标，生成并下载 EPUB 文件

## 支持的图片格式

| 格式 | MIME 类型 | 说明 |
|------|-----------|------|
| JPEG | `image/jpeg` | 最常用格式 |
| PNG | `image/png` | 支持透明通道 |
| WebP | `image/webp` | 高压缩率 |
| AVIF | `image/avif` | 新一代高效格式 |

## 项目 Topics

`react` `web` `generator` `mobx` `japanese` `comic` `manga` `epub` `web-gui` `static-page` `epub-generator` `manga-creator` `fixed-layout`

## 浏览器兼容性

- Chrome / Edge（推荐）
- Firefox
- Safari

> 需要使用支持现代 ES 特性的浏览器。

## 参与贡献

欢迎提交 Issue 和 Pull Request。

## 来源

是因为我的一个喜欢看漫画的朋友，嗯，很不幸的是，他使用的是ios系统，兼容性嘛，你知道的，于是就找到了原开发者的项目，但是有一点小小的问题，于是找我求助，为了帮助我的朋友，我使用了一些AI工具，修复了一些小问题，翻译了一下UI，嗯，故事就是这样。

---

本项目基于 [Create React App](https://github.com/facebook/create-react-app) 初始化构建。

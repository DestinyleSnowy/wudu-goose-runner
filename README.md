# 雾都飞升：暴走鹅跑酷

一款无外部依赖的 H5 Canvas 跑酷小游戏。主题是重庆 8D 魔幻地形：轻轨穿楼、洪崖洞夜景、长江索道、火锅辣椒、雾能冲刺。项目可以直接部署到 `github.io`，符合只允许白名单域名提交的场景。

## 作品亮点

- **完整可玩的跑酷闭环**：开始、暂停、失败、重开、本地最高分。
- **动态难度**：速度、平台间距、机关密度会随距离提升。
- **跑酷手感**：二段跳、滑铲、空中速降、雾能冲刺、短暂无敌。
- **高分机制**：辣椒收集、连击计时、冲刺破障、低空滑铲、弹簧台奖励。
- **多角色选择**：使用上传素材制作 15 个暴走鹅角色，每个角色有轻量能力差异。
- **丰富机关**：辣椒刺、低空霓虹牌、巡航无人机、热锅蒸汽、云梯坍塌、移动平台。
- **无需第三方库**：纯 HTML + CSS + JavaScript，所有素材本地打包。
- **移动端支持**：触屏按钮与滑动手势都可操作。

## 操作方式

| 操作 | 键盘 | 触屏 |
| --- | --- | --- |
| 跳跃 / 二段跳 | `Space` / `W` / `↑` | 点“跳”或向上滑 |
| 滑铲 / 空中速降 | `S` / `↓` | 按住“铲”或向下滑 |
| 雾能冲刺 | `Shift` / `J` | 点“冲”或横向滑 |
| 暂停 | `P` / `Esc` | 右上角暂停键 |

## 本地运行

```bash
npm install
npm run build
npm run preview
```

打开终端输出的 `http://localhost:4173` 即可预览。项目没有任何 npm 依赖，`npm install` 主要用于生成/校验 lockfile。

## 部署到 GitHub Pages

1. 新建 GitHub 仓库，例如 `wudu-goose-runner`。
2. 将本项目所有文件 push 到 `main` 分支。
3. 进入仓库 `Settings → Pages`，将 Source 设置为 **GitHub Actions**。
4. 等待 Actions 执行 `npm ci` 和 `npm run build`。
5. 部署完成后，提交形如 `https://你的用户名.github.io/wudu-goose-runner/` 的 URL。

仓库内已包含 `.github/workflows/deploy.yml`，会自动把 `dist/` 发布到 GitHub Pages。

## 推荐提交信息

**作品标题**

雾都飞升：暴走鹅跑酷

**作品描述**

这是一款以重庆 8D 魔幻地形为主题的 H5 无尽跑酷小游戏。玩家操控不同造型的暴走鹅，在轻轨穿楼、洪崖洞夜梯、长江索道等场景中二段跳、滑铲、冲刺破障，收集火锅辣椒保持连击。游戏包含动态难度、多角色、移动平台、云梯坍塌、低空霓虹牌、无人机、蒸汽机关、本地最高分和移动端触屏操作。

**封面图**

可使用 `public/assets/cover.png`。

## 文件结构

```text
.
├── .github/workflows/deploy.yml   # GitHub Pages 自动部署
├── public/                        # 本地素材、图标、PWA manifest
├── scripts/                       # build / preview 脚本
├── src/                           # 游戏源码
├── dist/                          # npm run build 后生成
├── package.json
└── README.md
```

## 设计说明

游戏没有使用任何外部 CDN 或线上 API，避免提交域名受限时出现资源加载失败。所有路径均为相对路径，因此部署在 `github.io/仓库名/` 子路径下也能正常运行。

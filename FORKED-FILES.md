# FORKED-FILES — fork 相对上游的改动清单

> 记录本 fork（`ruonanzh/opencode`）相对上游（`anomalyco/opencode`）的改动，用于每周 rebase 时核对冲突面。
>
> - `origin` = 本 fork；`upstream` = `anomalyco/opencode`（rebase 用，需先 `git remote add upstream ...`）。
> - 原则：**优先只新增文件、尽量少改上游文件**；改上游文件的点集中列在下表，rebase 时优先看这些。

## 改过的上游文件（rebase 冲突面，重点盯）

| 文件 | 改了什么 | 来源 |
|---|---|---|
| `packages/app/src/pages/layout-new.tsx` | `import { GamesPanel }` + 挂载 `<GamesPanel />`（常驻 games 右栏，不碰主 grid） | M0.4 |
| `bunfig.toml` | `[install]` 加 `frozenLockfile = true`（防锁文件 registry-URL 噪音） | 环境修复 |

## 新增文件/目录（零冲突，只增不改）

| 路径 | 内容 | 来源 |
|---|---|---|
| `dev.ps1` | dev 隔离启动器（读 `.env` 的 `DEV_ROOT`，注入 XDG） | M0.3 |
| `packages/app/src/components/games-panel.tsx` | games 面板组件（Fake Game 列表） | M0.4 |
| `spike/spike-m0.7-s2.ts` | S2：`session.create({directory})` 验证 | M0.7 |
| `spike/spike-m0.7-s3.ts` | S3：写隔离匹配语义（wildcard 复刻） | M0.7 |
| `packages/core/spike/` | S4（SystemContext 注入）/ S5（自定义 tool 注册）+ 共享 layer | M0.7 |
| `packages/gamer-agent/` | M1 三插件 workspace 包（`game-repo` 起步） | M1 |

## 其他

- `bun.lock`：新增 `@opencode-ai/gamer-agent` 两条 entry（`frozenLockfile` 保证 install 不再整文件重写）。
- `.env`（git-ignored，不入库）：路径配置本地副本，权威 = `desktop-gamer-agent-opencode` 仓库的 `docs/paths.md`。

## Rebase 流程备忘

1. `git fetch upstream`，`git rebase upstream/main`（或对应上游分支）。
2. 冲突优先看「改过的上游文件」表；新增文件基本不冲突。
3. 改完跑 `bun install --frozen-lockfile` + `bun run typecheck` 确认。

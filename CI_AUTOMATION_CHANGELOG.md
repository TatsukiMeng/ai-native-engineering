# CI / 部署 / E2E 变更总览（执行手册版）

## 1. 目标与结论
本轮收口目标：把文档站检查流程统一为“部署结果优先”，降低本地 E2E 维护成本。

结论：
- `Quality Gate` 只负责 PR 基线闸门：lint / typecheck / build + 大改动补测约束。
- Playwright 检查职责只保留在线上：
  - PR 阶段：`Netlify Preview Guard`
  - 合并后：`Netlify Production Guard`
- 本地 webServer smoke 路径不再作为默认检查链路。

## 2. 工作流矩阵（怎么触发）
| 工作流 | 触发时机 | 主要检查 | 失败产物 |
|---|---|---|---|
| `Quality Gate` | PR 到 `main`（命中 docs/workflow/AGENTS） | lint + format-check + typecheck + build + 大改动补测拦截 | Actions 日志 |
| `Netlify Preview Guard` | PR 到 `main`（命中 docs 相关路径） | 自动解析 Deploy Preview URL 后跑 Playwright（点对点） | `playwright-report`、`test-results` |
| `Netlify Production Guard` | `main` push 或手动 | 对生产 URL 跑 Playwright，失败可建 issue | `playwright-report`、`test-results` + issue |
| `Deploy Docs to GitHub Pages` | `main` push 或手动 | Bun 构建并发布 `docs/out` | GitHub Pages deploy logs |

## 3. 本次关键决策（已落地）
### 3.1 不再维护本地 Playwright smoke
- 原因：本地起服链路会引入额外维护成本（环境差异、localhost 元数据噪音、重复巡检）。
- 新约定：Playwright 只对已部署 URL 执行，Netlify 作为验收真相。

### 3.2 继续保留 PR 基线闸门
- PR 阶段仍保留 lint / typecheck / build，确保问题在部署前被拦截。
- “大改动未补测”仍会拦截，并可触发 `AI_TEST_EVOLUTION_WEBHOOK`。

### 3.3 解决 Preview URL 解析长时间等待
- 现象：`Resolve Netlify deploy preview URL` 可能持续提示 `not found yet`。
- 原因：不同 Netlify 集成模式下，check-runs / status 字段返回时间与格式不稳定。
- 处理：优先用 `PR 号 + Netlify 站点名` 直接构造预览 URL；check-runs/status 改为兜底路径。

## 4. 文件级改动说明
### 4.1 `.github/workflows/quality-gate.yml`
- 移除本地 Playwright 安装与执行步骤。
- 保留 changed-files 推导、大改动补测拦截、oxc lint/format、typecheck、build。
- `targets` 仍输出到 summary，供 Preview Guard / AI 补测链路复用。

### 4.2 `.github/workflows/netlify-preview-guard.yml`
- `workflow_dispatch` 新增可选输入 `preview_url`（手动覆盖）。
- URL 解析策略升级：
  1. 手动输入 `preview_url`（若提供）
  2. 基于 `PR号 + Netlify站点名` 构造 `deploy-preview-<PR>--<site>.netlify.app`
  3. check-runs/status 轮询兜底
- Readiness 检查改为使用变更目标的首个路径，减少固定路径误判。

### 4.3 `docs/playwright.config.ts`
- 强制要求 `E2E_BASE_URL`：未提供时直接报错。
- 删除本地 `webServer` fallback，不再默认本地起服务。

### 4.4 `docs/package.json`
- `start:e2e` 移除（不再维护本地 smoke 入口）。
- `lint`: `bunx oxlint .`
- `format`: `bunx oxfmt --write .`
- 移除依赖：`@biomejs/biome`、`serve-handler`

### 4.5 `docs/scripts/serve-export-for-playwright.mjs`
- 已删除（对应本地 smoke 退场）。

### 4.6 `AGENTS.md`
- 规则 20 更新：PR 阶段 Playwright 默认只打 Netlify Preview。
- 新增规则 21：`Quality Gate` 与线上 Playwright 职责分离，明确“部署结果优先”。

## 5. 实际触发路径（给新同学）
1. 提交 `docs/` 改动并发 PR 到 `main`。
2. `Quality Gate` 先跑基线闸门（不跑本地 Playwright）。
3. `Netlify Preview Guard` 自动拿 Deploy Preview URL，跑点对点 Playwright。
4. 合并后由 `Netlify Production Guard` 对生产链接复查。

## 6. 常用复现命令
### 6.1 只跑 PR 基线（本地）
```bash
cd docs
bun run lint
bun run types:check
bun run build
```

### 6.2 手动复现 Netlify 预览巡检（本地命令，远端 URL）
```bash
cd docs
E2E_BASE_URL=https://<your-preview>.netlify.app \
E2E_TARGET_PATHS=/docs/02-foundation \
bunx playwright test tests/e2e/production-smoke.spec.ts --config=playwright.config.ts
```

### 6.3 手动触发 Workflow（可覆盖预览 URL）
- Actions -> `Netlify Preview Guard` -> `Run workflow`
- 可选填写 `preview_url`

## 7. 当前状态
- 决策“Playwright 只跑 Netlify，不再维护本地 smoke”已写入流程与文档。
- 质量门 + 预览巡检 + 生产巡检三段式职责已明确拆分。
- `Resolve Netlify deploy preview URL` 已加入稳定兜底策略，降低长时间等待风险。

## 8. 新增浏览器异常检查项（production-smoke）
已加入的检查项：
- 页面运行期异常：拦截未忽略的 `console.error` 与 `pageerror`。
- 横向溢出：校验 `documentElement/body scrollWidth` 不超过视口阈值。
- 内部链接健康：抽样检查 `main` 区域内部文档链接返回状态 `< 400`。
- 网络抖动容错：关键 HTTP 探测加入轻量重试，降低瞬时 TLS 抖动误报。

适用场景：
- 文章续写、排版改动、样式调整后，自动验证“读者在浏览器里真实会看到的问题”。

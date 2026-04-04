---
name: excalidraw-normalizer
description: 规范化 Excalidraw 图，确保后续可维护编辑、绑定关系安全、编辑器辅助重排和夜间模式安全导出。处理 `.excalidraw` 架构图、拓扑图、流程图或系统图，并且需要修复 container/binding、重排几何布局、清理连接线或导出透明 PNG 到文档时使用。
---

# Excalidraw 规范化

## 概览

用这个 skill 把 Excalidraw 场景从“看起来差不多”推进到“可维护、可发布”。

默认目标：

- 节点标签跟随节点移动
- 节点移动时连接关系不脱落
- 几何布局符合简单、可复用的模式
- 透明导出在夜间模式下可用
- 仅靠 JSON 不足以把连线排好时，交给编辑器做一次规范化重算

## 工作流

1. 先处理结构，不先抠视觉修饰。
2. 先把标签和连接关系绑好，再优化布局。
3. 用简单几何模型重排，例如 star、ring、grid、lane、hierarchy。
4. 如果连线质量依赖锚点选择，手写的 connector `points` 只能视为临时结果。
5. 当线段还需要编辑器的重算能力时，做一次 Excalidraw editor pass。
6. 布局稳定后，再用仓库内渲染器导出。

## 规则

- 节点内部文字优先使用 `containerId`。
- 连接优先使用带 `startBinding` 和 `endBinding` 的 `arrow`。
- 保持 `boundElements` 与连接图形同步。
- 优先拆成多个小图，不要堆成一张过载大图。
- 文档资产默认导出透明背景。
- 透明导出时避免深色细线，优先更亮的蓝、紫、青，并适当加粗。
- 如果拖动节点后图会散，就不能把它当成完成品。

## 参考

- 需要完整检查清单和布局模式时，读 [references/normalization.md](references/normalization.md)。
- 图的结构已经对了，但连线路径还是不好看时，读 [references/editor-pass.md](references/editor-pass.md)。
- 仓库内渲染器在 [docs/scripts/excalidraw/render_excalidraw.py](../../docs/scripts/excalidraw/render_excalidraw.py)，命令入口在 `docs/package.json` 的 `render:diagram:setup` 和 `render:diagram`。

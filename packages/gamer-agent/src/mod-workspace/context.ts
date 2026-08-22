import type { Mod } from "./mapping"

// SystemContext 源的三段渲染（对齐 D3，文案与 dsh 一致「当前 mod：<名> @ <path>/」）。
// 纯函数，便于单测；SystemContext.make 的 codec/load 在集成阶段接上。
export function renderBaseline(mod: Mod): string {
  return `当前 mod：${mod.name} @ ${mod.path}/`
}

export function renderUpdate(previous: Mod, current: Mod): string {
  return `当前 mod 从 ${previous.name} 变为 ${current.name}`
}

export function renderRemoved(previous: Mod): string {
  return `当前 mod ${previous.name} 已移除`
}

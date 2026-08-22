// spike-m0.7-s4.ts — S4 实测: plugin injects "current mod" via SystemContext.
//
// Verifies the O2 replacement for dsh D3 (`systemPrompt.context()`):
//   - an external plugin effect registers a SystemContext source in-process
//     (no MCP, no legacy `experimental.chat.system.transform`);
//   - `SystemContextRegistry.load()` + `SystemContext.initialize()` renders the
//     baseline that lands in the model's system prompt, containing
//     `当前 mod：<name> @ your_mods/<name>/`.
//
// Run: bun packages/core/spike/spike-m0.7-s4.ts

import { define } from "@opencode-ai/plugin/v2/effect"
import { PluginV2 } from "@opencode-ai/core/plugin"
import { PluginHost } from "@opencode-ai/core/plugin/host"
import { SystemContext } from "@opencode-ai/core/system-context"
import { SystemContextRegistry } from "@opencode-ai/core/system-context/registry"
import { Effect, Schema } from "effect"
import { SpikeLayer } from "./lib/spike-layer"

const Mod = Schema.Struct({ name: Schema.String, path: Schema.String })

const modWorkspace = define({
  id: "mod-workspace",
  effect: Effect.fn(function* () {
    const registry = yield* SystemContextRegistry.Service
    yield* registry.register({
      key: SystemContext.Key.make("mod-workspace/current-mod"),
      load: Effect.succeed(
        SystemContext.make({
          key: SystemContext.Key.make("mod-workspace/current-mod"),
          codec: Schema.toCodecJson(Mod),
          load: Effect.succeed({ name: "my-mod", path: "your_mods/my-mod" }),
          baseline: (mod) => `当前 mod：${mod.name} @ ${mod.path}/`,
          update: (previous, current) => `当前 mod 从 ${previous.name} 变为 ${current.name}`,
          removed: (previous) => `当前 mod ${previous.name} 已移除`,
        }),
      ),
    })
  }),
})

const program = Effect.gen(function* () {
  const plugins = yield* PluginV2.Service
  const host = yield* PluginHost.make(plugins)
  yield* plugins.add(PluginV2.ID.make(modWorkspace.id), (ctx) => modWorkspace.effect(ctx))

  const registry = yield* SystemContextRegistry.Service
  const context = yield* registry.load()
  const generation = yield* SystemContext.initialize(context)

  return generation.baseline
})

const baseline = await program.pipe(Effect.scoped, Effect.provide(SpikeLayer), Effect.runPromise)

const expected = "当前 mod：my-mod @ your_mods/my-mod/"
const ok = baseline.includes(expected)

console.log("=== SystemContext baseline (what lands in the system prompt) ===")
console.log(baseline)
console.log("")
console.log(`${ok ? "PASS" : "FAIL"}  baseline contains "${expected}"`)

process.exit(ok ? 0 : 1)

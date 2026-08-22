// spike-m0.7-s5.ts — S5 实测: plugin registers a custom tool via Tools.Service.
//
// Answers the M0 open question for S5: does a custom tool have to go through MCP,
// or can a plugin register it in-process (like dsh) via Tools.Service?
//
//   - an external plugin effect does `yield* Tools.Service.register({...})`
//     with a `Tool.make(...)` tool named `clone_game`;
//   - `ToolRegistry.materialize()` returns the tool definition, proving the tool
//     is advertised to the model WITHOUT any MCP server.
//
// Run: bun packages/core/spike/spike-m0.7-s5.ts

import { define } from "@opencode-ai/plugin/v2/effect"
import { PluginV2 } from "@opencode-ai/core/plugin"
import { PluginHost } from "@opencode-ai/core/plugin/host"
import { Tool } from "@opencode-ai/core/tool/tool"
import { Tools } from "@opencode-ai/core/tool/tools"
import { ToolRegistry } from "@opencode-ai/core/tool/registry"
import { Effect, Schema } from "effect"
import { SpikeLayer } from "./lib/spike-layer"

const Input = Schema.Struct({ url: Schema.String })
const Output = Schema.Struct({ directory: Schema.String })

const gameRepo = define({
  id: "game-repo",
  effect: Effect.fn(function* () {
    const tools = yield* Tools.Service
    yield* tools.register({
      clone_game: Tool.make({
        description: "Clone a game mod repo (git clone --depth 1) into the workspace.",
        input: Input,
        output: Output,
        execute: (input) => Effect.succeed({ directory: `cloned:${input.url}` }),
      }),
    })
  }),
})

const program = Effect.gen(function* () {
  const plugins = yield* PluginV2.Service
  const host = yield* PluginHost.make(plugins)
  yield* plugins.add(PluginV2.ID.make(gameRepo.id), (ctx) => gameRepo.effect(ctx))

  const registry = yield* ToolRegistry.Service
  const materialized = yield* registry.materialize()

  return materialized.definitions.map((definition) => definition.name)
})

const names = await program.pipe(Effect.scoped, Effect.provide(SpikeLayer), Effect.runPromise)

const ok = names.includes("clone_game")

console.log("=== ToolRegistry.materialize() — tool names advertised to the model ===")
console.log(JSON.stringify(names, null, 2))
console.log("")
console.log(`${ok ? "PASS" : "FAIL"}  custom tool "clone_game" registered in-process (no MCP)`)

process.exit(ok ? 0 : 1)

import { describe, expect, test } from "bun:test"
import type { PluginContext } from "@opencode-ai/plugin/v2/effect"
import { PluginV2 } from "@opencode-ai/core/plugin"
import { PluginHost } from "@opencode-ai/core/plugin/host"
import { SystemContext } from "@opencode-ai/core/system-context"
import { SystemContextRegistry } from "@opencode-ai/core/system-context/registry"
import { ToolRegistry } from "@opencode-ai/core/tool/registry"
import { Effect, Scope } from "effect"
import gameCatalog from "../src/game-catalog/plugin"
import gameRepo from "../src/game-repo/plugin"
import modWorkspace from "../src/mod-workspace/plugin"
import { TestLayer } from "./layer"

const load = (plugins: PluginV2.Interface, plugin: { id: string; effect: (ctx: PluginContext) => Effect.Effect<unknown, unknown, unknown> }) =>
  plugins.add(
    PluginV2.ID.make(plugin.id),
    (ctx) => plugin.effect(ctx) as Effect.Effect<void, never, Scope.Scope>,
  )

describe("gamer-agent plugins (integration)", () => {
  test("all three plugins load and register their tools + env context", async () => {
    const result = await Effect.gen(function* () {
      const plugins = yield* PluginV2.Service
      const host = yield* PluginHost.make(plugins)
      yield* load(plugins, gameRepo)
      yield* load(plugins, gameCatalog)
      yield* load(plugins, modWorkspace)

      const registry = yield* ToolRegistry.Service
      const materialized = yield* registry.materialize()
      const names = materialized.definitions.map((definition) => definition.name)

      const contextRegistry = yield* SystemContextRegistry.Service
      const context = yield* contextRegistry.load()
      const generation = yield* SystemContext.initialize(context)

      return { names, baseline: generation.baseline }
    }).pipe(Effect.scoped, Effect.provide(TestLayer), Effect.runPromise)

    for (const name of ["clone_game", "update_game", "remove_game", "list_games", "get_current_mod"]) {
      expect(result.names).toContain(name)
    }
    expect(result.baseline).toContain("modding 工作区")
  })
})

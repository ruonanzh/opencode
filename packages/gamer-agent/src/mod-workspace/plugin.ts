import { define } from "@opencode-ai/plugin/v2/effect"
import { Location } from "@opencode-ai/core/location"
import { SystemContext } from "@opencode-ai/core/system-context"
import { SystemContextRegistry } from "@opencode-ai/core/system-context/registry"
import { Tool } from "@opencode-ai/core/tool/tool"
import { Tools } from "@opencode-ai/core/tool/tools"
import { Effect, Schema } from "effect"
import { getMod } from "./mapping"

// location 级（静态）：全工作区一致的 modding 环境说明。
const ENVIRONMENT = [
  "这是游戏的 modding 工作区。",
  "每个会话对应一个 mod，mod 写到 your_mods/<mod名>/ 下（唯一可写目录，环境其余只读）。",
  "用 get_current_mod 工具查当前会话的 mod 名。",
].join("\n")

const Mod = Schema.Struct({ name: Schema.String, path: Schema.String })
const Output = Schema.Struct({ mod: Schema.NullOr(Mod) })

const toToolFailure = (cause: unknown): Tool.Failure =>
  new Tool.Failure({ message: cause instanceof Error ? cause.message : String(cause) })

export const modWorkspace = define({
  id: "mod-workspace",
  effect: Effect.fn(function* () {
    const location = yield* Location.Service
    const registry = yield* SystemContextRegistry.Service
    const tools = yield* Tools.Service

    yield* registry.register({
      key: SystemContext.Key.make("mod-workspace/environment"),
      load: Effect.succeed(
        SystemContext.make({
          key: SystemContext.Key.make("mod-workspace/environment"),
          codec: Schema.toCodecJson(Schema.String),
          load: Effect.succeed(ENVIRONMENT),
          baseline: (text) => text,
          update: (_previous, current) => current,
        }),
      ),
    })

    yield* tools
      .register({
        get_current_mod: Tool.make({
          description: "Get the current mod (name/path) for this session.",
          input: Schema.Struct({}),
          output: Output,
          execute: (_input, context) =>
            Effect.tryPromise({
              try: async () => {
                const mod = await getMod(location.directory, context.sessionID)
                return { mod: mod ?? null }
              },
              catch: toToolFailure,
            }),
        }),
      })
      .pipe(Effect.orDie)
  }),
})

export default modWorkspace

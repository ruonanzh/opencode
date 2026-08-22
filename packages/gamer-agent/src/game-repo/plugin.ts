import { define, type PluginContext } from "@opencode-ai/plugin/v2/effect"
import { Tool } from "@opencode-ai/core/tool/tool"
import { Tools } from "@opencode-ai/core/tool/tools"
import { Effect, Schema } from "effect"
import { cloneGame, removeGame, updateGame } from "./command"

const DEFAULT_WORKSPACES = "~/gamer-agent-op/workspaces"

const CloneInput = Schema.Struct({ url: Schema.String, name: Schema.String })
const NameInput = Schema.Struct({ name: Schema.String })
const Directory = Schema.Struct({ directory: Schema.String })

const toToolFailure = (cause: unknown): Tool.Failure =>
  new Tool.Failure({ message: cause instanceof Error ? cause.message : String(cause) })

export const gameRepo = define({
  id: "game-repo",
  effect: Effect.fn(function* (ctx: PluginContext) {
    const root = (ctx.options.workspacesRoot as string | undefined) ?? DEFAULT_WORKSPACES
    const tools = yield* Tools.Service
    yield* tools
      .register({
        clone_game: Tool.make({
          description: "Clone a game mod repo (git clone --depth 1) into the workspace.",
          input: CloneInput,
          output: Directory,
          execute: (input) =>
            Effect.tryPromise({
              try: async () => ({ directory: await cloneGame(input.url, input.name, root) }),
              catch: toToolFailure,
            }),
        }),
        update_game: Tool.make({
          description: "Pull the latest changes for an installed game workspace.",
          input: NameInput,
          output: Directory,
          execute: (input) =>
            Effect.tryPromise({
              try: async () => ({ directory: await updateGame(input.name, root) }),
              catch: toToolFailure,
            }),
        }),
        remove_game: Tool.make({
          description: "Delete an installed game workspace.",
          input: NameInput,
          output: Directory,
          execute: (input) =>
            Effect.tryPromise({
              try: async () => ({ directory: await removeGame(input.name, root) }),
              catch: toToolFailure,
            }),
        }),
      })
      .pipe(Effect.orDie)
  }),
})

export default gameRepo

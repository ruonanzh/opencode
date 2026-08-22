import { define } from "@opencode-ai/plugin/v2/effect"
import { Tool } from "@opencode-ai/core/tool/tool"
import { Tools } from "@opencode-ai/core/tool/tools"
import { Effect, Schema } from "effect"
import { listGames } from "./catalog"

const Game = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  modRepoUrl: Schema.String,
  workspaceName: Schema.String,
})

const Output = Schema.Struct({ games: Schema.Array(Game) })

export const gameCatalog = define({
  id: "game-catalog",
  effect: Effect.fn(function* () {
    const tools = yield* Tools.Service
    yield* tools
      .register({
        list_games: Tool.make({
          description: "List the available games (id/name/modRepoUrl/workspaceName).",
          input: Schema.Struct({}),
          output: Output,
          execute: () => Effect.succeed({ games: listGames() }),
        }),
      })
      .pipe(Effect.orDie)
  }),
})

export default gameCatalog

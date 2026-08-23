import { cloneGame } from "../game-repo/command"

export interface ModSession {
  id: string
  directory: string
  title: string
}

export interface Game {
  modRepoUrl: string
  workspaceName: string
}

// Minimal structural type for the SDK client's session API we depend on.
// The real `@opencode-ai/sdk` `OpencodeClient` satisfies this.
export interface SessionClient {
  session: {
    create(input: { directory: string; title: string }): Promise<{ data?: { id?: string } }>
  }
}

export interface Runtime {
  createSession(input: { directory: string; title: string }): Promise<ModSession>
}

export function createRuntime(client: SessionClient): Runtime {
  return {
    createSession: async (input) => {
      const response = await client.session.create(input)
      const id = response.data?.id
      if (!id) throw new Error("session.create returned no id")
      return { id, directory: input.directory, title: input.title }
    },
  }
}

// MVP：clone 到固定目录 + SDK 打开（对齐 port-plan §5.1）。`clone` 可注入以便单测。
export async function openGame(
  client: SessionClient,
  game: Game,
  workspacesRoot: string,
  clone: (url: string, name: string, root: string) => Promise<string> = cloneGame,
): Promise<{ directory: string; session: ModSession }> {
  const directory = await clone(game.modRepoUrl, game.workspaceName, workspacesRoot)
  const session = await createRuntime(client).createSession({ directory, title: game.workspaceName })
  return { directory, session }
}

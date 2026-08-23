import { describe, expect, test } from "bun:test"
import path from "node:path"
import { createRuntime, openGame, type SessionClient } from "../src/runtime/runtime"

const fakeClient = (id = "session-1"): SessionClient => ({
  session: {
    create: async () => ({ data: { id } }),
  },
})

describe("runtime", () => {
  test("createSession wraps session.create and returns the session", async () => {
    const runtime = createRuntime(fakeClient("abc"))
    const session = await runtime.createSession({ directory: "D:/w", title: "my-mod" })

    expect(session).toEqual({ id: "abc", directory: "D:/w", title: "my-mod" })
  })

  test("createSession throws when the server returns no id", async () => {
    const client: SessionClient = { session: { create: async () => ({ data: {} }) } }
    const runtime = createRuntime(client)

    await expect(runtime.createSession({ directory: "D:/w", title: "t" })).rejects.toThrow(
      "session.create returned no id",
    )
  })

  test("openGame clones into <workspacesRoot>/<name> then opens a session there", async () => {
    const clone = async (url: string, name: string, root: string) => {
      expect(url).toBe("https://github.com/ruonanzh/fake-game-mod")
      return path.join(root, name)
    }

    const { directory, session } = await openGame(
      fakeClient("s1"),
      { modRepoUrl: "https://github.com/ruonanzh/fake-game-mod", workspaceName: "fake_game_mod" },
      "C:/workspaces",
      clone,
    )

    expect(directory).toBe(path.join("C:/workspaces", "fake_game_mod"))
    expect(session.id).toBe("s1")
    expect(session.directory).toBe(directory)
    expect(session.title).toBe("fake_game_mod")
  })
})

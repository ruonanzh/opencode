import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { $ } from "bun"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { cloneGame, removeGame, updateGame } from "../src/game-repo/command"

let tmp: string
let source: string

beforeAll(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "gamer-agent-"))
  source = path.join(tmp, "source")
  await fs.mkdir(source, { recursive: true })
  await fs.writeFile(path.join(source, "AGENTS.md"), "# Fake Game\n")
  await $`git init -q ${source}`
  await $`git -C ${source} config user.email test@example.com`
  await $`git -C ${source} config user.name test`
  await $`git -C ${source} add -A`
  await $`git -C ${source} commit -q -m init`
})

afterAll(async () => {
  await fs.rm(tmp, { recursive: true, force: true })
})

describe("game-repo commands", () => {
  test("cloneGame clones into <workspacesRoot>/<name> and returns the directory", async () => {
    const workspaces = path.join(tmp, "w1")
    const dir = await cloneGame(source, "fake_game_mod", workspaces)

    expect(dir).toBe(path.join(workspaces, "fake_game_mod"))
    expect(await fs.readFile(path.join(dir, "AGENTS.md"), "utf8")).toContain("Fake Game")
    expect((await fs.stat(path.join(dir, "your_mods"))).isDirectory()).toBe(true)
  })

  test("updateGame pulls new commits", async () => {
    const workspaces = path.join(tmp, "w2")
    const dir = await cloneGame(source, "fake_game_mod", workspaces)

    await fs.mkdir(path.join(source, "docs"), { recursive: true })
    await fs.writeFile(path.join(source, "docs", "README.md"), "# docs\n")
    await $`git -C ${source} add -A`
    await $`git -C ${source} commit -q -m docs`

    await updateGame("fake_game_mod", workspaces)

    expect(await fs.readFile(path.join(dir, "docs", "README.md"), "utf8")).toContain("docs")
  })

  test("removeGame deletes the workspace", async () => {
    const workspaces = path.join(tmp, "w3")
    await cloneGame(source, "fake_game_mod", workspaces)
    await removeGame("fake_game_mod", workspaces)

    await expect(fs.stat(path.join(workspaces, "fake_game_mod"))).rejects.toBeTruthy()
  })
})

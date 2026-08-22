import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { $ } from "bun"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { cloneRepo, deleteRepo } from "../src/game-repo/repo"

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

describe("game-repo core", () => {
  test("cloneRepo clones the repo and sets up your_mods", async () => {
    const target = path.join(tmp, "target")
    await cloneRepo(source, target)

    expect(await fs.readFile(path.join(target, "AGENTS.md"), "utf8")).toContain("Fake Game")

    const mods = await fs.stat(path.join(target, "your_mods"))
    expect(mods.isDirectory()).toBe(true)

    const exclude = await fs.readFile(path.join(target, ".git", "info", "exclude"), "utf8")
    expect(exclude).toContain("your_mods/")
  })

  test("deleteRepo removes the workspace", async () => {
    const target = path.join(tmp, "deleteme")
    await cloneRepo(source, target)
    await deleteRepo(target)

    await expect(fs.stat(target)).rejects.toBeTruthy()
  })
})

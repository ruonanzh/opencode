import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { getMod, loadMods, modsFile, saveMod } from "../src/mod-workspace/mapping"

let workspace: string

beforeAll(async () => {
  workspace = await fs.mkdtemp(path.join(os.tmpdir(), "mod-workspace-"))
})

afterAll(async () => {
  await fs.rm(workspace, { recursive: true, force: true })
})

describe("mod-workspace mapping", () => {
  test("loadMods returns empty map when no sidecar exists", async () => {
    expect(await loadMods(workspace)).toEqual({})
  })

  test("saveMod persists to your_mods/.mods.json and loadMods reads it back", async () => {
    await saveMod(workspace, "session-1", { name: "my-mod", path: "your_mods/my-mod" })

    expect(await loadMods(workspace)).toEqual({
      "session-1": { name: "my-mod", path: "your_mods/my-mod" },
    })
    expect(await fs.readFile(modsFile(workspace), "utf8")).toContain("my-mod")
  })

  test("saveMod upserts across sessions", async () => {
    await saveMod(workspace, "session-1", { name: "a", path: "your_mods/a" })
    await saveMod(workspace, "session-2", { name: "b", path: "your_mods/b" })

    expect(await getMod(workspace, "session-1")).toEqual({ name: "a", path: "your_mods/a" })
    expect(await getMod(workspace, "session-2")).toEqual({ name: "b", path: "your_mods/b" })
  })

  test("getMod returns undefined for unknown session", async () => {
    expect(await getMod(workspace, "nope")).toBeUndefined()
  })
})

import fs from "node:fs/promises"
import path from "node:path"

export interface Mod {
  name: string
  path: string
}

// sessionId -> mod。sidecar 持久化到 <workspace>/your_mods/.mods.json（对齐 D4）。
export type ModMap = Record<string, Mod>

export function modsFile(workspace: string): string {
  return path.join(workspace, "your_mods", ".mods.json")
}

export async function loadMods(workspace: string): Promise<ModMap> {
  try {
    const text = await fs.readFile(modsFile(workspace), "utf8")
    return JSON.parse(text) as ModMap
  } catch {
    return {}
  }
}

export async function saveMod(workspace: string, sessionId: string, mod: Mod): Promise<void> {
  const mods = await loadMods(workspace)
  mods[sessionId] = mod
  await fs.mkdir(path.dirname(modsFile(workspace)), { recursive: true })
  await fs.writeFile(modsFile(workspace), JSON.stringify(mods, null, 2))
}

export async function getMod(workspace: string, sessionId: string): Promise<Mod | undefined> {
  const mods = await loadMods(workspace)
  return mods[sessionId]
}

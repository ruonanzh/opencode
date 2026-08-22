import { $ } from "bun"
import fs from "node:fs/promises"
import path from "node:path"

export async function cloneRepo(url: string, target: string): Promise<void> {
  await $`git clone --depth 1 ${url} ${target}`.quiet()
  await setupYourMods(target)
}

export async function pullRepo(target: string): Promise<void> {
  await $`git -C ${target} pull`.quiet()
}

export async function deleteRepo(target: string): Promise<void> {
  await fs.rm(target, { recursive: true, force: true })
}

export async function setupYourMods(target: string): Promise<void> {
  await fs.mkdir(path.join(target, "your_mods"), { recursive: true })
  await fs.appendFile(path.join(target, ".git", "info", "exclude"), "\n# gamer-agent: local-only mods\nyour_mods/\n")
}

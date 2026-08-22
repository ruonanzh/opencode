import path from "node:path"
import { cloneRepo, deleteRepo, pullRepo } from "./repo"

export async function cloneGame(url: string, name: string, workspacesRoot: string): Promise<string> {
  const target = path.join(workspacesRoot, name)
  await cloneRepo(url, target)
  return target
}

export async function updateGame(name: string, workspacesRoot: string): Promise<string> {
  const target = path.join(workspacesRoot, name)
  await pullRepo(target)
  return target
}

export async function removeGame(name: string, workspacesRoot: string): Promise<string> {
  const target = path.join(workspacesRoot, name)
  await deleteRepo(target)
  return target
}

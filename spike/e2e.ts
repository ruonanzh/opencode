// spike/e2e.ts — §5.3 real-server end-to-end smoke.
//
// Spawns `bun dev serve` with the three gamer-agent plugins + write-isolation
// permissions loaded via OPENCODE_CONFIG_CONTENT, waits for it to listen, then
// drives it over HTTP with the SDK (session.create) and reports.
//
// Run: bun spike/e2e.ts

import { spawn } from "node:child_process"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { createOpencodeClient } from "@opencode-ai/sdk/v2/client"

const PORT = 4096
const BASE = `http://127.0.0.1:${PORT}`

const CONFIG = JSON.stringify({
  $schema: "https://opencode.ai/config.json",
  plugins: [
    "file:///D:/opencode/packages/gamer-agent/src/game-catalog/plugin.ts",
    "file:///D:/opencode/packages/gamer-agent/src/game-repo/plugin.ts",
    "file:///D:/opencode/packages/gamer-agent/src/mod-workspace/plugin.ts",
  ],
  permissions: [
    { action: "edit", resource: "**", effect: "deny" },
    { action: "edit", resource: "your_mods/**", effect: "allow" },
  ],
})

let serverOut = ""
const proc = spawn(process.execPath, ["dev", "serve", "--port", String(PORT)], {
  cwd: "D:/opencode",
  env: { ...process.env, OPENCODE_CONFIG_CONTENT: CONFIG },
  stdio: ["ignore", "pipe", "pipe"],
})
proc.stdout.on("data", (d) => {
  serverOut += d.toString()
})
proc.stderr.on("data", (d) => {
  serverOut += d.toString()
})

async function waitForListening(timeoutMs = 120000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (serverOut.includes("opencode server listening")) return
    if (proc.exitCode !== null) throw new Error(`server exited (${proc.exitCode})\n${serverOut}`)
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`timeout waiting for server\n${serverOut}`)
}

const dir = await fs.mkdtemp(path.join(os.tmpdir(), "gamer-agent-e2e-"))

try {
  await waitForListening()
  console.log("[e2e] server listening")

  const client = createOpencodeClient({ baseUrl: BASE })
  const created = await client.session.create({ directory: dir, title: "e2e-smoke" })
  const id = (created as { data?: { id?: string } }).data?.id
  console.log(`[e2e] session.create -> ${id}`)

  if (!id) throw new Error("session.create returned no id")

  console.log("[e2e] PASS: real server up, plugins config accepted, session.create ok")
  process.exit(0)
} catch (error) {
  console.error("[e2e] FAIL:", error)
  process.exit(1)
} finally {
  proc.kill()
}

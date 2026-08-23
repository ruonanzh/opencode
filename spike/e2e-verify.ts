// spike/e2e-verify.ts — connect to the running server and drive it via the SDK.
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { createOpencodeClient } from "@opencode-ai/sdk/v2/client"

const BASE = "http://127.0.0.1:4096"
const password = process.env.OPENCODE_SERVER_PASSWORD ?? ""
const auth = Buffer.from(`opencode:${password}`).toString("base64")
const client = createOpencodeClient({ baseUrl: BASE, headers: { Authorization: `Basic ${auth}` } })

const dir = await fs.mkdtemp(path.join(os.tmpdir(), "gamer-agent-e2e-"))
const created = (await client.session.create({ directory: dir, title: "e2e-verify" })) as {
  data?: { id?: string }
  error?: unknown
}
console.log("=== session.create ===")
console.log(JSON.stringify(created, null, 2))

const id = created.data?.id
if (!id) {
  console.error("no session id")
  process.exit(1)
}

const info = (await client.session.get({ sessionID: id })) as { data?: unknown }
console.log("=== session.get ok, directory:", (info.data as { directory?: string })?.directory)

const toolIds = (await client.tool.ids({ directory: dir })) as { data?: unknown }
console.log("=== tool.ids ===")
console.log(JSON.stringify((toolIds as { data?: string[] }).data))

const cfg = (await client.config.get({ directory: dir })) as { data?: unknown }
console.log("=== config (plugins/permissions) ===")
const cfgData = cfg.data as { info?: { plugins?: unknown[]; permissions?: unknown[] } } | undefined
console.log(JSON.stringify({ plugins: cfgData?.info?.plugins, permissions: cfgData?.info?.permissions }, null, 2))
process.exit(0)

import { createOpencodeClient } from "@opencode-ai/sdk/v2/client"

const password = process.env.OPENCODE_SERVER_PASSWORD ?? ""
const auth = Buffer.from(`opencode:${password}`).toString("base64")

const client = createOpencodeClient({
  baseUrl: "http://127.0.0.1:4096",
  headers: { Authorization: `Basic ${auth}` },
})

const dir = "E:\\opencode-dev\\fixtures\\fake_game_mod"

const created = await client.session.create({ directory: dir, title: "spike-s2" })
console.log("=== session.create result ===")
console.log(JSON.stringify(created, null, 2))

const id = (created as any)?.data?.id
if (id) {
  const info = await client.session.get({ path: { id } })
  console.log("=== session.get result ===")
  console.log(JSON.stringify(info, null, 2))
}

import { Wildcard } from "../packages/core/src/util/wildcard"

// Faithful replica of PermissionV2.evaluate from packages/core/src/permission.ts
// (findLast match wins, default "ask").
type Rule = { action: string; resource: string; effect: "allow" | "deny" | "ask" }
const rules: Rule[] = [
  { action: "edit", resource: "**", effect: "deny" },
  { action: "edit", resource: "your_mods/**", effect: "allow" },
]
function evaluate(action: string, resource: string): string {
  const hit = rules.findLast(
    (rule) => Wildcard.match(action, rule.action) && Wildcard.match(resource, rule.resource),
  )
  return hit?.effect ?? "ask"
}

const cases: Array<[string, string]> = [
  // [action, resource] — Windows absolute + relative, forward + backslash
  ["edit", "your_mods/ok.txt"],
  ["edit", "your_mods\\ok.txt"],
  ["edit", "your_mods/sub/mod.txt"],
  ["edit", "E:\\gamer-agent\\workspaces\\fake_game_mod\\your_mods\\mod1\\x.txt"],
  ["edit", "E:/gamer-agent/workspaces/fake_game_mod/your_mods/mod1/x.txt"],
  ["edit", "docs/spec.md"],
  ["edit", "docs\\spec.md"],
  ["edit", "E:\\gamer-agent\\workspaces\\fake_game_mod\\docs\\spec.md"],
  ["edit", "AGENTS.md"],
  ["edit", "E:\\gamer-agent\\workspaces\\fake_game_mod\\opencode.json"],
  ["read", "docs/spec.md"],
  ["bash", "echo hi > E:/gamer-agent/workspaces/fake_game_mod/root.txt"],
]

let fail = 0
for (const [action, resource] of cases) {
  const effect = evaluate(action, resource)
  // `your_mods/**` is anchored (`^...$`), so it only matches RELATIVE paths.
  // Absolute paths (drive-letter prefix) do not match it — they fall through to
  // the `**` deny rule. In reality the `edit` tool only ever receives relative
  // paths (absolute external paths go through the separate `external_directory`
  // action), so the absolute `your_mods` rows here expect `deny`.
  const relative = !/^[A-Za-z]:[\\/]/.test(resource)
  const expect = relative && resource.includes("your_mods") ? "allow" : action === "edit" ? "deny" : "ask"
  const ok = effect === expect
  if (!ok) fail++
  console.log(`${ok ? "PASS" : "FAIL"}  ${action} ${resource.padEnd(60)} => ${effect} (expect ${expect})`)
}

console.log(`\n${fail === 0 ? "ALL PASS" : `${fail} FAILURES`}`)
process.exit(fail === 0 ? 0 : 1)

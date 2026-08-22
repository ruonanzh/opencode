import { describe, expect, test } from "bun:test"
import { renderBaseline, renderRemoved, renderUpdate } from "../src/mod-workspace/context"

const mod = { name: "my-mod", path: "your_mods/my-mod" }

describe("mod-workspace context renderers", () => {
  test("renderBaseline includes name and path", () => {
    expect(renderBaseline(mod)).toBe("当前 mod：my-mod @ your_mods/my-mod/")
  })

  test("renderUpdate reports old -> new", () => {
    expect(renderUpdate({ name: "a", path: "your_mods/a" }, mod)).toBe("当前 mod 从 a 变为 my-mod")
  })

  test("renderRemoved reports removal", () => {
    expect(renderRemoved(mod)).toBe("当前 mod my-mod 已移除")
  })
})

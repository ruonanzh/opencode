import { describe, expect, test } from "bun:test"
import { listGames } from "../src/game-catalog/catalog"

describe("game-catalog", () => {
  test("lists at least one game with required fields", () => {
    const games = listGames()
    expect(games.length).toBeGreaterThan(0)
    for (const game of games) {
      expect(game.id).toBeTruthy()
      expect(game.name).toBeTruthy()
      expect(game.modRepoUrl).toBeTruthy()
      expect(game.workspaceName).toBeTruthy()
    }
  })

  test("ships the Fake Game fixture", () => {
    const fake = listGames().find((game) => game.id === "fake-game")
    expect(fake).toBeDefined()
    expect(fake?.workspaceName).toBe("fake_game_mod")
  })
})

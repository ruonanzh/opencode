export interface Game {
  id: string
  name: string
  modRepoUrl: string
  workspaceName: string
}

// Static game catalog (M1 stub). The real catalog will be config-driven; for now
// this ships one "Fake Game" fixture entry used by game-repo / e2e verification.
export const games: readonly Game[] = [
  {
    id: "fake-game",
    name: "Fake Game",
    modRepoUrl: "D:/opencode-dev/fixtures/fake_game_mod",
    workspaceName: "fake_game_mod",
  },
]

export function listGames(): readonly Game[] {
  return games
}

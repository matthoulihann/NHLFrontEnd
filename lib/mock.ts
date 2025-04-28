import type { Player, PlayerStat, GarData } from "./types"

// Mock data for preview environment
export const mockPlayers: Player[] = [
  {
    id: 1,
    name: "Connor McDavid",
    age: 28,
    position: "C",
    team: "Edmonton",
    contractType: "UFA",
    projectedAav: 15.5,
    projectedTerm: 8,
    valueTier: "Fair Deal",
    valueAssessment:
      "Elite center who drives play and produces at historic levels. Worth every penny of a max contract.",
    recentProduction: 152,
    recentGar: 24.5,
    pointsPerGame: 1.85,
    projectedGar2526: 25.2,
    contract_value_score: 60,
  },
  {
    id: 2,
    name: "Auston Matthews",
    age: 27,
    position: "C",
    team: "Toronto",
    contractType: "UFA",
    projectedAav: 14.0,
    projectedTerm: 8,
    valueTier: "Fair Deal",
    valueAssessment:
      "Elite goal-scoring center with strong two-way play. Contract reflects his status as a franchise player.",
    recentProduction: 107,
    recentGar: 21.3,
    pointsPerGame: 1.3,
    projectedGar2526: 22.1,
    contract_value_score: 58,
  },
]

// Mock GAR data for players
export const mockGarData: GarData[] = [
  // Player 1 - Connor McDavid
  { playerId: 1, season: "2022-23", gar: 22.8 },
  { playerId: 1, season: "2023-24", gar: 23.5 },
  { playerId: 1, season: "2024-25", gar: 24.5 },
  // Player 2 - Auston Matthews
  { playerId: 2, season: "2022-23", gar: 20.1 },
  { playerId: 2, season: "2023-24", gar: 21.3 },
  { playerId: 2, season: "2024-25", gar: 22.1 },
]

// Mock player stats
export const mockPlayerStats: PlayerStat[] = [
  // Player 1 - Connor McDavid (2022-23)
  {
    playerId: 1,
    season: "2022-23",
    team: "Edmonton",
    position: "C",
    gamesPlayed: 82,
    goals: 64,
    assists: 89,
    points: 153,
    plusMinus: 22,
    penaltyMinutes: 36,
    powerPlayGoals: 21,
    shortHandedGoals: 1,
    gameWinningGoals: 11,
    timeOnIce: 1804, // 22:00 per game
    giveaways: 62,
    takeaways: 78,
    individualCorsiFor: 1250,
    individualExpectedGoals: 42.5,
    goalsAboveReplacement: 22.8,
    winsAboveReplacement: 4.1,
  },
  // Player 2 - Auston Matthews (2022-23)
  {
    playerId: 2,
    season: "2022-23",
    team: "Toronto",
    position: "C",
    gamesPlayed: 74,
    goals: 40,
    assists: 47,
    points: 87,
    plusMinus: 19,
    penaltyMinutes: 24,
    powerPlayGoals: 14,
    shortHandedGoals: 0,
    gameWinningGoals: 9,
    timeOnIce: 1628, // 22:00 per game
    giveaways: 48,
    takeaways: 62,
    individualCorsiFor: 1150,
    individualExpectedGoals: 38.2,
    goalsAboveReplacement: 20.1,
    winsAboveReplacement: 3.8,
  },
]

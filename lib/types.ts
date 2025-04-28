// Add contract_value_score to the Player interface
export interface Player {
  id: number
  name: string
  age: number
  position: string
  team: string
  contractType: string
  projectedAav: number
  projectedTerm: number
  valueTier: string
  valueAssessment: string
  recentProduction?: number
  recentGar?: number
  pointsPerGame?: number
  savePercentage?: number
  goalsAgainstAverage?: number
  projectedGar2526?: number
  contract_value_score?: number // Added this line
}

// Keep the rest of your types as they are
export interface GarData {
  playerId: number
  season: string
  gar: number
}

export interface PlayerStat {
  playerId: number
  season: string
  team: string
  position: string
  gamesPlayed: number
  goals?: number
  assists?: number
  points?: number
  plusMinus?: number
  penaltyMinutes?: number
  powerPlayGoals?: number
  shortHandedGoals?: number
  gameWinningGoals?: number
  corsiForePercentage?: number
  expectedGoals?: number
  expectedGoalsDifferential?: number
  individualCorsiFor?: number
  individualExpectedGoals?: number
  goalsAboveReplacement?: number
  winsAboveReplacement?: number
  wins?: number
  losses?: number
  otLosses?: number
  savePercentage?: number
  goalsAgainstAverage?: number
  shutouts?: number
  goalsSavedAboveAverage?: number
  highDangerSavePercentage?: number
  mediumDangerSavePercentage?: number
  lowDangerSavePercentage?: number
  qualityStartPercentage?: number
  timeOnIce?: number
  giveaways?: number
  takeaways?: number
}

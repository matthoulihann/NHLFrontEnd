
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
  contract_value_score?: number 
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
  timeOnIce?: number
  giveaways?: number
  takeaways?: number
  individualCorsiFor?: number
  individualExpectedGoals?: number
  goalsAboveReplacement?: number
  winsAboveReplacement?: number
}

export interface GarData {
  playerId: number
  season: string
  gar: number
}

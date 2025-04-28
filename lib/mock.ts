// lib/mock.ts
import type { Player } from "@/lib/types"

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
    valueAssessment: "Elite center who drives play and produces at historic levels. Worth every penny of a max contract.",
    recentProduction: 152,
    recentGar: 24.5,
    pointsPerGame: 1.85,
    projectedGar2526: 25.2,
    contract_value_score: 60,
  },
  // Add more mock players as needed
]

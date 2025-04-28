import type { Player } from "@/app/types"
import { isClient } from "@/lib/utils"
import { mockPlayers } from "@/lib/mock"
import { executeQuery, getPool } from "@/lib/db"

// No need to replace the entire file, just add the contract_value_score to your SQL queries

// In the getPlayers function, modify the SELECT statement to include contract_value_score:
export async function getPlayers(): Promise<Player[]> {
  console.log("getPlayers called, isClient:", isClient())

  if (isClient()) {
    console.log("Using mock data (client-side)")
    return mockPlayers
  }

  try {
    const rows = await executeQuery(`
      SELECT 
        pc.player_id as id,
        pc.player_name as name,
        pc.age,
        s.position,
        s.prev_team as team,
        s.contract_type as contractType,
        pc.aav as projectedAav,
        pc.contract_term as projectedTerm,
        pc.value_category as valueTier,
        pc.projected_gar_25_26 as projectedGar2526,
        pc.value_score as contract_value_score,
        CONCAT('Value per GAR: ', pc.value_per_gar, 'k. ', 
               CASE 
                 WHEN pc.value_category = 'Bargain' THEN 'Player provides excellent value relative to projected cost.'
                 WHEN pc.value_category = 'Fair Deal' THEN 'Contract value aligns well with expected performance.'
                 WHEN pc.value_category = 'Overpay' THEN 'Contract exceeds expected value based on projected performance.'
                 ELSE 'Contract value assessment pending.'
               END) as valueAssessment,
        (s.goals_24_25 + s.a1_24_25) as recentProduction,
        s.gar_24_25 as recentGar,
        CASE 
          WHEN s.position = 'G' THEN NULL
          ELSE (s.goals_24_25 + s.a1_24_25) / 82
        END as pointsPerGame,
        CASE 
          WHEN s.position = 'G' THEN 0.915
          ELSE NULL
        END as savePercentage,
        CASE 
          WHEN s.position = 'G' THEN 2.50
          ELSE NULL
        END as goalsAgainstAverage
      FROM projected_contracts pc
      LEFT JOIN stats s ON pc.player_id = s.player_id
      ORDER BY pc.aav DESC
    `)

    console.log(`Query successful, fetched ${rows.length} players`)

    return (rows as Player[]).map((player) => ({
      ...player,
      // Ensure numeric values are properly typed
      projectedAav: Number(player.projectedAav),
      projectedTerm: Number(player.projectedTerm),
      projectedGar2526: player.projectedGar2526 ? Number(player.projectedGar2526) : undefined,
      recentProduction: player.recentProduction ? Number(player.recentProduction) : undefined,
      recentGar: player.recentGar ? Number(player.recentGar) : undefined,
      pointsPerGame: player.pointsPerGame ? Number(player.pointsPerGame) : undefined,
      savePercentage: player.savePercentage ? Number(player.savePercentage) : undefined,
      goalsAgainstAverage: player.goalsAgainstAverage ? Number(player.goalsAgainstAverage) : undefined,
      contract_value_score: player.contract_value_score ? Number(player.contract_value_score) : undefined,
    }))
  } catch (error) {
    console.error("Failed to fetch players:", error)
    return mockPlayers // Fallback to mock data
  }
}

// Similarly, update the getPlayerById function to include contract_value_score
export async function getPlayerById(id: number): Promise<Player | null> {
  if (isClient()) {
    console.log(`Client-side: Using mock data for player ID ${id}`)
    return mockPlayers.find((p) => p.id === id) || null
  }

  try {
    const pool = await getPool()
    if (!pool) {
      console.warn(`MySQL pool not available, using mock data for player ID ${id}`)
      return mockPlayers.find((p) => p.id === id) || null
    }

    console.log(`Fetching player with ID ${id} from database`)
    const [rows] = await pool.query(
      `
      SELECT 
        pc.player_id as id,
        pc.player_name as name,
        pc.age,
        s.position,
        s.prev_team as team,
        s.contract_type as contractType,
        pc.aav as projectedAav,
        pc.contract_term as projectedTerm,
        pc.value_category as valueTier,
        pc.projected_gar_25_26 as projectedGar2526,
        pc.value_score as contract_value_score,
        CONCAT('Value per GAR: ', pc.value_per_gar, 'k. ', 
               CASE 
                 WHEN pc.value_category = 'Bargain' THEN 'Player provides excellent value relative to projected cost.'
                 WHEN pc.value_category = 'Fair Deal' THEN 'Contract value aligns well with expected performance.'
                 WHEN pc.value_category = 'Overpay' THEN 'Contract exceeds expected value based on projected performance.'
                 END) as valueAssessment,
        (s.goals_24_25 + s.a1_24_25) as recentProduction,
        s.gar_24_25 as recentGar,
        CASE 
          WHEN s.position = 'G' THEN NULL
          ELSE (s.goals_24_25 + s.a1_24_25) / 82
        END as pointsPerGame,
        CASE 
          WHEN s.position = 'G' THEN 0.915
          ELSE NULL
        END as savePercentage,
        CASE 
          WHEN s.position = 'G' THEN 2.50
          ELSE NULL
        END as goalsAgainstAverage
      FROM projected_contracts pc
      LEFT JOIN stats s ON pc.player_id = s.player_id
      WHERE pc.player_id = ?
    `,
      [id],
    )

    const players = rows as Player[]
    if (players.length === 0) {
      console.log(`No player found with ID ${id} in database, using mock data`)
      return mockPlayers.find((p) => p.id === id) || null
    }

    const player = players[0]
    console.log(`Found player in database: ${player.name} (ID: ${player.id})`)

    return {
      ...player,
      // Ensure numeric values are properly typed
      projectedAav: Number(player.projectedAav),
      projectedTerm: Number(player.projectedTerm),
      projectedGar2526: player.projectedGar2526 ? Number(player.projectedGar2526) : undefined,
      recentProduction: player.recentProduction ? Number(player.recentProduction) : undefined,
      recentGar: player.recentGar ? Number(player.recentGar) : undefined,
      pointsPerGame: player.pointsPerGame ? Number(player.pointsPerGame) : undefined,
      savePercentage: player.savePercentage ? Number(player.savePercentage) : undefined,
      goalsAgainstAverage: player.goalsAgainstAverage ? Number(player.goalsAgainstAverage) : undefined,
      contract_value_score: player.contract_value_score ? Number(player.contract_value_score) : undefined,
    }
  } catch (error) {
    console.error(`Failed to fetch player with id ${id}:`, error)
    console.log(`Falling back to mock data for player ID ${id}`)
    return mockPlayers.find((p) => p.id === id) || null // Fallback to mock data
  }
}

// Update the getPlayersByIds function similarly
export async function getPlayersByIds(ids: number[]): Promise<Player[]> {
  try {
    const pool = await getPool()
    if (!pool) {
      console.warn("MySQL pool not available, using mock data")
      return mockPlayers.filter((p) => ids.includes(p.id))
    }

    const placeholders = ids.map(() => "?").join(",")
    const [rows] = await pool.query(
      `
      SELECT 
        pc.player_id as id,
        pc.player_name as name,
        pc.age,
        s.position,
        s.prev_team as team,
        s.contract_type as contractType,
        pc.aav as projectedAav,
        pc.contract_term as projectedTerm,
        pc.value_category as valueTier,
        pc.projected_gar_25_26 as projectedGar2526,
        pc.value_score as contract_value_score,
        CONCAT('Value per GAR: ', pc.value_per_gar, 'k. ', 
               CASE 
                 WHEN pc.value_category = 'Bargain' THEN 'Player provides excellent value relative to projected cost.'
                 WHEN pc.value_category = 'Fair Deal' THEN 'Contract value aligns well with expected performance.'
                 WHEN pc.value_category = 'Overpay' THEN 'Contract exceeds expected value based on projected performance.'
                 END) as valueAssessment,
        (s.goals_24_25 + s.a1_24_25) as recentProduction,
        s.gar_24_25 as recentGar,
        CASE 
          WHEN s.position = 'G' THEN NULL
          ELSE (s.goals_24_25 + s.a1_24_25) / 82
        END as pointsPerGame,
        CASE 
          WHEN s.position = 'G' THEN 0.915
          ELSE NULL
        END as savePercentage,
        CASE 
          WHEN s.position = 'G' THEN 2.50
          ELSE NULL
        END as goalsAgainstAverage
      FROM projected_contracts pc
      LEFT JOIN stats s ON pc.player_id = s.player_id
      WHERE pc.player_id IN (${placeholders})
    `,
      ids,
    )

    return (rows as Player[]).map((player) => ({
      ...player,
      // Ensure numeric values are properly typed
      projectedAav: Number(player.projectedAav),
      projectedTerm: Number(player.projectedTerm),
      projectedGar2526: player.projectedGar2526 ? Number(player.projectedGar2526) : undefined,
      recentProduction: player.recentProduction ? Number(player.recentProduction) : undefined,
      recentGar: player.recentGar ? Number(player.recentGar) : undefined,
      pointsPerGame: player.pointsPerGame ? Number(player.pointsPerGame) : undefined,
      savePercentage: player.savePercentage ? Number(player.savePercentage) : undefined,
      goalsAgainstAverage: player.goalsAgainstAverage ? Number(player.goalsAgainstAverage) : undefined,
      contract_value_score: player.contract_value_score ? Number(player.contract_value_score) : undefined,
    }))
  } catch (error) {
    console.error("Failed to fetch players by IDs:", error)
    return mockPlayers.filter((p) => ids.includes(p.id)) // Fallback to mock data
  }
}

// Finally, update your mockPlayers to include contract_value_score (around line 600):

const mockPlayersUpdated: Player[] = [
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
    contract_value_score: 60 /* Add this line with an appropriate value */,
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
    contract_value_score: 58 /* Add this line with an appropriate value */,
  },
  // Additional mock players would continue here...
]

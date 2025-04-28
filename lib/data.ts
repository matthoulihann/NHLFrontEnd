import { Player } from "@/app/types"
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
        pc.value_score as contract_value_score,  /* Added this line */
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
      contract_value_score: player.contract_value_score ? Number(player.contract_value_score) : undefined,  /* Added this line */
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
        pc.value_score as contract_value_score,  /* Added this line */
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
      contract_value_score: player.contract_value_score ? Number(player.contract_value_score) : undefined,  /* Added this line */
    }
  } catch (error) {
    console.error(`Failed to fetch player with id ${id}:`, error)
    console.log(`Falling back to mock data for player ID ${id}`)
    return mockPlayers.find((p) => p.id === id) || null // Fallback to mock data
  }
}

// Update the getPlayersByIds function similarly

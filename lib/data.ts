// Replace the entire file with this complete version
import type { Player, PlayerStat, GarData } from "./types"
import { isClient } from "@/lib/utils"
import { executeQuery } from "./db"
import { mockPlayers, mockGarData, mockPlayerStats } from "./mock"

// Only import mysql on the server side
let mysql: any = null

// Use a dynamic import for mysql2 to prevent client-side errors
async function loadMysql() {
  if (typeof window === "undefined") {
    try {
      // We're on the server - dynamically import mysql2
      mysql = await import("mysql2/promise")
      console.log("MySQL module loaded successfully")
      return true
    } catch (error) {
      console.error("Failed to load mysql2:", error)
      return false
    }
  }
  return false
}

// Create a connection pool to the MySQL database
let pool: any = null

// Initialize the connection pool
// Keep this function for backward compatibility
async function getPool() {
  if (!pool && !mysql) {
    // Try to load MySQL first
    const loaded = await loadMysql()
    if (!loaded) {
      console.warn("MySQL could not be loaded, using mock data")
      return null
    }
  }

  if (!pool && mysql) {
    try {
      // Log the database URL (with password redacted for security)
      const dbUrl = process.env.DATABASE_URL || "No DATABASE_URL found"
      const redactedUrl = dbUrl.replace(/:([^@]*)@/, ":****@")
      console.log(`Attempting to connect to database: ${redactedUrl}`)

      // For Railway, we need to parse the connection string and add SSL options
      const connectionConfig = {
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: {
          // Changed to false to accept self-signed certificates
          rejectUnauthorized: false,
        },
      }

      pool = mysql.createPool(connectionConfig)
      console.log("MySQL pool created successfully")

      // Test the connection
      pool
        .query("SELECT 1")
        .then(() => {
          console.log("Database connection test successful")
        })
        .catch((err: any) => {
          console.error("Database connection test failed:", err)
        })
    } catch (error) {
      console.error("Failed to create MySQL pool:", error)
    }
  }
  return pool
}

// Function to get all players
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

// Function to get player by ID
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

// Function to get players by IDs
export async function getPlayersByIds(ids: number[]): Promise<Player[]> {
  if (isClient()) {
    return mockPlayers.filter((p) => ids.includes(p.id))
  }

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

// Function to get player GAR data
export async function getPlayerGarData(playerId: number): Promise<GarData[]> {
  if (isClient()) {
    return mockGarData.filter((d) => d.playerId === playerId)
  }

  try {
    const pool = await getPool()
    if (!pool) {
      console.warn("MySQL pool not available, using mock data")
      return mockGarData.filter((d) => d.playerId === playerId)
    }

    const [rows] = await pool.query(
      `
      SELECT 
        player_id as playerId,
        '2022-23' as season,
        gar_22_23 as gar
      FROM stats
      WHERE player_id = ?
      UNION
      SELECT 
        player_id as playerId,
        '2023-24' as season,
        gar_23_24 as gar
      FROM stats
      WHERE player_id = ?
      UNION
      SELECT 
        player_id as playerId,
        '2024-25' as season,
        gar_24_25 as gar
      FROM stats
      WHERE player_id = ?
      ORDER BY season
    `,
      [playerId, playerId, playerId],
    )

    return (rows as GarData[]).map((data) => ({
      ...data,
      gar: Number(data.gar) || 0, // Handle null values
    }))
  } catch (error) {
    console.error(`Failed to fetch GAR data for player with id ${playerId}:`, error)
    return mockGarData.filter((d) => d.playerId === playerId) // Fallback to mock data
  }
}

// Function to get players GAR data for comparison
export async function getPlayersGarData(playerIds: number[]): Promise<GarData[]> {
  if (isClient()) {
    return mockGarData.filter((d) => playerIds.includes(d.playerId))
  }

  try {
    const pool = await getPool()
    if (!pool) {
      console.warn("MySQL pool not available, using mock data")
      return mockGarData.filter((d) => playerIds.includes(d.playerId))
    }

    const placeholders = playerIds.map(() => "?").join(",")
    const allParams = [...playerIds, ...playerIds, ...playerIds] // Repeat IDs for each season

    const [rows] = await pool.query(
      `
      SELECT 
        player_id as playerId,
        '2022-23' as season,
        gar_22_23 as gar
      FROM stats
      WHERE player_id IN (${placeholders})
      UNION
      SELECT 
        player_id as playerId,
        '2023-24' as season,
        gar_23_24 as gar
      FROM stats
      WHERE player_id IN (${placeholders})
      UNION
      SELECT 
        player_id as playerId,
        '2024-25' as season,
        gar_24_25 as gar
      FROM stats
      WHERE player_id IN (${placeholders})
      ORDER BY playerId, season
    `,
      allParams,
    )

    return (rows as GarData[]).map((data) => ({
      ...data,
      gar: Number(data.gar) || 0, // Handle null values
    }))
  } catch (error) {
    console.error("Failed to fetch players GAR data:", error)
    return mockGarData.filter((d) => playerIds.includes(d.playerId)) // Fallback to mock data
  }
}

// Function to get player stats
export async function getPlayerStats(playerId: number): Promise<PlayerStat[]> {
  console.log(`getPlayerStats called for player ID: ${playerId}, isClient:`, isClient())

  if (isClient()) {
    console.log("Using mock player stats (client-side)")
    return mockPlayerStats.filter((s) => s.playerId === playerId)
  }

  try {
    const pool = await getPool()
    if (!pool) {
      console.warn("MySQL pool not available, using mock data")
      return mockPlayerStats.filter((s) => s.playerId === playerId)
    }

    console.log("Executing query to fetch player stats")

    // First, check if the player exists in the stats table
    const [playerCheck] = await pool.query(
      `SELECT player_id, player_name, position, prev_team FROM stats WHERE player_id = ?`,
      [playerId],
    )

    console.log(
      `Player check result:`,
      Array.isArray(playerCheck) ? `Found ${playerCheck.length} records` : `Unexpected result: ${playerCheck}`,
    )

    if (Array.isArray(playerCheck) && playerCheck.length === 0) {
      console.warn(`No player found with ID ${playerId} in stats table`)
      return [] // Return empty array instead of mock data
    }

    // Get all player data in a single query to avoid multiple database calls
    const [playerData] = await pool.query(`SELECT * FROM stats WHERE player_id = ?`, [playerId])

    if (Array.isArray(playerData) && playerData.length === 0) {
      console.warn(`No stats found for player ID ${playerId}`)
      return []
    }

    // Log the raw player data for debugging
    console.log(`Raw player data for ID ${playerId}:`, JSON.stringify(playerData[0], null, 2))

    // Create stats for each season using the data from the single row
    const player = playerData[0]
    const position = player.position || "Unknown"
    const team = player.prev_team || "Unknown"
    const playerName = player.player_name || "Unknown"

    console.log(`Processing stats for ${playerName} (${position}) on ${team}`)

    // Create an array of stats for each season
    const stats: PlayerStat[] = []

    // Helper function to check if a season has meaningful data
    const seasonHasData = (seasonSuffix: string) => {
      const hasGoals = player[`goals_${seasonSuffix}`] !== undefined && player[`goals_${seasonSuffix}`] !== null
      const hasAssists = player[`a1_${seasonSuffix}`] !== undefined && player[`a1_${seasonSuffix}`] !== null
      const hasTOI = player[`toi_${seasonSuffix}`] !== undefined && player[`toi_${seasonSuffix}`] !== null
      const hasGAR = player[`gar_${seasonSuffix}`] !== undefined && player[`gar_${seasonSuffix}`] !== null

      return hasGoals || hasAssists || hasTOI || hasGAR
    }

    // Only add seasons that have data
    // 2022-23 Season
    if (seasonHasData("22_23")) {
      stats.push({
        playerId: playerId,
        season: "2022-23",
        team: team,
        position: position,
        gamesPlayed: player.gp_22_23 || 82, // Default to 82 if not specified
        goals: player.goals_22_23 !== undefined ? Number(player.goals_22_23) : undefined,
        assists: player.a1_22_23 !== undefined ? Number(player.a1_22_23) : undefined,
        points:
          player.goals_22_23 !== undefined && player.a1_22_23 !== undefined
            ? Number(player.goals_22_23) + Number(player.a1_22_23)
            : undefined,
        timeOnIce: player.toi_22_23 !== undefined ? Number(player.toi_22_23) : undefined,
        giveaways: player.giveaways_22_23 !== undefined ? Number(player.giveaways_22_23) : undefined,
        takeaways: player.takeaways_22_23 !== undefined ? Number(player.takeaways_22_23) : undefined,
        individualCorsiFor: player.icf_22_23 !== undefined ? Number(player.icf_22_23) : undefined,
        individualExpectedGoals: player.ixg_22_23 !== undefined ? Number(player.ixg_22_23) : undefined,
        goalsAboveReplacement: player.gar_22_23 !== undefined ? Number(player.gar_22_23) : undefined,
        winsAboveReplacement: player.war_22_23 !== undefined ? Number(player.war_22_23) : undefined,
      })
    }

    // 2023-24 Season
    if (seasonHasData("23_24")) {
      stats.push({
        playerId: playerId,
        season: "2023-24",
        team: team,
        position: position,
        gamesPlayed: player.gp_23_24 || 82, // Default to 82 if not specified
        goals: player.goals_23_24 !== undefined ? Number(player.goals_23_24) : undefined,
        assists: player.a1_23_24 !== undefined ? Number(player.a1_23_24) : undefined,
        points:
          player.goals_23_24 !== undefined && player.a1_23_24 !== undefined
            ? Number(player.goals_23_24) + Number(player.a1_23_24)
            : undefined,
        timeOnIce: player.toi_23_24 !== undefined ? Number(player.toi_23_24) : undefined,
        giveaways: player.giveaways_23_24 !== undefined ? Number(player.giveaways_23_24) : undefined,
        takeaways: player.takeaways_23_24 !== undefined ? Number(player.takeaways_23_24) : undefined,
        individualCorsiFor: player.icf_23_24 !== undefined ? Number(player.icf_23_24) : undefined,
        individualExpectedGoals: player.ixg_23_24 !== undefined ? Number(player.ixg_23_24) : undefined,
        goalsAboveReplacement: player.gar_23_24 !== undefined ? Number(player.gar_23_24) : undefined,
        winsAboveReplacement: player.war_23_24 !== undefined ? Number(player.war_23_24) : undefined,
      })
    }

    // 2024-25 Season
    if (seasonHasData("24_25")) {
      stats.push({
        playerId: playerId,
        season: "2024-25",
        team: team,
        position: position,
        gamesPlayed: player.gp_24_25 || 82, // Default to 82 if not specified
        goals: player.goals_24_25 !== undefined ? Number(player.goals_24_25) : undefined,
        assists: player.a1_24_25 !== undefined ? Number(player.a1_24_25) : undefined,
        points:
          player.goals_24_25 !== undefined && player.a1_24_25 !== undefined
            ? Number(player.goals_24_25) + Number(player.a1_24_25)
            : undefined,
        timeOnIce: player.toi_24_25 !== undefined ? Number(player.toi_24_25) : undefined,
        giveaways: player.giveaways_24_25 !== undefined ? Number(player.giveaways_24_25) : undefined,
        takeaways: player.takeaways_24_25 !== undefined ? Number(player.takeaways_24_25) : undefined,
        individualCorsiFor: player.icf_24_25 !== undefined ? Number(player.icf_24_25) : undefined,
        individualExpectedGoals: player.ixg_24_25 !== undefined ? Number(player.ixg_24_25) : undefined,
        goalsAboveReplacement: player.gar_24_25 !== undefined ? Number(player.gar_24_25) : undefined,
        winsAboveReplacement: player.war_24_25 !== undefined ? Number(player.war_24_25) : undefined,
      })
    }

    console.log(`Created ${stats.length} stat entries for player ID ${playerId}`)

    // If no stats were created, return an empty array instead of mock data
    if (stats.length === 0) {
      console.warn(`No stats created for player ID ${playerId}`)
      return []
    }

    return stats
  } catch (error) {
    console.error(`Failed to fetch stats for player with id ${playerId}:`, error)
    // Return empty array instead of mock data to make it clear there was an error
    return []
  }
}

// For backward compatibility with the original code
export async function getPlants() {
  return []
}

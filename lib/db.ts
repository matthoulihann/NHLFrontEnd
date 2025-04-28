/**
 * Database utility functions for the NHL Free Agent Evaluation app
 * This file centralizes all database connection logic
 */

// Only import mysql on the server side
let mysql: any = null

/**
 * Load the MySQL module dynamically (server-side only)
 */
async function loadMysql() {
  if (typeof window === "undefined") {
    try {
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

// Update the getDbPool function to use individual environment variables as fallback
export async function getDbPool() {
  if (!pool && !mysql) {
    // Try to load MySQL first
    const loaded = await loadMysql()
    if (!loaded) {
      console.warn("MySQL could not be loaded")
      return null
    }
  }

  if (!pool && mysql) {
    try {
      // First try to use DATABASE_URL if available
      if (process.env.DATABASE_URL) {
        const dbUrl = process.env.DATABASE_URL
        const redactedUrl = dbUrl.replace(/:([^@]*)@/, ":****@")
        console.log(`Connecting to database using URL: ${redactedUrl}`)

        // Create a connection pool with SSL options
        const connectionConfig = {
          uri: process.env.DATABASE_URL,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          ssl: {
            rejectUnauthorized: false, // Accept self-signed certificates
          },
        }

        pool = mysql.createPool(connectionConfig)
      }
      // Fallback to individual connection parameters
      else if (process.env.DATABASE_HOST && process.env.DATABASE_USER) {
        console.log(`Connecting to database using individual parameters: ${process.env.DATABASE_HOST}`)

        // Create a connection pool with individual parameters
        const connectionConfig = {
          host: process.env.DATABASE_HOST,
          user: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
          port: process.env.DATABASE_PORT ? Number.parseInt(process.env.DATABASE_PORT) : 3306,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          ssl: {
            rejectUnauthorized: false,
          },
        }

        pool = mysql.createPool(connectionConfig)
      } else {
        throw new Error("No database connection information available")
      }

      console.log("MySQL connection pool created successfully")

      // Test the connection
      try {
        const [result] = await pool.query("SELECT 1 as test")
        console.log("Database connection test successful:", result)
      } catch (err) {
        console.error("Database connection test failed:", err)
      }
    } catch (error) {
      console.error("Failed to create MySQL pool:", error)
      return null
    }
  }

  return pool
}

/**
 * Execute a database query
 * @param query SQL query string
 * @param params Query parameters
 * @returns Query result
 */
export async function executeQuery(query: string, params: any[] = []) {
  const pool = await getDbPool()
  if (!pool) {
    throw new Error("Database connection not available")
  }

  try {
    const [result] = await pool.query(query, params)
    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

/**
 * Check if the database connection is working
 * @returns True if connection is working, false otherwise
 */
export async function testConnection() {
  try {
    const pool = await getDbPool()
    if (!pool) return false

    const [result] = await pool.query("SELECT 1 as test")
    return result && result[0] && result[0].test === 1
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}

// Add this alias for backward compatibility with existing code
export const getPool = getDbPool

export default {
  executeQuery,
  testConnection,
  getPool: getDbPool, // Change this to explicitly use getDbPool
}

import { NextResponse } from "next/server"
import { testConnection, executeQuery } from "@/lib/db"

export async function GET() {
  try {
    // Test the database connection
    const isConnected = await testConnection()

    // Try a simple query to verify database access
    let queryResult = null
    if (isConnected) {
      try {
        queryResult = await executeQuery("SELECT 1 as test")
      } catch (queryError) {
        console.error("Query error:", queryError)
      }
    }

    return NextResponse.json({
      success: isConnected,
      message: isConnected ? "Database connection successful" : "Database connection failed",
      queryResult,
      envVars: {
        url: process.env.DATABASE_URL ? "Set" : "Not set",
        host: process.env.DATABASE_HOST ? "Set" : "Not set",
        user: process.env.DATABASE_USER ? "Set" : "Not set",
        password: process.env.DATABASE_PASSWORD ? "Set" : "Not set",
        database: process.env.DATABASE_NAME ? "Set" : "Not set",
        port: process.env.DATABASE_PORT ? "Set" : "Not set",
      },
    })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error testing database connection",
        error: error.message,
        envVars: {
          url: process.env.DATABASE_URL ? "Set" : "Not set",
          host: process.env.DATABASE_HOST ? "Set" : "Not set",
          user: process.env.DATABASE_USER ? "Set" : "Not set",
          password: process.env.DATABASE_PASSWORD ? "Set" : "Not set",
          database: process.env.DATABASE_NAME ? "Set" : "Not set",
          port: process.env.DATABASE_PORT ? "Set" : "Not set",
        },
      },
      { status: 500 },
    )
  }
}

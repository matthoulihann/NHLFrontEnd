import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url)
    const search = url.searchParams.get("search") || ""
    const valueTier = url.searchParams.get("valueTier") || "all"
    const position = url.searchParams.get("position") || "all"

    // Build the WHERE clause
    let whereClause = "name LIKE ?"
    const params = [`%${search}%`]

    // Add position filter if specified
    if (position !== "all") {
      whereClause += " AND position = ?"
      params.push(position)
    }

    // Add value tier filter if specified
    if (valueTier !== "all") {
      switch (valueTier) {
        case "excellent":
          whereClause += " AND contract_value_score >= 80"
          break
        case "good":
          whereClause += " AND contract_value_score >= 65 AND contract_value_score < 80"
          break
        case "fair":
          whereClause += " AND contract_value_score >= 50 AND contract_value_score < 65"
          break
        case "below-average":
          whereClause += " AND contract_value_score >= 35 AND contract_value_score < 50"
          break
        case "poor":
          whereClause += " AND contract_value_score < 35"
          break
      }
    }

    // Query to get all players with basic info and contract value score
    const query = `
      SELECT 
        id, 
        name, 
        team, 
        position,
        contract_value,
        contract_years,
        contract_value_score
      FROM 
        players
      WHERE 
        ${whereClause}
      ORDER BY 
        name ASC
      LIMIT 50
    `

    console.log("Executing query with params:", params)
    const players = await executeQuery(query, params)
    console.log(`Found ${players.length} players matching criteria`)

    return NextResponse.json({ players })
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
  }
}

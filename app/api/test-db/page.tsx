import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { testConnection, executeQuery } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function DbTestPage() {
  // Test the database connection
  let connectionStatus = "Unknown"
  let errorMessage = ""
  let playerCount = 0
  const envVars = {
    url: process.env.DATABASE_URL ? "Set" : "Not set",
    host: process.env.DATABASE_HOST ? "Set" : "Not set",
    user: process.env.DATABASE_USER ? "Set" : "Not set",
    password: process.env.DATABASE_PASSWORD ? "Set (hidden)" : "Not set",
    database: process.env.DATABASE_NAME ? "Set" : "Not set",
    port: process.env.DATABASE_PORT ? "Set" : "Not set",
  }

  try {
    const isConnected = await testConnection()
    connectionStatus = isConnected ? "Connected" : "Failed"

    if (isConnected) {
      // Try to count players in the database
      try {
        const result = await executeQuery("SELECT COUNT(*) as count FROM projected_contracts")
        playerCount = result[0].count
      } catch (queryError) {
        errorMessage = `Connection successful but query failed: ${queryError instanceof Error ? queryError.message : String(queryError)}`
      }
    }
  } catch (error) {
    connectionStatus = "Error"
    errorMessage = error instanceof Error ? error.message : String(error)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
          <CardDescription>Testing connection to your MySQL database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Connection Status</h3>
                <div
                  className={`p-4 rounded-md ${
                    connectionStatus === "Connected"
                      ? "bg-green-100 text-green-800"
                      : connectionStatus === "Failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  <p className="font-medium">{connectionStatus}</p>
                  {errorMessage && <p className="text-sm mt-2">{errorMessage}</p>}
                  {connectionStatus === "Connected" && (
                    <p className="text-sm mt-2">Found {playerCount} players in the database.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Environment Variables</h3>
                <div className="p-4 rounded-md bg-gray-100">
                  <ul className="space-y-1 text-sm">
                    <li>
                      <span className="font-medium">DATABASE_URL:</span> {envVars.url}
                    </li>
                    <li>
                      <span className="font-medium">DATABASE_HOST:</span> {envVars.host}
                    </li>
                    <li>
                      <span className="font-medium">DATABASE_USER:</span> {envVars.user}
                    </li>
                    <li>
                      <span className="font-medium">DATABASE_PASSWORD:</span> {envVars.password}
                    </li>
                    <li>
                      <span className="font-medium">DATABASE_NAME:</span> {envVars.database}
                    </li>
                    <li>
                      <span className="font-medium">DATABASE_PORT:</span> {envVars.port}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

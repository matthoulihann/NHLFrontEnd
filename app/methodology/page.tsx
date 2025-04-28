import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"

export default function MethodologyPage() {
  return (
    <div className="container max-w-4xl py-8 px-4 md:px-6 lg:py-12">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-primary hover:underline mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Methodology</h1>
        <p className="text-xl text-muted-foreground">
          Our free agent contract evaluation system is built through a structured, multi-step modeling approach designed
          to project player value based on historical performance, contract trends, and market conditions.
        </p>
      </div>

      <nav className="mb-10 p-4 bg-muted rounded-lg">
        <h2 className="font-semibold mb-2">Quick Navigation</h2>
        <ul className="space-y-1">
          <li>
            <a href="#data-collection" className="text-primary hover:underline inline-flex items-center">
              <ChevronRight className="h-4 w-4 mr-1" />
              Data Collection and Preparation
            </a>
          </li>
          <li>
            <a href="#term-prediction" className="text-primary hover:underline inline-flex items-center">
              <ChevronRight className="h-4 w-4 mr-1" />
              Contract Term Prediction Model
            </a>
          </li>
          <li>
            <a href="#cap-hit" className="text-primary hover:underline inline-flex items-center">
              <ChevronRight className="h-4 w-4 mr-1" />
              Cap Hit Percentage Prediction Model
            </a>
          </li>
          <li>
            <a href="#gar-projection" className="text-primary hover:underline inline-flex items-center">
              <ChevronRight className="h-4 w-4 mr-1" />
              GAR Projection for 2025–6
            </a>
          </li>
          <li>
            <a href="#value-assessment" className="text-primary hover:underline inline-flex items-center">
              <ChevronRight className="h-4 w-4 mr-1" />
              Value Assessment
            </a>
          </li>
          <li>
            <a href="#final-outputs" className="text-primary hover:underline inline-flex items-center">
              <ChevronRight className="h-4 w-4 mr-1" />
              Final Outputs
            </a>
          </li>
        </ul>
      </nav>

      <div className="space-y-12">
        <section id="data-collection">
          <h2 className="text-2xl font-bold tracking-tight mb-4">1. Data Collection and Preparation</h2>
          <div className="prose max-w-none">
            <p>We aggregate and clean multiple sources of NHL player data, including:</p>
            <ul>
              <li>Historical Goals Above Replacement (GAR) statistics (2022–2025)</li>
              <li>Projected GAR for upcoming seasons</li>
              <li>
                NHL contract data from 2018–2024, covering Age, Term, Average Annual Value (AAV), UFA/RFA status, and
                cap hit percentage
              </li>
              <li>
                Player usage metrics such as Time on Ice (TOI%), individual Corsi For (iCF), and primary assists (A1)
              </li>
            </ul>
            <p>
              Players are standardized across seasons, and goalies are removed from modeling to focus exclusively on
              skaters.
            </p>
            <p>
              Weighted rolling averages and optimized feature transformations are applied to player performance metrics
              to better capture true talent trends entering free agency.
            </p>
          </div>
        </section>

        <section id="term-prediction">
          <h2 className="text-2xl font-bold tracking-tight mb-4">2. Contract Term Prediction Model</h2>
          <div className="prose max-w-none">
            <p>We predict the expected contract term for free agents using a Random Forest Regressor, trained on:</p>
            <ul>
              <li>Player Age</li>
              <li>UFA/RFA Status</li>
              <li>Recent performance metrics (GAR, WAR, TOI)</li>
              <li>Historical contract outcomes (from 2018–2024)</li>
            </ul>
            <p>
              The model learns relationships between a player's age, performance, and market value to project the most
              likely contract length in years.
            </p>
          </div>
        </section>

        <section id="cap-hit">
          <h2 className="text-2xl font-bold tracking-tight mb-4">3. Cap Hit Percentage Prediction Model</h2>
          <div className="prose max-w-none">
            <p>
              We predict the cap hit percentage (percentage of the salary cap allocated to the player) using a separate
              Random Forest Regressor, trained on:
            </p>
            <ul>
              <li>Weighted performance metrics (GAR, WAR, TOI, A1)</li>
              <li>Player usage statistics</li>
              <li>Historical cap hit data</li>
            </ul>
            <p>
              The predicted cap hit percentage is then multiplied by the projected $95.5M salary cap to calculate each
              player's predicted AAV (Average Annual Value).
            </p>
          </div>
        </section>

        <section id="gar-projection">
          <h2 className="text-2xl font-bold tracking-tight mb-4">4. GAR Projection for 2025–6</h2>
          <div className="prose max-w-none">
            <p>
              Projected GAR for the upcoming 2025–26 season is calculated using a Ridge Regression model that balances:
            </p>
            <ul>
              <li>Recent GAR trends</li>
              <li>Adjusted player usage</li>
              <li>Expected regression or progression patterns</li>
            </ul>
            <p>The model emphasizes more recent seasons but incorporates prior years' data to stabilize projections.</p>
          </div>
        </section>

        <section id="value-assessment">
          <h2 className="text-2xl font-bold tracking-tight mb-4">5. Value Assessment</h2>
          <div className="prose max-w-none">
            <p>Using the player's predicted AAV and projected GAR, we calculate a contract value score:</p>
            <ul>
              <li>Value Per GAR: Predicted AAV divided by projected GAR</li>
              <li>
                Contract Value Score: A standardized score (0–100) comparing each player's cost-efficiency relative to
                historical league norms
              </li>
            </ul>
            <p>Higher value scores indicate stronger projected returns on investment for teams.</p>
          </div>
        </section>

        <section id="final-outputs">
          <h2 className="text-2xl font-bold tracking-tight mb-4">6. Final Outputs</h2>
          <div className="prose max-w-none">
            <p>Each free agent is displayed with:</p>
            <ul>
              <li>Projected Term</li>
              <li>Projected AAV</li>
              <li>Projected GAR for 2024–25</li>
              <li>Contract Value Score (0–100)</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

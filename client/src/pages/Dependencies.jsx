import { DependencyGraph } from "../components/dependencies/dependency-graph"
import { DependencyControls } from "../components/dependencies/dependency-controls"

function Dependencies() {
  return (
    <div className="h-screen flex flex-col space-y-6 overflow-y-auto px-4 md:px-6 py-6">
      <h1 className="text-3xl font-bold">Task Dependencies</h1>
      <p className="text-muted-foreground">Visualize and manage task dependencies across departments</p>

      <DependencyControls />

      <div className="border rounded-lg p-4 flex-1 bg-background">
        <DependencyGraph />
      </div>
    </div>
  )
}

export default Dependencies
export function PipelinesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Pipelines</h1>

      <div className="grid gap-4">
        <div className="bg-eve-900 rounded-lg border border-eve-800 p-6">
          <h2 className="text-xl font-semibold text-eve-200 mb-4">Recent Runs</h2>
          <p className="text-eve-300 text-center py-8">
            Pipeline runs with step-by-step execution and logs coming soon...
          </p>
        </div>

        <div className="bg-eve-900 rounded-lg border border-eve-800 p-6">
          <h2 className="text-xl font-semibold text-eve-200 mb-4">Pipeline Definitions</h2>
          <p className="text-eve-300 text-center py-8">
            Configure and manage pipeline workflows coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

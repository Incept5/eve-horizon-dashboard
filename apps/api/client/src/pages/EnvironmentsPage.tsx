export function EnvironmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Environments</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {['Production', 'Staging', 'Development'].map((env) => (
          <div key={env} className="bg-eve-900 rounded-lg border border-eve-800 p-6">
            <h2 className="text-xl font-semibold text-eve-200 mb-2">{env}</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-eve-300 text-sm">Status: Healthy</span>
              </div>
              <p className="text-eve-400 text-sm">
                Deployment tracking and environment status coming soon...
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

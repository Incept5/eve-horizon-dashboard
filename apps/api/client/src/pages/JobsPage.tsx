export function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Jobs</h1>
        <div className="flex gap-2">
          <select className="px-4 py-2 bg-eve-800 text-eve-200 border border-eve-700 rounded-lg">
            <option>All Statuses</option>
            <option>Running</option>
            <option>Completed</option>
            <option>Failed</option>
          </select>
          <button className="px-4 py-2 bg-eve-600 hover:bg-eve-500 text-white rounded-lg transition-colors">
            + New Job
          </button>
        </div>
      </div>

      <div className="bg-eve-900 rounded-lg border border-eve-800 p-8">
        <p className="text-eve-300 text-center">
          Job table with filters, search, and status tracking coming soon...
        </p>
      </div>
    </div>
  );
}

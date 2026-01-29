export function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <button className="px-4 py-2 bg-eve-600 hover:bg-eve-500 text-white rounded-lg transition-colors">
          + New Project
        </button>
      </div>

      <div className="bg-eve-900 rounded-lg border border-eve-800 p-8">
        <p className="text-eve-300 text-center">
          Project list and management interface coming soon...
        </p>
      </div>
    </div>
  );
}

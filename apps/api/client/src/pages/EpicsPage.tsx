export function EpicsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Epics</h1>
        <button className="px-4 py-2 bg-eve-600 hover:bg-eve-500 text-white rounded-lg transition-colors">
          + New Epic
        </button>
      </div>

      <div className="bg-eve-900 rounded-lg border border-eve-800 p-8">
        <p className="text-eve-300 text-center">
          Epic tree view with drilldown and hierarchy management coming soon...
        </p>
      </div>
    </div>
  );
}

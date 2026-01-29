export function SystemPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">System Administration</h1>

      <div className="grid gap-4">
        <div className="bg-eve-900 rounded-lg border border-eve-800 p-6">
          <h2 className="text-xl font-semibold text-eve-200 mb-4">Organizations</h2>
          <p className="text-eve-300 text-center py-4">
            Organization management coming soon...
          </p>
        </div>

        <div className="bg-eve-900 rounded-lg border border-eve-800 p-6">
          <h2 className="text-xl font-semibold text-eve-200 mb-4">Members & Permissions</h2>
          <p className="text-eve-300 text-center py-4">
            User and role management coming soon...
          </p>
        </div>

        <div className="bg-eve-900 rounded-lg border border-eve-800 p-6">
          <h2 className="text-xl font-semibold text-eve-200 mb-4">Event Log</h2>
          <p className="text-eve-300 text-center py-4">
            System-wide event audit log coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

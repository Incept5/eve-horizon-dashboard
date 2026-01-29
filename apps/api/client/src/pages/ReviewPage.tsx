export function ReviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Review Queue</h1>

      <div className="bg-eve-900 rounded-lg border border-eve-800 p-8">
        <div className="text-center space-y-4">
          <div className="text-4xl">✓</div>
          <p className="text-eve-300">
            Items pending review and PR links coming soon...
          </p>
          <p className="text-eve-400 text-sm">
            This will show jobs, epics, and other items requiring human review
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: '/projects', label: 'Projects', icon: '📋' },
  { path: '/board', label: 'Board', icon: '🎯' },
  { path: '/epics', label: 'Epics', icon: '🌳' },
  { path: '/jobs', label: 'Jobs', icon: '⚙️' },
  { path: '/pipelines', label: 'Pipelines', icon: '🔄' },
  { path: '/environments', label: 'Environments', icon: '🌍' },
  { path: '/review', label: 'Review', icon: '✓' },
  { path: '/system', label: 'System', icon: '⚡', adminOnly: true },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-eve-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-eve-900 border-b border-eve-800 z-30">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-eve-800 rounded transition-colors"
              aria-label="Toggle sidebar"
            >
              <span className="text-xl">{sidebarOpen ? '✕' : '☰'}</span>
            </button>
            <h1 className="text-xl font-bold text-eve-200">Eve Horizon</h1>
          </div>

          {/* Project Switcher Placeholder */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-eve-800 rounded-lg border border-eve-700 hover:border-eve-600 transition-colors cursor-pointer">
              <span className="text-eve-300 text-sm">Project: horizon-core ▾</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 w-60 bg-eve-900 border-r border-eve-800 z-20
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${
                  isActive(item.path)
                    ? 'bg-eve-800 text-white border border-eve-700 shadow-lg'
                    : 'text-eve-300 hover:bg-eve-800/50 hover:text-white'
                }
                ${item.adminOnly ? 'mt-8 border-t border-eve-800 pt-8' : ''}
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`
          pt-16 transition-all duration-300
          ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-0'}
        `}
      >
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useRoleContext } from '../contexts/RoleContext';
import { Badge } from './ui/Badge';
import { ProjectSwitcher } from './ProjectSwitcher';
import { CommandPalette } from './CommandPalette';
import { ShortcutsHelp } from './ShortcutsHelp';

// ---------------------------------------------------------------------------
// SVG Icon Components — small, inline, heroicons-style
// ---------------------------------------------------------------------------

function IconGrid({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function IconKanban({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function IconLayers({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25" />
    </svg>
  );
}

function IconWrench({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.84 5.66a2.12 2.12 0 01-3-3l5.66-5.84m2.18 3.18a5.25 5.25 0 007.37-7.37l-2.12 2.12a3 3 0 01-4.24 0l-.01-.01a3 3 0 010-4.24l2.12-2.12a5.25 5.25 0 00-7.37 7.37m2.18 3.18L3 21m18-9.75h1.5m-13.5 0H3m18 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconCheckCircle({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconPackage({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function IconRefresh({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M20.016 4.656v4.992" />
    </svg>
  );
}

function IconGitBranch({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21v-6a3 3 0 013-3h4a3 3 0 013 3v6M7.5 3v6m0 0a3 3 0 003 3m-3-3a3 3 0 013 3m9-9v6m0 0a3 3 0 01-3 3m3-3a3 3 0 00-3 3" />
    </svg>
  );
}

function IconGlobe({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
    </svg>
  );
}

function IconCog({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconShield({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Navigation section types
// ---------------------------------------------------------------------------

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

// ---------------------------------------------------------------------------
// Layout Component
// ---------------------------------------------------------------------------

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [pendingNavKey, setPendingNavKey] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuthContext();
  const { canManageProject, isPlatformAdmin } = useRoleContext();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build nav sections, filtering admin items by role
  const workSection: NavSection = {
    label: 'Work',
    items: [
      { path: '/projects', label: 'Projects', icon: <IconGrid /> },
      { path: '/board', label: 'Board', icon: <IconKanban /> },
      { path: '/epics', label: 'Epics', icon: <IconLayers /> },
      { path: '/jobs', label: 'Jobs', icon: <IconWrench /> },
      { path: '/review', label: 'Review', icon: <IconCheckCircle /> },
    ],
  };

  const devopsSection: NavSection = {
    label: 'DevOps',
    items: [
      { path: '/builds', label: 'Builds', icon: <IconPackage /> },
      { path: '/pipelines', label: 'Pipelines', icon: <IconRefresh /> },
      { path: '/workflows', label: 'Workflows', icon: <IconGitBranch /> },
      { path: '/environments', label: 'Environments', icon: <IconGlobe /> },
    ],
  };

  const adminItems: NavItem[] = [];
  if (canManageProject) {
    adminItems.push({ path: '/settings', label: 'Settings', icon: <IconCog /> });
  }
  if (isPlatformAdmin) {
    adminItems.push({ path: '/system', label: 'System', icon: <IconShield /> });
  }

  const adminSection: NavSection | null =
    adminItems.length > 0 ? { label: 'Admin', items: adminItems } : null;

  const sections: NavSection[] = [workSection, devopsSection];
  if (adminSection) sections.push(adminSection);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette - Cmd/Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Shortcuts help - ?
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShortcutsHelpOpen(true);
          return;
        }
      }

      // Escape - Close modals/drawers
      if (e.key === 'Escape') {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
          return;
        }
        if (shortcutsHelpOpen) {
          setShortcutsHelpOpen(false);
          return;
        }
      }

      // Navigation shortcuts - G then X pattern
      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          setPendingNavKey('g');
          return;
        }
      }

      // Handle second key after G
      if (pendingNavKey === 'g') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          switch (e.key.toLowerCase()) {
            case 'p':
              navigate('/projects');
              break;
            case 'b':
              navigate('/board');
              break;
            case 'j':
              navigate('/jobs');
              break;
            case 'e':
              navigate('/epics');
              break;
            case 'd':
              navigate('/builds');
              break;
            case 'w':
              navigate('/workflows');
              break;
            case 's':
              navigate('/settings');
              break;
            case 'i':
              navigate('/pipelines');
              break;
            case 'v':
              navigate('/environments');
              break;
            case 'r':
              navigate('/review');
              break;
          }
          setPendingNavKey(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, commandPaletteOpen, shortcutsHelpOpen, pendingNavKey]);

  // Reset pending nav key after timeout
  useEffect(() => {
    if (pendingNavKey) {
      const timeout = setTimeout(() => {
        setPendingNavKey(null);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [pendingNavKey]);

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
              <span className="text-xl">{sidebarOpen ? '\u2715' : '\u2630'}</span>
            </button>
            <h1 className="text-xl font-bold text-eve-200">Eve Horizon</h1>
          </div>

          {/* Project Switcher */}
          <div className="flex items-center gap-3">
            <ProjectSwitcher />
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
        <nav className="p-4 flex flex-col h-full overflow-y-auto">
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.label}>
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-eve-500">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                        ${
                          isActive(item.path)
                            ? 'bg-eve-800 text-white border border-eve-700 shadow-lg'
                            : 'text-eve-300 hover:bg-eve-800/50 hover:text-white'
                        }
                      `}
                    >
                      <span className="flex-shrink-0 text-eve-400">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* User section - bottom of sidebar */}
          <div className="mt-auto border-t border-eve-800 pt-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-eve-700 flex items-center justify-center">
                <span className="text-sm font-medium">{user?.email?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                {isAdmin && <Badge variant="info">Admin</Badge>}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-2 px-3 py-2 text-left text-sm text-eve-300 hover:text-white hover:bg-eve-800 rounded transition-colors"
            >
              Sign out
            </button>
          </div>
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

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Shortcuts Help */}
      <ShortcutsHelp
        isOpen={shortcutsHelpOpen}
        onClose={() => setShortcutsHelpOpen(false)}
      />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  section: string;
  action: () => void;
  adminOnly?: boolean;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateJob?: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenCreateJob }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAuthContext();

  const allCommands: Command[] = [
    // Navigation — Work
    {
      id: 'nav-projects',
      label: 'Go to Projects',
      description: 'View all projects',
      shortcut: 'G then P',
      section: 'Navigation',
      action: () => { navigate('/projects'); onClose(); },
    },
    {
      id: 'nav-board',
      label: 'Go to Board',
      description: 'View kanban board',
      shortcut: 'G then B',
      section: 'Navigation',
      action: () => { navigate('/board'); onClose(); },
    },
    {
      id: 'nav-epics',
      label: 'Go to Epics',
      description: 'View all epics',
      shortcut: 'G then E',
      section: 'Navigation',
      action: () => { navigate('/epics'); onClose(); },
    },
    {
      id: 'nav-jobs',
      label: 'Go to Jobs',
      description: 'View all jobs',
      shortcut: 'G then J',
      section: 'Navigation',
      action: () => { navigate('/jobs'); onClose(); },
    },
    {
      id: 'nav-review',
      label: 'Go to Review',
      description: 'Review pending items',
      shortcut: 'G then R',
      section: 'Navigation',
      action: () => { navigate('/review'); onClose(); },
    },
    // Navigation — DevOps
    {
      id: 'nav-builds',
      label: 'Go to Builds',
      description: 'View build history',
      shortcut: 'G then D',
      section: 'Navigation',
      action: () => { navigate('/builds'); onClose(); },
    },
    {
      id: 'nav-pipelines',
      label: 'Go to Pipelines',
      description: 'View pipelines',
      shortcut: 'G then I',
      section: 'Navigation',
      action: () => { navigate('/pipelines'); onClose(); },
    },
    {
      id: 'nav-workflows',
      label: 'Go to Workflows',
      description: 'View workflows',
      shortcut: 'G then W',
      section: 'Navigation',
      action: () => { navigate('/workflows'); onClose(); },
    },
    {
      id: 'nav-environments',
      label: 'Go to Environments',
      description: 'View environments',
      shortcut: 'G then V',
      section: 'Navigation',
      action: () => { navigate('/environments'); onClose(); },
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings',
      description: 'Project settings',
      shortcut: 'G then S',
      section: 'Navigation',
      action: () => { navigate('/settings'); onClose(); },
    },
    {
      id: 'nav-system',
      label: 'Go to System',
      description: 'System administration',
      section: 'Navigation',
      adminOnly: true,
      action: () => { navigate('/system'); onClose(); },
    },
    // Quick Actions
    {
      id: 'create-job',
      label: 'Create New Job',
      description: 'Create a new job or task',
      section: 'Actions',
      action: () => {
        onClose();
        if (onOpenCreateJob) onOpenCreateJob();
      },
    },
    {
      id: 'deploy-staging',
      label: 'Deploy to Staging',
      description: 'Navigate to environments for deployment',
      section: 'Actions',
      action: () => { navigate('/environments'); onClose(); },
    },
    {
      id: 'invite-user',
      label: 'Invite User',
      description: 'Invite a new user to the platform',
      section: 'Actions',
      adminOnly: true,
      action: () => { navigate('/system'); onClose(); },
    },
  ];

  const filteredCommands = allCommands
    .filter((cmd) => !cmd.adminOnly || isAdmin)
    .filter((cmd) => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        cmd.label.toLowerCase().includes(searchLower) ||
        cmd.description?.toLowerCase().includes(searchLower)
      );
    });

  // Group by section for display
  const sections = filteredCommands.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.section]) acc[cmd.section] = [];
    acc[cmd.section].push(cmd);
    return acc;
  }, {});

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Flatten index counter for arrow-key navigation across sections
  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-2xl mx-4 bg-eve-900 border border-eve-700 rounded-lg shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center border-b border-eve-700 px-4 py-3">
          <svg
            className="w-5 h-5 text-eve-400 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-eve-400 outline-none text-base"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-eve-400 bg-eve-800 border border-eve-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-eve-400">
              No commands found
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(sections).map(([sectionName, commands]) => (
                <div key={sectionName}>
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-eve-500">
                    {sectionName}
                  </p>
                  {commands.map((command) => {
                    const idx = flatIndex++;
                    return (
                      <button
                        key={command.id}
                        onClick={() => command.action()}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          idx === selectedIndex
                            ? 'bg-eve-800 text-white'
                            : 'text-eve-300 hover:bg-eve-800/50 hover:text-white'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{command.label}</div>
                          {command.description && (
                            <div className="text-sm text-eve-400 mt-0.5">
                              {command.description}
                            </div>
                          )}
                        </div>
                        {command.shortcut && (
                          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-eve-400 bg-eve-800 border border-eve-700 rounded">
                            {command.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-eve-700 text-xs text-eve-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-eve-800 border border-eve-700 rounded">
                {'\u2191\u2193'}
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-eve-800 border border-eve-700 rounded">
                {'\u21B5'}
              </kbd>
              <span>Select</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-eve-800 border border-eve-700 rounded">
              {'\u2318K'}
            </kbd>
            <span>to close</span>
          </span>
        </div>
      </div>
    </div>
  );
}

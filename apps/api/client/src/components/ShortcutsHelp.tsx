import React, { useEffect } from 'react';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  shortcuts: ShortcutItem[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['ESC'], description: 'Close modals and drawers' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['G', 'P'], description: 'Go to Projects' },
      { keys: ['G', 'B'], description: 'Go to Board' },
      { keys: ['G', 'J'], description: 'Go to Jobs' },
      { keys: ['G', 'E'], description: 'Go to Epics' },
    ],
  },
];

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl mx-4 bg-eve-900 border border-eve-700 rounded-lg shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-eve-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⌨️</span>
            <h2 id="shortcuts-title" className="text-xl font-semibold text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-eve-400 hover:text-eve-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eve-600 rounded"
            aria-label="Close shortcuts help"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[600px] overflow-y-auto">
          <div className="space-y-8">
            {shortcutCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-sm font-semibold text-eve-300 uppercase tracking-wider mb-4">
                  {category.title}
                </h3>
                <div className="space-y-3">
                  {category.shortcuts.map((shortcut, shortcutIndex) => (
                    <div
                      key={shortcutIndex}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-eve-800/50 transition-colors"
                    >
                      <span className="text-eve-200">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 text-sm font-medium text-eve-200 bg-eve-800 border border-eve-700 rounded shadow-sm">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-eve-500 text-sm">then</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-eve-700">
          <p className="text-sm text-eve-400 text-center">
            Press{' '}
            <kbd className="px-2 py-1 text-xs font-medium text-eve-200 bg-eve-800 border border-eve-700 rounded">
              ESC
            </kbd>{' '}
            or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}

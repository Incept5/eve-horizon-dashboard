/**
 * ProjectSwitcher - Dropdown component for switching between projects
 * Shows current project and allows filtering/selecting from all available projects
 */

import { useState, useRef, useEffect } from 'react';
import { useProjectContext } from '../contexts/ProjectContext';

export function ProjectSwitcher() {
  const { projects, currentProject, isLoading, setCurrentProject } = useProjectContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      project.slug.toLowerCase().includes(query)
    );
  });

  const handleProjectSelect = (project: typeof projects[0]) => {
    setCurrentProject(project);
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchQuery('');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 py-2 bg-eve-800 rounded-lg border border-eve-700">
        <span className="text-eve-400 text-sm">Loading projects...</span>
      </div>
    );
  }

  // Empty state - no projects available
  if (projects.length === 0) {
    return (
      <div className="px-4 py-2 bg-eve-800 rounded-lg border border-eve-700">
        <span className="text-eve-400 text-sm">No projects available</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleDropdown}
        className="px-4 py-2 bg-eve-800 rounded-lg border border-eve-700 hover:border-eve-600 transition-colors cursor-pointer flex items-center gap-2"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-eve-300 text-sm">
          Project: {currentProject?.name || 'Select project'}
        </span>
        <span className={`text-eve-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-eve-800 border border-eve-700 rounded-lg shadow-xl z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-eve-700">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full px-3 py-2 bg-eve-900 border border-eve-700 rounded text-white text-sm placeholder-eve-500 focus:outline-none focus:border-eve-500"
            />
          </div>

          {/* Project List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredProjects.length === 0 ? (
              <div className="p-4 text-center text-eve-500 text-sm">
                No projects match your search
              </div>
            ) : (
              filteredProjects.map((project) => {
                const isCurrentProject = currentProject?.id === project.id;
                return (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    className={`
                      w-full px-4 py-3 text-left flex items-center justify-between
                      transition-colors
                      ${
                        isCurrentProject
                          ? 'bg-eve-700 text-white'
                          : 'text-eve-300 hover:bg-eve-700/50 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {project.name}
                      </div>
                      <div className="text-xs text-eve-400 truncate">
                        {project.slug}
                      </div>
                    </div>
                    {isCurrentProject && (
                      <span className="ml-2 text-eve-400 flex-shrink-0">✓</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

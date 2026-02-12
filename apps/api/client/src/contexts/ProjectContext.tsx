/**
 * ProjectContext - Global project selection state management
 * Provides current project state and methods throughout the application
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { get } from '../api/client';
import type { Project, PaginatedResponse } from '../api/types';

const STORAGE_KEY = 'eve_current_project';

interface ProjectContextValue {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  setCurrentProject: (project: Project) => void;
  refetchProjects: () => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

/**
 * Fetch all projects from the API
 */
async function fetchProjects(): Promise<Project[]> {
  const response = await get<PaginatedResponse<Project>>('/projects');
  return response.data;
}

/**
 * ProjectProvider component
 * Manages project selection state and provides project context to the application
 */
export function ProjectProvider({ children }: ProjectProviderProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load projects from API and restore selection from localStorage
   */
  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedProjects = await fetchProjects();
      setProjects(fetchedProjects);

      // Try to restore selected project from localStorage
      const storedProjectId = localStorage.getItem(STORAGE_KEY);
      let selectedProject: Project | null = null;

      if (storedProjectId) {
        selectedProject = fetchedProjects.find(p => String(p.id) === storedProjectId) || null;
      }

      // Auto-select first project if none selected or stored selection is invalid
      if (!selectedProject && fetchedProjects.length > 0) {
        selectedProject = fetchedProjects[0];
      }

      setCurrentProjectState(selectedProject);

      // Persist the selection
      if (selectedProject) {
        localStorage.setItem(STORAGE_KEY, selectedProject.id.toString());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      setProjects([]);
      setCurrentProjectState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initialize projects on mount
   */
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  /**
   * Set the current project and persist to localStorage
   */
  const setCurrentProject = useCallback((project: Project) => {
    setCurrentProjectState(project);
    localStorage.setItem(STORAGE_KEY, project.id.toString());
  }, []);

  /**
   * Refetch projects from the API
   */
  const refetchProjects = useCallback(() => {
    loadProjects();
  }, [loadProjects]);

  const value: ProjectContextValue = {
    projects,
    currentProject,
    isLoading,
    error,
    setCurrentProject,
    refetchProjects,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

/**
 * Hook to access project context
 * Must be used within a ProjectProvider
 */
export function useProjectContext(): ProjectContextValue {
  const context = useContext(ProjectContext);

  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }

  return context;
}

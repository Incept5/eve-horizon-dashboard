import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectContext } from '../contexts/ProjectContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import type { Project } from '../api/types';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, currentProject, setCurrentProject, isLoading, error } = useProjectContext();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.repo_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    navigate('/board');
  };

  const handleCreateProject = () => {
    console.log('Create project clicked - modal/form to be implemented');
  };

  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <Button onClick={handleCreateProject}>
          + Create Project
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-4">
        <Input
          type="text"
          placeholder="Search projects by name, slug, or repository..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-error-900/20 border border-error-700 rounded-lg p-4">
          <p className="text-error-300 text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500"></div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredProjects.length === 0 && projects.length === 0 && (
        <Card>
          <p className="text-eve-300 text-center py-8">
            No projects found. Create your first project to get started.
          </p>
        </Card>
      )}

      {/* No search results */}
      {!isLoading && !error && filteredProjects.length === 0 && projects.length > 0 && (
        <Card>
          <p className="text-eve-300 text-center py-8">
            No projects match your search criteria.
          </p>
        </Card>
      )}

      {/* Project grid */}
      {!isLoading && !error && filteredProjects.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const isSelected = currentProject?.id === project.id;

            return (
              <Card
                key={project.id}
                className={`cursor-pointer transition-all hover:border-eve-600 ${
                  isSelected ? 'border-eve-500 ring-2 ring-eve-500/50' : ''
                }`}
                onClick={() => handleSelectProject(project)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {project.name}
                      </h3>
                      <p className="text-sm text-eve-400">/{project.slug}</p>
                    </div>
                    <Badge variant={isSelected ? 'success' : 'default'}>
                      {isSelected ? 'Selected' : 'Select'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-eve-300">
                      <svg
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      <a
                        href={project.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-eve-200 truncate break-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {truncateUrl(project.repo_url)}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-eve-300">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      <span className="truncate">{project.branch}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-eve-700">
                    <Button
                      variant={isSelected ? 'primary' : 'ghost'}
                      size="sm"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectProject(project);
                      }}
                    >
                      {isSelected ? 'Go to Board' : 'Select Project'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

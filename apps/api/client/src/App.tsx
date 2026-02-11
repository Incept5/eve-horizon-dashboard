import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { LoginPage } from './pages/LoginPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { BoardPage } from './pages/BoardPage';
import { EpicsPage } from './pages/EpicsPage';
import { EpicDetailPage } from './pages/EpicDetailPage';
import { JobsPage } from './pages/JobsPage';
import { PipelinesPage } from './pages/PipelinesPage';
import { EnvironmentsPage } from './pages/EnvironmentsPage';
import { ReviewPage } from './pages/ReviewPage';
import { SystemPage } from './pages/SystemPage';
import { BuildsPage } from './pages/BuildsPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { ProjectSettingsPage } from './pages/ProjectSettingsPage';
import { OrgDetailPage } from './pages/OrgDetailPage';

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/epics" element={<EpicsPage />} />
          <Route path="/epics/:epicId" element={<EpicDetailPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/builds" element={<BuildsPage />} />
          <Route path="/pipelines" element={<PipelinesPage />} />
          <Route path="/workflows" element={<WorkflowsPage />} />
          <Route path="/environments" element={<EnvironmentsPage />} />
          <Route path="/settings" element={<ProjectSettingsPage />} />
          <Route path="/orgs/:orgId" element={<OrgDetailPage />} />

          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route path="/system" element={<SystemPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

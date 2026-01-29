import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProjectsPage } from './pages/ProjectsPage';
import { BoardPage } from './pages/BoardPage';
import { EpicsPage } from './pages/EpicsPage';
import { JobsPage } from './pages/JobsPage';
import { PipelinesPage } from './pages/PipelinesPage';
import { EnvironmentsPage } from './pages/EnvironmentsPage';
import { ReviewPage } from './pages/ReviewPage';
import { SystemPage } from './pages/SystemPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/epics" element={<EpicsPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/pipelines" element={<PipelinesPage />} />
        <Route path="/environments" element={<EnvironmentsPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/system" element={<SystemPage />} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;

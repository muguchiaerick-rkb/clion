import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProjectFormPage from './pages/ProjectFormPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import PublicProjectPage from './pages/PublicProjectPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="projects/new" element={<ProjectFormPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="projects/:projectId/edit" element={<ProjectFormPage />} />
          <Route path="share/:shareId" element={<PublicProjectPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

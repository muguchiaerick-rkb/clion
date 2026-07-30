import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ProjectCard from '../components/ProjectCard';

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadProjects() {
    try {
      setLoading(true);
      setError('');
      const data = await api.listProjects();
      setProjects(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleDelete(projectId) {
    const confirmed = window.confirm('Delete this project and all uploaded files?');
    if (!confirmed) {
      return;
    }

    try {
      await api.deleteProject(projectId);
      await loadProjects();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>All Projects</h1>
          <p>Manage and share project documentation from one place.</p>
        </div>
        <Link className="button" to="/projects/new">New Project</Link>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <p>Loading projects...</p>}

      {!loading && projects.length === 0 && (
        <div className="empty-state">
          <p>No projects yet.</p>
          <Link className="button" to="/projects/new">Create your first project</Link>
        </div>
      )}

      <div className="card-list">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
        ))}
      </div>
    </section>
  );
}

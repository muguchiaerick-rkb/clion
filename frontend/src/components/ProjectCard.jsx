import { Link } from 'react-router-dom';

function formatDate(value) {
  return new Date(value).toLocaleString();
}

export default function ProjectCard({ project, onDelete }) {
  const shareUrl = `${window.location.origin}/share/${project.shareId}`;

  return (
    <article className="card">
      <div className="card-top-row">
        <h2>{project.title}</h2>
        <span className={`pill ${project.status === 'Archived' ? 'pill-archived' : 'pill-active'}`}>
          {project.status}
        </span>
      </div>
      <p>{project.description || 'No description yet.'}</p>
      <div className="meta-grid">
        <span>Progress: {project.progress}%</span>
        <span>Visibility: {project.isPublic ? 'Public' : 'Private'}</span>
        <span>Files: {project.files.length}</span>
        <span>Updated: {formatDate(project.updatedAt)}</span>
      </div>
      {project.isPublic && (
        <p className="share-url">Share URL: <a href={shareUrl}>{shareUrl}</a></p>
      )}
      <div className="action-row">
        <Link className="button" to={`/projects/${project.id}`}>Open</Link>
        <Link className="secondary" to={`/projects/${project.id}/edit`}>Edit</Link>
        <button type="button" className="danger" onClick={() => onDelete(project.id)}>Delete</button>
      </div>
    </article>
  );
}

import { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { api } from '../api';

function formatDate(value) {
  return new Date(value).toLocaleString();
}

function fileTypeLabel(file) {
  if (file.extension === '.md') return 'Markdown';
  if (file.extension === '.pdf') return 'PDF';
  if (file.extension === '.docx') return 'DOCX';
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(file.extension)) return 'Image';
  return 'File';
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMarkdownFileId, setSelectedMarkdownFileId] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [changelogMessage, setChangelogMessage] = useState('');
  const [working, setWorking] = useState(false);

  const coverImage = useMemo(() => {
    if (!project || !project.coverImageFileId) return null;
    return project.files.find((file) => file.id === project.coverImageFileId) || null;
  }, [project]);

  const markdownFiles = useMemo(() => {
    return project ? project.files.filter((file) => file.extension === '.md') : [];
  }, [project]);

  const shareUrl = project?.isPublic ? `${window.location.origin}/share/${project.shareId}` : '';

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        setError('');
        const data = await api.getProject(projectId);
        setProject(data);
        const firstMarkdownFile = data.files.find((file) => file.extension === '.md');
        setSelectedMarkdownFileId((current) => current || firstMarkdownFile?.id || '');
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  useEffect(() => {
    async function loadMarkdown() {
      if (!selectedMarkdownFileId) {
        setMarkdownContent('');
        return;
      }

      try {
        const text = await api.getMarkdown(projectId, selectedMarkdownFileId);
        setMarkdownContent(text);
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadMarkdown();
  }, [projectId, selectedMarkdownFileId]);

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    try {
      setWorking(true);
      const updated = await api.uploadFiles(projectId, files);
      setProject(updated);
      const markdown = files.find((file) => file.name.toLowerCase().endsWith('.md'));
      if (markdown) {
        const latest = updated.files.find((file) => file.originalName === markdown.name);
        if (latest) {
          setSelectedMarkdownFileId(latest.id);
        }
      }
      event.target.value = '';
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorking(false);
    }
  }

  async function handleDeleteFile(fileId) {
    const confirmed = window.confirm('Delete this file?');
    if (!confirmed) return;

    try {
      setWorking(true);
      const updated = await api.deleteFile(projectId, fileId);
      setProject(updated);
      if (selectedMarkdownFileId === fileId) {
        setSelectedMarkdownFileId('');
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorking(false);
    }
  }

  async function handleSetCover(fileId) {
    try {
      setWorking(true);
      const updated = await api.updateCover(projectId, fileId);
      setProject(updated);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorking(false);
    }
  }

  async function handleAddChangelog(event) {
    event.preventDefault();

    if (!changelogMessage.trim()) {
      return;
    }

    try {
      setWorking(true);
      const updated = await api.addChangelog(projectId, changelogMessage.trim());
      setProject(updated);
      setChangelogMessage('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return <p>Loading project...</p>;
  }

  if (error && !project) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>{project.title}</h1>
          <p>{project.description || 'No description yet.'}</p>
        </div>
        <div className="action-row">
          <Link className="secondary" to="/">Back</Link>
          <Link className="button" to={`/projects/${project.id}/edit`}>Edit</Link>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="detail-grid">
        <article className="panel">
          <h2>Project Info</h2>
          <p>Status: <strong>{project.status}</strong></p>
          <p>Progress: <strong>{project.progress}%</strong></p>
          <p>Visibility: <strong>{project.isPublic ? 'Public' : 'Private'}</strong></p>
          <p>Last updated: <strong>{formatDate(project.updatedAt)}</strong></p>
          {project.isPublic && <p className="share-url">Share URL: <a href={shareUrl}>{shareUrl}</a></p>}
          {coverImage && (
            <div>
              <p>Cover image</p>
              <img
                className="cover-image"
                src={`${api.baseUrl}/api/projects/${project.id}/files/${coverImage.id}/download`}
                alt="Project cover"
              />
            </div>
          )}
        </article>

        <article className="panel">
          <h2>Files</h2>
          <input type="file" multiple onChange={handleUpload} disabled={working} accept=".md,.pdf,.docx,.png,.jpg,.jpeg,.gif,.webp" />
          <ul className="file-list">
            {project.files.map((file) => (
              <li key={file.id}>
                <div>
                  <strong>{file.originalName}</strong>
                  <span>{fileTypeLabel(file)} • {Math.round(file.size / 1024)} KB</span>
                </div>
                <div className="action-row">
                  {file.extension === '.md' && (
                    <button type="button" className="secondary" onClick={() => setSelectedMarkdownFileId(file.id)}>
                      Preview
                    </button>
                  )}
                  {['.pdf', '.docx'].includes(file.extension) && (
                    <a className="secondary" href={`${api.baseUrl}/api/projects/${project.id}/files/${file.id}/download`}>
                      Download
                    </a>
                  )}
                  {['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(file.extension) && (
                    <button type="button" className="secondary" onClick={() => handleSetCover(file.id)}>
                      Set Cover
                    </button>
                  )}
                  <button type="button" className="danger" onClick={() => handleDeleteFile(file.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="panel">
        <h2>Markdown Preview</h2>
        {markdownFiles.length > 0 ? (
          <label>
            Select Markdown file
            <select value={selectedMarkdownFileId} onChange={(event) => setSelectedMarkdownFileId(event.target.value)}>
              <option value="">Choose file</option>
              {markdownFiles.map((file) => (
                <option key={file.id} value={file.id}>{file.originalName}</option>
              ))}
            </select>
          </label>
        ) : (
          <p>No markdown files uploaded.</p>
        )}

        {markdownContent && (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {markdownContent}
            </ReactMarkdown>
          </div>
        )}
      </article>

      <article className="panel">
        <h2>Changelog</h2>
        <form className="inline-form" onSubmit={handleAddChangelog}>
          <input
            value={changelogMessage}
            onChange={(event) => setChangelogMessage(event.target.value)}
            placeholder="Describe what changed"
          />
          <button className="button" type="submit" disabled={working}>Add</button>
        </form>
        <ul className="changelog-list">
          {project.changelog.map((entry) => (
            <li key={entry.id}>
              <strong>{formatDate(entry.createdAt)}</strong>
              <p>{entry.message}</p>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

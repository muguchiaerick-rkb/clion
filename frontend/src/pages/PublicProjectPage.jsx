import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { api } from '../api';

export default function PublicProjectPage() {
  const { shareId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMarkdownFileId, setSelectedMarkdownFileId] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');

  const markdownFiles = useMemo(() => {
    return project ? project.files.filter((file) => file.extension === '.md') : [];
  }, [project]);

  useEffect(() => {
    async function loadPublicProject() {
      try {
        setLoading(true);
        const data = await api.getPublicProject(shareId);
        setProject(data);
        const firstMarkdown = data.files.find((file) => file.extension === '.md');
        if (firstMarkdown) {
          setSelectedMarkdownFileId(firstMarkdown.id);
        }
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadPublicProject();
  }, [shareId]);

  useEffect(() => {
    async function loadMarkdown() {
      if (!selectedMarkdownFileId) {
        setMarkdownContent('');
        return;
      }

      try {
        const text = await api.getPublicMarkdown(shareId, selectedMarkdownFileId);
        setMarkdownContent(text);
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadMarkdown();
  }, [shareId, selectedMarkdownFileId]);

  if (loading) {
    return <p>Loading shared project...</p>;
  }

  if (error || !project) {
    return <p className="error-text">{error || 'Project not found.'}</p>;
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>{project.title}</h1>
          <p>{project.description || 'No description available.'}</p>
        </div>
        <Link className="secondary" to="/">Open Nexus</Link>
      </div>

      <div className="panel">
        <p>Status: <strong>{project.status}</strong> • Progress: <strong>{project.progress}%</strong></p>
      </div>

      <article className="panel">
        <h2>Downloads</h2>
        <ul className="file-list">
          {project.files
            .filter((file) => ['.pdf', '.docx'].includes(file.extension))
            .map((file) => (
              <li key={file.id}>
                <strong>{file.originalName}</strong>
                <a className="button" href={`${api.baseUrl}/api/public/${shareId}/files/${file.id}/download`}>Download</a>
              </li>
            ))}
        </ul>
      </article>

      <article className="panel">
        <h2>Markdown</h2>
        {markdownFiles.length > 0 ? (
          <label>
            Select Markdown file
            <select value={selectedMarkdownFileId} onChange={(event) => setSelectedMarkdownFileId(event.target.value)}>
              {markdownFiles.map((file) => (
                <option key={file.id} value={file.id}>{file.originalName}</option>
              ))}
            </select>
          </label>
        ) : (
          <p>No markdown files shared.</p>
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
        <ul className="changelog-list">
          {project.changelog.map((entry) => (
            <li key={entry.id}>
              <strong>{new Date(entry.createdAt).toLocaleString()}</strong>
              <p>{entry.message}</p>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

const defaultForm = {
  title: '',
  description: '',
  progress: 0,
  status: 'Active',
  isPublic: false,
};

export default function ProjectFormPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(projectId);

  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    async function loadProject() {
      try {
        setLoading(true);
        const project = await api.getProject(projectId);
        setForm({
          title: project.title,
          description: project.description,
          progress: project.progress,
          status: project.status,
          isPublic: project.isPublic,
        });
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [isEditMode, projectId]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      progress: Number(form.progress),
    };

    try {
      if (isEditMode) {
        await api.updateProject(projectId, payload);
        navigate(`/projects/${projectId}`);
      } else {
        const project = await api.createProject(payload);
        navigate(`/projects/${project.id}`);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="form-page">
      <div className="section-header">
        <h1>{isEditMode ? 'Edit Project' : 'Create Project'}</h1>
        <Link className="secondary" to={isEditMode ? `/projects/${projectId}` : '/'}>Cancel</Link>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <p>Loading project...</p>}

      {!loading && (
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>

          <label>
            Description
            <textarea name="description" rows="4" value={form.description} onChange={handleChange} />
          </label>

          <label>
            Progress (%)
            <input name="progress" type="number" min="0" max="100" value={form.progress} onChange={handleChange} required />
          </label>

          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
          </label>

          <label className="checkbox-row">
            <input name="isPublic" type="checkbox" checked={form.isPublic} onChange={handleChange} />
            Public project (shareable)
          </label>

          <button type="submit" className="button" disabled={saving}>
            {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Project'}
          </button>
        </form>
      )}
    </section>
  );
}

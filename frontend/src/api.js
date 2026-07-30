const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function parseResponse(response) {
  if (!response.ok) {
    let message = 'Request failed.';
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

function jsonHeaders() {
  return { 'Content-Type': 'application/json' };
}

export const api = {
  baseUrl: API_BASE_URL,

  async listProjects() {
    const response = await fetch(`${API_BASE_URL}/api/projects`);
    return parseResponse(response);
  },

  async getProject(projectId) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`);
    return parseResponse(response);
  },

  async createProject(payload) {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });

    return parseResponse(response);
  },

  async updateProject(projectId, payload) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });

    return parseResponse(response);
  },

  async deleteProject(projectId) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, { method: 'DELETE' });
    return parseResponse(response);
  },

  async uploadFiles(projectId, files) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/files`, {
      method: 'POST',
      body: formData,
    });

    return parseResponse(response);
  },

  async deleteFile(projectId, fileId) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/files/${fileId}`, { method: 'DELETE' });
    return parseResponse(response);
  },

  async getMarkdown(projectId, fileId) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/files/${fileId}/content`);
    return parseResponse(response);
  },

  async addChangelog(projectId, message) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/changelog`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ message }),
    });

    return parseResponse(response);
  },

  async updateCover(projectId, coverImageFileId) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/cover`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify({ coverImageFileId }),
    });

    return parseResponse(response);
  },

  async getPublicProject(shareId) {
    const response = await fetch(`${API_BASE_URL}/api/public/${shareId}`);
    return parseResponse(response);
  },

  async getPublicMarkdown(shareId, fileId) {
    const response = await fetch(`${API_BASE_URL}/api/public/${shareId}/files/${fileId}/content`);
    return parseResponse(response);
  },
};

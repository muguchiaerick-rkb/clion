const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const { randomUUID } = require('crypto');
const {
  ensureStorage,
  listProjects,
  getProjectById,
  getProjectByShareId,
  saveProject,
  removeProject,
  newProject,
  projectFolder,
} = require('./projectStore');

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json({ limit: '10mb' }));

const allowedExtensions = new Set(['.md', '.pdf', '.docx', '.png', '.jpg', '.jpeg', '.gif', '.webp']);

function parseBoolean(value) {
  return value === true || value === 'true';
}

function parseProjectPayload(payload) {
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const description = typeof payload.description === 'string' ? payload.description.trim() : '';
  const status = payload.status === 'Archived' ? 'Archived' : 'Active';
  const progress = Number(payload.progress);
  const isPublic = parseBoolean(payload.isPublic);

  if (!title) {
    return { error: 'Project title is required.' };
  }

  if (Number.isNaN(progress) || progress < 0 || progress > 100) {
    return { error: 'Progress must be a number between 0 and 100.' };
  }

  return {
    value: {
      title,
      description,
      status,
      progress,
      isPublic,
    },
  };
}

function sanitizeName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, callback) => {
      try {
        const destination = projectFolder(req.params.projectId);
        await fs.mkdir(destination, { recursive: true });
        callback(null, destination);
      } catch (error) {
        callback(error);
      }
    },
    filename: (req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      callback(new Error('Unsupported file type.'));
      return;
    }

    callback(null, true);
  },
});

function sortProjects(projects) {
  return [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

async function requireProject(req, res, next) {
  const project = await getProjectById(req.params.projectId);

  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  req.project = project;
  next();
}

function toPublicProject(project) {
  return {
    id: project.id,
    shareId: project.shareId,
    title: project.title,
    description: project.description,
    progress: project.progress,
    status: project.status,
    coverImageFileId: project.coverImageFileId,
    files: project.files,
    changelog: project.changelog,
    updatedAt: project.updatedAt,
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/projects', async (_req, res) => {
  const projects = await listProjects();
  res.json(sortProjects(projects));
});

app.get('/api/projects/:projectId', requireProject, async (req, res) => {
  res.json(req.project);
});

app.post('/api/projects', async (req, res) => {
  const parsed = parseProjectPayload(req.body);

  if (parsed.error) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const project = newProject(parsed.value);
  await saveProject(project);
  res.status(201).json(project);
});

app.put('/api/projects/:projectId', requireProject, async (req, res) => {
  const parsed = parseProjectPayload(req.body);

  if (parsed.error) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const updatedProject = {
    ...req.project,
    ...parsed.value,
    updatedAt: new Date().toISOString(),
  };

  await saveProject(updatedProject);
  res.json(updatedProject);
});

app.delete('/api/projects/:projectId', requireProject, async (req, res) => {
  await removeProject(req.params.projectId);
  res.status(204).send();
});

app.post('/api/projects/:projectId/files', requireProject, upload.array('files', 20), async (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];

  if (files.length === 0) {
    res.status(400).json({ error: 'At least one file is required.' });
    return;
  }

  const uploaded = files.map((file) => ({
    id: randomUUID(),
    originalName: sanitizeName(file.originalname),
    storedName: file.filename,
    mimeType: file.mimetype,
    extension: path.extname(file.originalname).toLowerCase(),
    size: file.size,
    uploadedAt: new Date().toISOString(),
  }));

  const image = uploaded.find((file) => ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(file.extension));

  const updatedProject = {
    ...req.project,
    files: [...req.project.files, ...uploaded],
    coverImageFileId: req.project.coverImageFileId || image?.id || null,
    updatedAt: new Date().toISOString(),
  };

  await saveProject(updatedProject);
  res.status(201).json(updatedProject);
});

app.post('/api/projects/:projectId/changelog', requireProject, async (req, res) => {
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

  if (!message) {
    res.status(400).json({ error: 'Changelog message is required.' });
    return;
  }

  const updatedProject = {
    ...req.project,
    changelog: [{ id: randomUUID(), message, createdAt: new Date().toISOString() }, ...req.project.changelog],
    updatedAt: new Date().toISOString(),
  };

  await saveProject(updatedProject);
  res.status(201).json(updatedProject);
});

app.put('/api/projects/:projectId/cover', requireProject, async (req, res) => {
  const coverImageFileId = typeof req.body.coverImageFileId === 'string' ? req.body.coverImageFileId : null;

  if (coverImageFileId) {
    const file = req.project.files.find((item) => item.id === coverImageFileId);
    if (!file || !['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(file.extension)) {
      res.status(400).json({ error: 'Cover image must be an uploaded image file.' });
      return;
    }
  }

  const updatedProject = {
    ...req.project,
    coverImageFileId,
    updatedAt: new Date().toISOString(),
  };

  await saveProject(updatedProject);
  res.json(updatedProject);
});

app.delete('/api/projects/:projectId/files/:fileId', requireProject, async (req, res) => {
  const file = req.project.files.find((item) => item.id === req.params.fileId);

  if (!file) {
    res.status(404).json({ error: 'File not found.' });
    return;
  }

  const updatedFiles = req.project.files.filter((item) => item.id !== req.params.fileId);

  const updatedProject = {
    ...req.project,
    files: updatedFiles,
    coverImageFileId: req.project.coverImageFileId === req.params.fileId ? null : req.project.coverImageFileId,
    updatedAt: new Date().toISOString(),
  };

  const fullPath = path.join(projectFolder(req.project.id), file.storedName);
  await fs.rm(fullPath, { force: true });
  await saveProject(updatedProject);

  res.json(updatedProject);
});

async function findProjectFile(project, fileId) {
  const file = project.files.find((item) => item.id === fileId);
  if (!file) {
    return null;
  }

  const fullPath = path.join(projectFolder(project.id), file.storedName);
  return { file, fullPath };
}

app.get('/api/projects/:projectId/files/:fileId/download', requireProject, async (req, res) => {
  const found = await findProjectFile(req.project, req.params.fileId);

  if (!found) {
    res.status(404).json({ error: 'File not found.' });
    return;
  }

  res.download(found.fullPath, found.file.originalName);
});

app.get('/api/projects/:projectId/files/:fileId/content', requireProject, async (req, res) => {
  const found = await findProjectFile(req.project, req.params.fileId);

  if (!found) {
    res.status(404).json({ error: 'File not found.' });
    return;
  }

  if (found.file.extension !== '.md') {
    res.status(400).json({ error: 'Only markdown files can be rendered.' });
    return;
  }

  const text = await fs.readFile(found.fullPath, 'utf8');
  res.type('text/markdown').send(text);
});

app.get('/api/public/:shareId', async (req, res) => {
  const project = await getProjectByShareId(req.params.shareId);

  if (!project || !project.isPublic) {
    res.status(404).json({ error: 'Public project not found.' });
    return;
  }

  res.json(toPublicProject(project));
});

app.get('/api/public/:shareId/files/:fileId/download', async (req, res) => {
  const project = await getProjectByShareId(req.params.shareId);

  if (!project || !project.isPublic) {
    res.status(404).json({ error: 'Public project not found.' });
    return;
  }

  const found = await findProjectFile(project, req.params.fileId);

  if (!found) {
    res.status(404).json({ error: 'File not found.' });
    return;
  }

  res.download(found.fullPath, found.file.originalName);
});

app.get('/api/public/:shareId/files/:fileId/content', async (req, res) => {
  const project = await getProjectByShareId(req.params.shareId);

  if (!project || !project.isPublic) {
    res.status(404).json({ error: 'Public project not found.' });
    return;
  }

  const found = await findProjectFile(project, req.params.fileId);

  if (!found) {
    res.status(404).json({ error: 'File not found.' });
    return;
  }

  if (found.file.extension !== '.md') {
    res.status(400).json({ error: 'Only markdown files can be rendered.' });
    return;
  }

  const text = await fs.readFile(found.fullPath, 'utf8');
  res.type('text/markdown').send(text);
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (error.message === 'Unsupported file type.') {
    res.status(400).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
});

ensureStorage()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to initialize storage:', error);
    process.exit(1);
  });

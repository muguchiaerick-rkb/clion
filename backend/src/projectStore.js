const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const STORAGE_ROOT = path.resolve(__dirname, '../../storage');
const DATA_DIR = path.join(STORAGE_ROOT, 'data');
const PROJECTS_DIR = path.join(STORAGE_ROOT, 'projects');
const DATA_FILE = path.join(DATA_DIR, 'projects.json');

async function ensureStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(PROJECTS_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ projects: [] }, null, 2));
  }
}

async function readStore() {
  await ensureStorage();
  const content = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(content);
}

async function writeStore(data) {
  await ensureStorage();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

function normalizeProject(project) {
  return {
    ...project,
    files: Array.isArray(project.files) ? project.files : [],
    changelog: Array.isArray(project.changelog) ? project.changelog : [],
  };
}

async function listProjects() {
  const store = await readStore();
  return store.projects.map(normalizeProject);
}

async function getProjectById(projectId) {
  const projects = await listProjects();
  return projects.find((project) => project.id === projectId) || null;
}

async function getProjectByShareId(shareId) {
  const projects = await listProjects();
  return projects.find((project) => project.shareId === shareId) || null;
}

async function saveProject(project) {
  const store = await readStore();
  const index = store.projects.findIndex((item) => item.id === project.id);

  if (index === -1) {
    store.projects.push(project);
  } else {
    store.projects[index] = project;
  }

  await writeStore(store);
}

async function removeProject(projectId) {
  const store = await readStore();
  store.projects = store.projects.filter((project) => project.id !== projectId);
  await writeStore(store);

  const folder = path.join(PROJECTS_DIR, projectId);
  await fs.rm(folder, { recursive: true, force: true });
}

function newProject(payload) {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    shareId: randomUUID(),
    title: payload.title,
    description: payload.description || '',
    progress: payload.progress,
    status: payload.status,
    isPublic: payload.isPublic,
    coverImageFileId: null,
    files: [],
    changelog: [],
    createdAt: now,
    updatedAt: now,
  };
}

function projectFolder(projectId) {
  return path.join(PROJECTS_DIR, projectId);
}

module.exports = {
  STORAGE_ROOT,
  PROJECTS_DIR,
  ensureStorage,
  listProjects,
  getProjectById,
  getProjectByShareId,
  saveProject,
  removeProject,
  newProject,
  projectFolder,
};

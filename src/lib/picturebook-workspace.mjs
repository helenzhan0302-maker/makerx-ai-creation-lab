import {
  STORY_TEXT_FIELDS,
  applyStoryValues,
  buildStoryValues,
  createStoryState,
  isStoryReady,
  saveStoryText as applyStoryText,
  storyCompletion,
  normalizeStartKind,
} from './picturebook-story.mjs';
import { createStoryboard } from './picturebook-prompts.mjs';
import { createProjectFile, resolveExportVersion } from './picturebook-project-file.mjs';

export const WORKSPACE_EVENT = 'picturebook:workspace-change';

export function createWorkspace() {
  return {
    start: 'character',
    seed: '',
    story: createStoryState(),
    storyboard: createStoryboard(),
    visual: {
      ratio: '',
      artStyle: '',
      palette: '',
      traits: { color: '', shape: '', clothes: '', mark: '' },
    },
    images: Array.from({ length: 6 }, (_, index) => ({
      page: index + 1,
      status: 'not-started',
      checks: { action: false, expression: false, environment: false, color: false },
    })),
    checks: {
      storyUnderstandable: false,
      pageOrderClear: false,
      imagesMatchPlot: false,
      characterConsistent: false,
    },
    roadshow: { story: '', favoritePage: null, reason: '', improvement: '' },
    importedVersion: null,
    imported: false,
    lastExportedVersion: null,
    history: [],
  };
}

export const workspace = createWorkspace();

export function notifyWorkspace() {
  if (typeof document === 'undefined' || typeof CustomEvent !== 'function') return;
  document.dispatchEvent(new CustomEvent(WORKSPACE_EVENT, { detail: workspace }));
}

export function setStart(start) {
  workspace.start = normalizeStartKind(start);
  notifyWorkspace();
}

export function setSeed(seed) {
  workspace.seed = typeof seed === 'string' ? seed : '';
  notifyWorkspace();
}

function rememberStory(next) {
  if (next === workspace.story) return;
  workspace.history.push(workspace.story);
  if (workspace.history.length > 20) workspace.history.shift();
  workspace.story = next;
  notifyWorkspace();
}

export function saveStoryField(elementId, value) {
  saveStoryText(elementId, value);
}

export function saveStoryText(fieldId, value) {
  rememberStory(applyStoryText(workspace.story, fieldId, value));
}

export function storyValues() {
  return buildStoryValues(workspace.story);
}

export function storyIsComplete() {
  return isStoryReady(workspace.story);
}

export function storyProgress() {
  return storyCompletion(workspace.story);
}

export function storyTextFields() {
  return STORY_TEXT_FIELDS;
}

export function storyboardIsComplete() {
  return workspace.storyboard.every((page) =>
    [page.scene, page.action, page.emotion].every((value) => typeof value === 'string' && value.trim()),
  );
}

export function setStoryboardPage(pageNumber, field, value) {
  const page = workspace.storyboard.find((item) => item.page === Number(pageNumber));
  if (!page || !['scene', 'action', 'emotion'].includes(field)) return;
  page[field] = typeof value === 'string' ? value : '';
  notifyWorkspace();
}

export function setVisual(key, value) {
  if (!['ratio', 'artStyle', 'palette'].includes(key)) return;
  workspace.visual[key] = typeof value === 'string' ? value : '';
  notifyWorkspace();
}

export function setTrait(key, value) {
  if (!['color', 'shape', 'clothes', 'mark'].includes(key)) return;
  workspace.visual.traits[key] = typeof value === 'string' ? value : '';
  notifyWorkspace();
}

export function setImageStatus(pageNumber, status) {
  const image = workspace.images.find((item) => item.page === Number(pageNumber));
  if (!image || !['not-started', 'selected', 'redo'].includes(status)) return;
  image.status = status;
  notifyWorkspace();
}

export function setImageCheck(pageNumber, key, checked) {
  const image = workspace.images.find((item) => item.page === Number(pageNumber));
  if (!image || !['action', 'expression', 'environment', 'color'].includes(key)) return;
  image.checks[key] = Boolean(checked);
  notifyWorkspace();
}

export function setFinalCheck(key, checked) {
  if (!['storyUnderstandable', 'pageOrderClear', 'imagesMatchPlot', 'characterConsistent'].includes(key)) return;
  workspace.checks[key] = Boolean(checked);
  notifyWorkspace();
}

export function setRoadshow(key, value) {
  if (key === 'favoritePage') {
    const page = Number(value);
    workspace.roadshow.favoritePage = Number.isInteger(page) && page >= 1 && page <= 6 ? page : null;
  } else if (key === 'story' || key === 'reason' || key === 'improvement') {
    workspace.roadshow[key] = typeof value === 'string' ? value : '';
  }
  notifyWorkspace();
}

export function applyImportedProject(data) {
  workspace.start = normalizeStartKind(data.story?.start);
  workspace.seed = data.story?.seed || '';
  workspace.story = applyStoryValues(data.story);
  workspace.storyboard = data.storyboard.map((page) => ({ ...page }));
  workspace.visual = {
    ratio: data.visual?.ratio || '',
    artStyle: data.visual?.artStyle || '',
    palette: data.visual?.palette || '',
    traits: {
      color: data.visual?.traits?.color || '',
      shape: data.visual?.traits?.shape || '',
      clothes: data.visual?.traits?.clothes || '',
      mark: data.visual?.traits?.mark || '',
    },
  };
  workspace.images = data.images.map((image) => ({
    page: image.page,
    status: image.status,
    checks: { ...image.checks },
  }));
  workspace.checks = { ...data.checks };
  workspace.roadshow = { ...data.roadshow };
  workspace.importedVersion = data.version;
  workspace.imported = true;
  workspace.history = [];
  notifyWorkspace();
  return workspace;
}

export function createWorkspaceFile(version) {
  return createProjectFile({
    story: { start: workspace.start, seed: workspace.seed, ...storyValues() },
    storyboard: workspace.storyboard,
    images: workspace.images,
    visual: workspace.visual,
    checks: workspace.checks,
    roadshow: workspace.roadshow,
    version,
  });
}
export function nextExportVersion(baseVersion) {
  return resolveExportVersion({
    imported: workspace.imported,
    importedVersion: workspace.importedVersion,
    lastExportedVersion: workspace.lastExportedVersion,
    baseVersion,
  });
}

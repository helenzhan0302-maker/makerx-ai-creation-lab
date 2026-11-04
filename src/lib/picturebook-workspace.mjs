import {
  STORY_ELEMENTS,
  answerElement,
  applyStoryValues,
  buildStoryValues,
  createStoryState,
  isStoryReady,
  nextQuestion,
  storyCompletion,
} from './picturebook-story.mjs';
import { createStoryboard } from './picturebook-prompts.mjs';
import { createProjectFile, resolveExportVersion } from './picturebook-project-file.mjs';

export const WORKSPACE_EVENT = 'picturebook:workspace-change';

export function createWorkspace() {
  return {
    start: '',
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
  workspace.start = typeof start === 'string' ? start : '';
  notifyWorkspace();
}

export function saveAnswer(elementId, answer) {
  const before = workspace.story;
  const next = answerElement(workspace.story, elementId, answer);
  if (next !== before) {
    workspace.history.push(before);
    if (workspace.history.length > 20) workspace.history.shift();
  }
  workspace.story = next;
  notifyWorkspace();
  return nextQuestion(workspace.story);
}

export function undoAnswer() {
  const previous = workspace.history.pop();
  if (!previous) return false;
  workspace.story = previous;
  notifyWorkspace();
  return true;
}

export function storyValues() {
  return buildStoryValues(workspace.story);
}

export function storyIsComplete() {
  return isStoryReady(workspace.story);
}

export function storyHasNoEmptySlots() {
  return STORY_ELEMENTS.every((element) => workspace.story.answers[element.id].status !== 'empty');
}

export function storyProgress() {
  return storyCompletion(workspace.story);
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
  workspace.start = data.story?.start || '';
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
    story: { start: workspace.start, ...storyValues() },
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

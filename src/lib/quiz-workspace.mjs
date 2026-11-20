import {
  TEST_CHECKLIST,
  createQuestionBank,
  normalizeTopic,
  readyForGame,
  verificationProgress,
} from './quiz-challenge.mjs';
import { createQuizProjectFile } from './quiz-project-file.mjs';

export const QUIZ_WORKSPACE_EVENT = 'quiz:workspace-change';

export function createChecks() {
  return TEST_CHECKLIST.map((item) => ({ id: item.id, checked: false }));
}

export function createWorkspace() {
  return {
    topic: { id: '', custom: '' },
    questions: createQuestionBank(),
    design: { title: '', topic: '', intro: '' },
    checks: createChecks(),
    rounds: { firstIds: '', firstScore: '', secondIds: '', secondScore: '', bugs: '' },
    roadshow: { name: '', favorite: '', bug: '' },
    imported: false,
    importedVersion: null,
    lastExportedVersion: null,
  };
}

export const workspace = createWorkspace();

export function notifyWorkspace() {
  if (typeof document === 'undefined' || typeof CustomEvent !== 'function') return;
  document.dispatchEvent(new CustomEvent(QUIZ_WORKSPACE_EVENT, { detail: workspace }));
}

export function setTopic(id) {
  workspace.topic = { ...workspace.topic, id: typeof id === 'string' ? id : '' };
  notifyWorkspace();
}

export function setTopicCustom(value) {
  workspace.topic = { ...workspace.topic, custom: typeof value === 'string' ? value : '' };
  notifyWorkspace();
}

export function currentTopic() {
  return normalizeTopic(workspace.topic);
}

export function setQuestionField(id, field, value) {
  const question = workspace.questions.find((item) => item.id === Number(id));
  if (!question) return;
  const allowed = ['question', 'answer', 'explanation', 'keywords', 'source', 'evidence', 'verdict', 'revision'];
  if (!allowed.includes(field)) return;
  question[field] = typeof value === 'string' ? value : '';
  notifyWorkspace();
}

export function setQuestionOption(id, index, value) {
  const question = workspace.questions.find((item) => item.id === Number(id));
  if (!question || !Number.isInteger(index) || index < 0 || index > 3) return;
  question.options[index] = typeof value === 'string' ? value : '';
  notifyWorkspace();
}

export function applyImportedProject(data) {
  workspace.topic = { id: data.topic?.id || '', custom: data.topic?.custom || '' };
  workspace.questions = data.questions.map((question) => ({
    ...question,
    options: [...question.options],
  }));
  workspace.design = { ...data.design };
  workspace.checks = data.checks.map((item) => ({ ...item }));
  workspace.rounds = { ...data.rounds };
  workspace.roadshow = { ...data.roadshow };
  workspace.imported = true;
  workspace.importedVersion = data.version;
  notifyWorkspace();
  return workspace;
}

export function setDesign(field, value) {
  if (!['title', 'topic', 'intro'].includes(field)) return;
  workspace.design[field] = typeof value === 'string' ? value : '';
  notifyWorkspace();
}

export function setCheck(id, checked) {
  const item = workspace.checks.find((check) => check.id === id);
  if (!item) return;
  item.checked = Boolean(checked);
  notifyWorkspace();
}

export function setRound(field, value) {
  if (!['firstIds', 'firstScore', 'secondIds', 'secondScore', 'bugs'].includes(field)) return;
  workspace.rounds[field] = typeof value === 'string' ? value : '';
  notifyWorkspace();
}

export function setRoadshow(field, value) {
  if (!['name', 'favorite', 'bug'].includes(field)) return;
  workspace.roadshow[field] = typeof value === 'string' ? value : '';
  notifyWorkspace();
}

export function progress() {
  return verificationProgress(workspace.questions);
}

export function canBuildGame() {
  return readyForGame(workspace.questions);
}

export function createWorkspaceFile(version = 1) {
  return createQuizProjectFile({
    topic: workspace.topic,
    questions: workspace.questions,
    design: workspace.design,
    checks: workspace.checks,
    rounds: workspace.rounds,
    roadshow: workspace.roadshow,
    version,
  });
}

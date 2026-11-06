import { PAGE_COUNT } from './picturebook-prompts.mjs';

export const SCHEMA_VERSION = 1;
export const PROJECT_CODE = '002-picturebook';

export const IMAGE_STATUSES = ['not-started', 'selected', 'redo'];

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanStory(story = {}) {
  return {
    start: clean(story.start),
    seed: clean(story.seed),
    hero: clean(story.hero),
    goal: clean(story.goal),
    obstacle: clean(story.obstacle),
    action: clean(story.action),
    result: clean(story.result),
  };
}

function cleanTraits(traits = {}) {
  return {
    color: clean(traits.color),
    shape: clean(traits.shape),
    clothes: clean(traits.clothes),
    mark: clean(traits.mark),
  };
}

function cleanImages(images, storyboard) {
  const source = Array.isArray(images) ? images : [];
  return (Array.isArray(storyboard) ? storyboard : []).slice(0, PAGE_COUNT).map((page) => {
    const match = source.find((image) => Number(image?.page) === Number(page.page));
    const status = IMAGE_STATUSES.includes(match?.status) ? match.status : 'not-started';
    return {
      page: Number(page.page),
      status,
      checks: {
        action: Boolean(match?.checks?.action),
        expression: Boolean(match?.checks?.expression),
        environment: Boolean(match?.checks?.environment),
        color: Boolean(match?.checks?.color),
      },
    };
  });
}

function cleanRoadshow(roadshow = {}) {
  const favoritePage = Number(roadshow?.favoritePage);
  return {
    story: clean(roadshow?.story),
    favoritePage:
      Number.isInteger(favoritePage) && favoritePage >= 1 && favoritePage <= PAGE_COUNT ? favoritePage : null,
    reason: clean(roadshow?.reason),
    improvement: clean(roadshow?.improvement),
  };
}

export function createProjectFile({ story, storyboard, images, visual, checks, roadshow, version = 1 }) {
  const cleanStoryboard = (Array.isArray(storyboard) ? storyboard : [])
    .slice(0, PAGE_COUNT)
    .map((page) => ({
      page: Number(page.page),
      scene: clean(page.scene),
      action: clean(page.action),
      emotion: clean(page.emotion),
    }));

  return {
    schemaVersion: SCHEMA_VERSION,
    projectCode: PROJECT_CODE,
    exportedAt: new Date().toISOString(),
    version,
    story: cleanStory(story),
    storyboard: cleanStoryboard,
    visual: {
      ratio: clean(visual?.ratio),
      artStyle: clean(visual?.artStyle),
      palette: clean(visual?.palette),
      traits: cleanTraits(visual?.traits),
    },
    images: cleanImages(images, cleanStoryboard),
    checks: {
      storyUnderstandable: Boolean(checks?.storyUnderstandable),
      pageOrderClear: Boolean(checks?.pageOrderClear),
      imagesMatchPlot: Boolean(checks?.imagesMatchPlot),
      characterConsistent: Boolean(checks?.characterConsistent),
    },
    roadshow: cleanRoadshow(roadshow),
  };
}

export function nextVersion(previous) {
  return Number.isInteger(previous) && previous > 0 ? previous + 1 : 1;
}

export function resolveExportVersion({
  imported = false,
  importedVersion = null,
  lastExportedVersion = null,
  baseVersion = 1,
} = {}) {
  if (!imported) {
    return Math.max(1, nextVersion(lastExportedVersion || baseVersion - 1));
  }
  return nextVersion(Math.max(importedVersion || 1, lastExportedVersion || 1));
}

export function buildFileName(version) {
  return `story-project-v${version}.json`;
}

export function stringifyProjectFile(file) {
  return `${JSON.stringify(file, null, 2)}\n`;
}

export function parseProjectFile(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, message: '这不是工程文件：文件内容不是可读取的 JSON。' };
  }

  if (!data || typeof data !== 'object' || data.projectCode !== PROJECT_CODE) {
    return { ok: false, message: '这不是工程文件：找不到「故事放映机」的项目标记。' };
  }

  if (!Number.isInteger(data.schemaVersion) || data.schemaVersion < 1 || data.schemaVersion > SCHEMA_VERSION) {
    return { ok: false, message: '工程文件版本过新：请用更新后的页面打开，或从空白开始。' };
  }

  if (!Array.isArray(data.storyboard) || data.storyboard.length !== PAGE_COUNT) {
    return { ok: false, message: `分镜缺页：工程文件应当包含 ${PAGE_COUNT} 页分镜。` };
  }

  const pages = data.storyboard.map((page) => Number(page?.page));
  const unique = new Set(pages);
  if (unique.size !== PAGE_COUNT || pages.some((page) => !Number.isInteger(page) || page < 1 || page > PAGE_COUNT)) {
    return { ok: false, message: '分镜页序重复：每一页应当只出现一次，且页码在 1–6 之间。' };
  }

  return {
    ok: true,
    data: createProjectFile({
      story: data.story,
      storyboard: data.storyboard,
      images: data.images,
      visual: data.visual,
      checks: data.checks,
      roadshow: data.roadshow,
      version: Number.isInteger(data.version) && data.version > 0 ? data.version : 1,
    }),
  };
}

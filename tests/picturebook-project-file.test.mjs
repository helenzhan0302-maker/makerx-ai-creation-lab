import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_VERSION,
  PROJECT_CODE,
  IMAGE_STATUSES,
  createProjectFile,
  nextVersion,
  resolveExportVersion,
  buildFileName,
  stringifyProjectFile,
  parseProjectFile,
} from '../src/lib/picturebook-project-file.mjs';

const story = {
  start: 'wish',
  hero: '小猫',
  goal: '找回星星',
  obstacle: '天黑',
  action: '提灯出门',
  result: '星星回到了天上',
};

const storyboard = Array.from({ length: 6 }, (_, index) => ({
  page: index + 1,
  scene: `画面${index + 1}`,
  action: `动作${index + 1}`,
  emotion: `情绪${index + 1}`,
}));

const visual = {
  ratio: '竖版 3:4',
  artStyle: '治愈水彩',
  palette: '冷色',
  traits: { color: '蓝色', shape: '圆耳', clothes: '雨衣', mark: '铃铛' },
};

const checks = {
  storyUnderstandable: true,
  pageOrderClear: false,
  imagesMatchPlot: false,
  characterConsistent: false,
};

test('new project file contains schema, code, version and six pages', () => {
  const file = createProjectFile({ story, storyboard, visual, checks, version: 1 });
  assert.equal(file.schemaVersion, SCHEMA_VERSION);
  assert.equal(file.projectCode, PROJECT_CODE);
  assert.equal(file.version, 1);
  assert.equal(file.storyboard.length, 6);
});

test('file name carries the version', () => {
  assert.equal(buildFileName(1), 'story-project-v1.json');
  assert.equal(buildFileName(2), 'story-project-v2.json');
});

test('next export increments the version without overwriting', () => {
  assert.equal(nextVersion(null), 1);
  assert.equal(nextVersion(undefined), 1);
  assert.equal(nextVersion(1), 2);
  assert.equal(nextVersion(7), 8);
});

test('export version increments after every save on the same page', () => {
  assert.equal(resolveExportVersion({ baseVersion: 1 }), 1);
  assert.equal(resolveExportVersion({ baseVersion: 1, lastExportedVersion: 1 }), 2);
  assert.equal(resolveExportVersion({ baseVersion: 1, lastExportedVersion: 2 }), 3);
});

test('lesson 2 export starts after the imported version and never reuses it', () => {
  assert.equal(resolveExportVersion({ baseVersion: 2, imported: true, importedVersion: 1 }), 2);
  assert.equal(
    resolveExportVersion({ baseVersion: 2, imported: true, importedVersion: 1, lastExportedVersion: 2 }),
    3,
  );
  assert.equal(
    resolveExportVersion({ baseVersion: 2, imported: true, importedVersion: 4, lastExportedVersion: 2 }),
    5,
  );
});

test('round trip keeps story, storyboard, visual and checks', () => {
  const file = createProjectFile({ story, storyboard, visual, checks, version: 2 });
  const parsed = parseProjectFile(stringifyProjectFile(file));
  assert.equal(parsed.ok, true);
  assert.equal(parsed.data.version, 2);
  assert.equal(parsed.data.storyboard[5].page, 6);
  assert.equal(parsed.data.visual.traits.mark, '铃铛');
  assert.equal(parsed.data.checks.storyUnderstandable, true);
});

test('round trip keeps per-page image status, checks and roadshow card', () => {
  const images = storyboard.map((page) => ({
    page: page.page,
    status: page.page === 2 ? 'selected' : page.page === 3 ? 'redo' : 'not-started',
    checks: {
      action: page.page === 2,
      expression: page.page === 2,
      environment: false,
      color: page.page === 2,
    },
  }));
  const roadshow = {
    story: '小猫提灯找回星星',
    favoritePage: 2,
    reason: '颜色很舒服',
    improvement: '想让雨小一点',
  };
  const file = createProjectFile({ story, storyboard, images, visual, checks, roadshow, version: 2 });
  const parsed = parseProjectFile(stringifyProjectFile(file));

  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.data.images.map((image) => image.page), [1, 2, 3, 4, 5, 6]);
  assert.equal(parsed.data.images[1].status, 'selected');
  assert.equal(parsed.data.images[2].status, 'redo');
  assert.equal(parsed.data.images[1].checks.action, true);
  assert.equal(parsed.data.images[1].checks.environment, false);
  assert.deepEqual(parsed.data.roadshow, roadshow);
});

test('unknown image status falls back to not-started without dropping pages', () => {
  const file = createProjectFile({ story, storyboard, images: [{ page: 1, status: 'done' }], visual, checks, version: 1 });
  assert.equal(file.images.length, 6);
  assert.equal(file.images[0].status, 'not-started');
  assert.deepEqual(IMAGE_STATUSES, ['not-started', 'selected', 'redo']);
});

test('missing images and roadshow in an old file still produce six safe page records', () => {
  const file = createProjectFile({ story, storyboard, visual, checks, version: 1 });
  const legacy = { ...file };
  delete legacy.images;
  delete legacy.roadshow;
  const parsed = parseProjectFile(JSON.stringify(legacy));
  assert.equal(parsed.ok, true);
  assert.equal(parsed.data.images.length, 6);
  assert.ok(parsed.data.images.every((image) => image.status === 'not-started'));
  assert.equal(parsed.data.roadshow.favoritePage, null);
});

test('invalid JSON is rejected with a readable reason', () => {
  const parsed = parseProjectFile('{not json');
  assert.equal(parsed.ok, false);
  assert.match(parsed.message, /不是工程文件/);
});

test('wrong project code is rejected', () => {
  const file = createProjectFile({ story, storyboard, visual, checks, version: 1 });
  file.projectCode = '001-ai-planet';
  const parsed = parseProjectFile(JSON.stringify(file));
  assert.equal(parsed.ok, false);
  assert.match(parsed.message, /不是工程文件/);
});

test('missing pages are rejected instead of filled', () => {
  const file = createProjectFile({ story, storyboard: storyboard.slice(0, 5), visual, checks, version: 1 });
  const parsed = parseProjectFile(JSON.stringify(file));
  assert.equal(parsed.ok, false);
  assert.match(parsed.message, /分镜缺页/);
});

test('duplicate pages are rejected', () => {
  const broken = storyboard.map((page, index) => ({ ...page, page: index === 5 ? 5 : page.page }));
  const file = createProjectFile({ story, storyboard: broken, visual, checks, version: 1 });
  const parsed = parseProjectFile(JSON.stringify(file));
  assert.equal(parsed.ok, false);
  assert.match(parsed.message, /分镜页序重复/);
});

test('future schema version is rejected', () => {
  const file = createProjectFile({ story, storyboard, visual, checks, version: 1 });
  file.schemaVersion = SCHEMA_VERSION + 1;
  const parsed = parseProjectFile(JSON.stringify(file));
  assert.equal(parsed.ok, false);
  assert.match(parsed.message, /版本过新/);
});

test('serialized file never contains identity fields', () => {
  const text = stringifyProjectFile(createProjectFile({ story, storyboard, visual, checks, version: 1 }));
  assert.doesNotMatch(text, /"name"\s*:|"school"\s*:|"address"\s*:|"phone"\s*:|"email"\s*:/i);
  assert.doesNotMatch(text, /真实姓名|学校|住址|手机号/);
});

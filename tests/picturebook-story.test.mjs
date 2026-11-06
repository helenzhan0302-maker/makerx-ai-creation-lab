import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORY_TEXT_FIELDS,
  STORY_REQUIRED_TEXT_FIELDS,
  applyStoryValues,
  buildStorySummary,
  buildStoryValues,
  createStoryState,
  isStoryReady,
  saveStoryText,
  storyCompletion,
} from '../src/lib/picturebook-story.mjs';

test('story archive has one creative card, one full story and two optional notes', () => {
  assert.deepEqual(
    STORY_TEXT_FIELDS.map((field) => field.id),
    ['card', 'storyTitle', 'storyBody', 'decisions'],
  );
  assert.deepEqual(
    STORY_REQUIRED_TEXT_FIELDS.map((field) => field.id),
    ['card', 'storyBody'],
  );
});

test('a new story archive starts empty', () => {
  const state = createStoryState();
  assert.equal(state.startKind, 'character');
  assert.equal(state.seed, '');
  assert.equal(storyCompletion(state), 0);
  assert.equal(isStoryReady(state), false);
  assert.ok(STORY_TEXT_FIELDS.every((field) => state.text[field.id] === ''));
});

test('creative card and full story are both required before saving', () => {
  let state = createStoryState();
  state = saveStoryText(state, 'card', '【我的故事创意卡】\n故事主角：一只怕黑的小猫');
  assert.equal(storyCompletion(state), 1);
  assert.equal(isStoryReady(state), false);
  state = saveStoryText(state, 'storyBody', '小猫提着灯笼走进树林，最后把星星送回天上。');
  assert.equal(storyCompletion(state), 2);
  assert.equal(isStoryReady(state), true);
});

test('optional title and decisions do not block saving', () => {
  let state = createStoryState();
  state = saveStoryText(state, 'card', '故事创意卡');
  state = saveStoryText(state, 'storyBody', '完整故事');
  state = saveStoryText(state, 'storyTitle', '小猫的灯笼');
  state = saveStoryText(state, 'decisions', '我决定让小猫怕黑');
  assert.equal(isStoryReady(state), true);
  assert.equal(storyCompletion(state), 2);
});

test('story title and creative card stay independent fields', () => {
  let state = createStoryState();
  state = saveStoryText(state, 'card', '暂定故事名称：小猫的灯笼');
  state = saveStoryText(state, 'storyTitle', '星星回家');
  assert.equal(state.text.card, '暂定故事名称：小猫的灯笼');
  assert.equal(state.text.storyTitle, '星星回家');
});

test('blank required field stays empty and does not count', () => {
  let state = createStoryState();
  state = saveStoryText(state, 'card', '   ');
  state = saveStoryText(state, 'storyBody', '完整故事');
  assert.equal(storyCompletion(state), 1);
  assert.equal(isStoryReady(state), false);
});

test('unknown field id is ignored', () => {
  const state = createStoryState();
  assert.equal(saveStoryText(state, 'hero', '不应写入'), state);
});

test('summary marks missing required content as pending', () => {
  const summary = buildStorySummary(createStoryState());
  assert.match(summary, /我的故事创意卡：待补充/);
  assert.match(summary, /完整故事：待补充/);
});

test('story values round trip through import without losing originals', () => {
  let state = createStoryState();
  state = saveStoryText(state, 'card', '故事创意卡原文');
  state = saveStoryText(state, 'storyBody', '完整故事原文');
  state = saveStoryText(state, 'decisions', '我决定让小猫自己关灯');
  const restored = applyStoryValues({ start: 'theme', ...buildStoryValues(state) });
  assert.equal(restored.startKind, 'theme');
  assert.equal(restored.text.card, '故事创意卡原文');
  assert.equal(restored.text.storyBody, '完整故事原文');
  assert.equal(restored.text.decisions, '我决定让小猫自己关灯');
});

test('legacy five-line story is converted into a creative card', () => {
  const restored = applyStoryValues({
    start: 'wish',
    hero: '一只怕黑的小猫',
    goal: '找回丢失的星星',
    obstacle: '夜里太黑',
    action: '提着灯笼出门',
    result: '星星回到天上',
  });
  assert.equal(restored.startKind, 'theme');
  assert.match(restored.text.card, /故事主角：一只怕黑的小猫/);
  assert.match(restored.text.card, /故事结果：星星回到天上/);
  assert.equal(restored.text.storyBody, '');
});

test('legacy wish and strange starts map to the new theme and event kinds', () => {
  assert.equal(applyStoryValues({ start: 'wish' }).startKind, 'theme');
  assert.equal(applyStoryValues({ start: 'strange' }).startKind, 'event');
  assert.equal(applyStoryValues({ start: 'unknown' }).startKind, 'character');
});

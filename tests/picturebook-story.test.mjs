import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORY_ELEMENTS,
  createStoryState,
  saveStoryField,
  isStoryReady,
  storyCompletion,
  buildStorySummary,
  buildStoryValues,
  applyStoryValues,
} from '../src/lib/picturebook-story.mjs';

test('story has exactly five elements in course order', () => {
  assert.deepEqual(
    STORY_ELEMENTS.map((item) => item.id),
    ['hero', 'goal', 'obstacle', 'action', 'result'],
  );
});

test('a new story card starts empty instead of pretending the site interviews the child', () => {
  const state = createStoryState();
  assert.equal(state.startKind, '');
  assert.equal(state.seed, '');
  assert.equal(storyCompletion(state), 0);
  assert.equal(isStoryReady(state), false);
  assert.ok(STORY_ELEMENTS.every((element) => state.answers[element.id].status === 'empty'));
});

test('confirmed story line keeps the child original words', () => {
  let state = createStoryState();
  state = saveStoryField(state, 'hero', '  一只总把袜子藏起来的小猫  ');
  assert.equal(state.answers.hero.original, '一只总把袜子藏起来的小猫');
  assert.equal(state.answers.hero.status, 'confirmed');
  assert.equal(storyCompletion(state), 1);
});

test('blank line stays empty and does not count as confirmed', () => {
  let state = createStoryState();
  state = saveStoryField(state, 'hero', '   ');
  assert.equal(state.answers.hero.status, 'empty');
  assert.equal(isStoryReady(state), false);
});

test('story is ready only when all five confirmed lines are filled', () => {
  let state = createStoryState();
  for (const element of STORY_ELEMENTS) {
    state = saveStoryField(state, element.id, `${element.label}的具体回答`);
  }
  assert.equal(isStoryReady(state), true);
  assert.equal(storyCompletion(state), 5);
  const summary = buildStorySummary(state);
  assert.match(summary, /主角：主角的具体回答/);
  assert.match(summary, /结果：结果的具体回答/);
});

test('summary marks missing lines as pending instead of filling them', () => {
  const state = createStoryState();
  const summary = buildStorySummary(state);
  assert.match(summary, /主角：待补充/);
  assert.doesNotMatch(summary, /一只勇敢/);
});

test('story values round trip through import without losing originals', () => {
  let state = createStoryState();
  state = saveStoryField(state, 'hero', '一只怕黑的小猫');
  state = saveStoryField(state, 'goal', '找回丢失的星星');
  const values = buildStoryValues(state);
  const restored = applyStoryValues(values);
  assert.equal(restored.answers.hero.original, '一只怕黑的小猫');
  assert.equal(restored.answers.hero.status, 'confirmed');
  assert.equal(restored.answers.obstacle.status, 'empty');
});

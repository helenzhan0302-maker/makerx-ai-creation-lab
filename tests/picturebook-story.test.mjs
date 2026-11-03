import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORY_ELEMENTS,
  createStoryState,
  answerElement,
  nextQuestion,
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

test('a new story starts at the hero question', () => {
  const state = createStoryState();
  const question = nextQuestion(state);
  assert.equal(question.elementId, 'hero');
  assert.equal(question.attempt, 1);
  assert.ok(question.text.includes('谁'));
});

test('each question contains exactly one question mark', () => {
  let state = createStoryState();
  for (const element of STORY_ELEMENTS) {
    const question = nextQuestion(state);
    assert.equal((question.text.match(/？/g) || []).length, 1);
    state = answerElement(state, element.id, '一个可画出来的具体回答');
  }
});

test('answered element is kept as the child original words', () => {
  let state = createStoryState();
  state = answerElement(state, 'hero', '  一只总把袜子藏起来的小猫  ');
  assert.equal(state.answers.hero.original, '一只总把袜子藏起来的小猫');
  assert.equal(state.answers.hero.status, 'confirmed');
});

test('blank answer does not confirm the element', () => {
  let state = createStoryState();
  state = answerElement(state, 'hero', '   ');
  assert.equal(state.answers.hero.status, 'empty');
  assert.equal(isStoryReady(state), false);
});

test('unknown answer moves to a smaller choice instead of repeating', () => {
  let state = createStoryState();
  state = answerElement(state, 'hero', '不知道');
  const question = nextQuestion(state);
  assert.equal(question.elementId, 'hero');
  assert.ok(question.choices.length >= 2);
  assert.equal(question.attempt, 2);
});

test('three unknown attempts allow skipping without inventing content', () => {
  let state = createStoryState();
  state = answerElement(state, 'hero', '不知道');
  state = answerElement(state, 'hero', '还是不知道');
  state = answerElement(state, 'hero', '真的不知道');
  assert.equal(state.answers.hero.status, 'pending');

  const question = nextQuestion(state);
  assert.equal(question.elementId, 'goal');
});

test('story is ready only when all five elements are confirmed', () => {
  let state = createStoryState();
  for (const element of STORY_ELEMENTS) {
    state = answerElement(state, element.id, `${element.label}的具体回答`);
  }
  assert.equal(isStoryReady(state), true);
  assert.equal(storyCompletion(state), 5);
  const summary = buildStorySummary(state);
  assert.match(summary, /主角：主角的具体回答/);
  assert.match(summary, /结果：结果的具体回答/);
});

test('summary marks skipped elements as pending instead of filling them', () => {
  const state = createStoryState();
  const summary = buildStorySummary(state);
  assert.match(summary, /主角：待补充/);
  assert.doesNotMatch(summary, /一只勇敢/);
});

test('story values round trip through import without losing originals', () => {
  let state = createStoryState();
  state = answerElement(state, 'hero', '一只怕黑的小猫');
  state = answerElement(state, 'goal', '找回丢失的星星');
  const values = buildStoryValues(state);
  const restored = applyStoryValues(values);
  assert.equal(restored.answers.hero.original, '一只怕黑的小猫');
  assert.equal(restored.answers.hero.status, 'confirmed');
  assert.equal(restored.answers.obstacle.status, 'empty');
});

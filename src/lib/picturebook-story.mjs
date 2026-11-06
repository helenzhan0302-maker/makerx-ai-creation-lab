export const STORY_ELEMENTS = [
  {
    id: 'hero',
    label: '主角',
    hint: '谁的故事？',
    question: '故事里的主角是谁？',
    placeholder: '例如：一只总把袜子藏起来的小猫',
  },
  {
    id: 'goal',
    label: '目标',
    hint: '他/她想要什么？',
    question: '主角最想完成的一件事是什么？',
    placeholder: '例如：想把丢失的星星挂回天上',
  },
  {
    id: 'obstacle',
    label: '困难',
    hint: '为什么没那么容易？',
    question: '是什么让这件事没那么容易？',
    placeholder: '例如：夜里太黑，它又怕黑',
  },
  {
    id: 'action',
    label: '行动',
    hint: '他/她做了什么？',
    question: '主角具体做了什么？',
    placeholder: '例如：提着萤火虫灯笼出门',
  },
  {
    id: 'result',
    label: '结果',
    hint: '最后发生了什么变化？',
    question: '最后发生了什么变化？',
    placeholder: '例如：星星回到天上，它也敢关灯睡觉了',
  },
];

export const STORY_START_KINDS = ['character', 'wish', 'strange'];

export function createStoryState() {
  return {
    startKind: '',
    seed: '',
    answers: Object.fromEntries(
      STORY_ELEMENTS.map((element) => [element.id, { original: '', status: 'empty' }]),
    ),
  };
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function saveStoryField(state, elementId, value) {
  const element = STORY_ELEMENTS.find((item) => item.id === elementId);
  if (!element) return state;

  const original = clean(value);
  return {
    ...state,
    answers: {
      ...state.answers,
      [elementId]: { original, status: original ? 'confirmed' : 'empty' },
    },
  };
}

export function isStoryReady(state) {
  return STORY_ELEMENTS.every((element) => state.answers[element.id].status === 'confirmed');
}

export function storyCompletion(state) {
  return STORY_ELEMENTS.filter((element) => state.answers[element.id].status === 'confirmed').length;
}

export function buildStorySummary(state) {
  return STORY_ELEMENTS.map((element) => {
    const answer = state.answers[element.id];
    return `${element.label}：${answer.status === 'confirmed' ? answer.original : '待补充'}`;
  }).join('\n');
}

export function buildStoryValues(state) {
  return Object.fromEntries(
    STORY_ELEMENTS.map((element) => {
      const answer = state.answers[element.id];
      return [element.id, answer.status === 'confirmed' ? answer.original : ''];
    }),
  );
}

export function applyStoryValues(values = {}) {
  const state = createStoryState();
  return {
    ...state,
    answers: Object.fromEntries(
      STORY_ELEMENTS.map((element) => {
        const original = clean(values[element.id]);
        return [element.id, { original, status: original ? 'confirmed' : 'empty' }];
      }),
    ),
  };
}

export const STORY_ELEMENTS = [
  {
    id: 'hero',
    label: '主角',
    question: '你的故事里，主角是谁？',
    choices: ['一个小动物', '一个普通孩子', '一个会说话的物件'],
    inspirations: [
      '会发光的小恐龙',
      '不会飞的鸟',
      '变不准颜色的变色龙',
      '影子不听话的小猫',
      '一朵走到哪下到哪的小云',
      '听见植物说话的女孩',
    ],
  },
  {
    id: 'goal',
    label: '目标',
    question: '主角最想完成的一件事是什么？',
    choices: ['找到一样东西', '去一个地方', '帮一个人'],
  },
  {
    id: 'obstacle',
    label: '困难',
    question: '是什么让这件事没那么容易？',
    choices: ['有人阻止', '环境太难', '主角自己害怕'],
  },
  {
    id: 'action',
    label: '行动',
    question: '主角具体做了什么？',
    choices: ['想了一个办法', '找人帮忙', '勇敢试了一次'],
  },
  {
    id: 'result',
    label: '结果',
    question: '最后发生了什么变化？',
    choices: ['目标实现了', '得到意外的结果', '主角变了'],
  },
];

export const STORY_STARTS = [
  { id: 'wish', label: '一个愿望' },
  { id: 'strange', label: '一件奇怪的事' },
  { id: 'character', label: '一个角色' },
];

export function createStoryState() {
  return {
    start: '',
    answers: Object.fromEntries(
      STORY_ELEMENTS.map((element) => [element.id, { original: '', status: 'empty', attempts: 0 }]),
    ),
  };
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isUnknown(value) {
  if (value === '') return true;
  return ['不知道', '不清楚', '没想好', '想不出来', '不会'].some((phrase) => value.includes(phrase));
}

export function answerElement(state, elementId, answer) {
  const element = STORY_ELEMENTS.find((item) => item.id === elementId);
  if (!element) return state;

  const value = clean(answer);
  const previous = state.answers[elementId];
  const unknown = isUnknown(value);
  const attempts = unknown ? previous.attempts + 1 : previous.attempts;

  return {
    ...state,
    answers: {
      ...state.answers,
      [elementId]: {
        original: unknown ? previous.original : value,
        status: unknown ? (attempts >= 3 ? 'pending' : 'empty') : 'confirmed',
        attempts,
      },
    },
  };
}

export function nextQuestion(state) {
  const element = STORY_ELEMENTS.find((item) => state.answers[item.id].status === 'empty');
  if (!element) return { elementId: null, text: '故事卡已经准备好了。', attempt: 0, choices: [] };

  const attempt = state.answers[element.id].attempts + 1;
  return {
    elementId: element.id,
    text: attempt >= 2 ? `换个小一点的问题：${element.question}` : element.question,
    attempt,
    choices: attempt >= 2 ? element.choices : [],
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
        return [element.id, { original, status: original ? 'confirmed' : 'empty', attempts: 0 }];
      }),
    ),
  };
}

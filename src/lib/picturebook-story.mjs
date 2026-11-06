export const STORY_START_KINDS = ['character', 'theme', 'event'];

const LEGACY_START_KINDS = {
  wish: 'theme',
  strange: 'event',
};

export const STORY_TEXT_FIELDS = [
  {
    id: 'card',
    label: '我的故事创意卡',
    hint: '把智能体整理、你确认过的整张创意卡粘回来。',
    placeholder: '【我的故事创意卡】\n故事名称：\n故事主角：\n……',
    rows: 10,
    required: true,
  },
  {
    id: 'storyTitle',
    label: '故事标题',
    hint: '智能体最后给你的标题；没有就自己起一个。',
    placeholder: '例如：小猫的萤火虫灯笼',
    rows: 2,
    required: false,
  },
  {
    id: 'storyBody',
    label: '完整故事',
    hint: '把智能体和你一起确认过的那一版完整故事贴回来。',
    placeholder: '把最终确认的故事正文贴在这里……',
    rows: 12,
    required: true,
  },
  {
    id: 'decisions',
    label: '这是我自己做出的创意决定',
    hint: '选填：哪些关键决定是你提出的，或者你明确认可的？',
    placeholder: '例如：我决定让小猫怕黑，但还是自己关灯睡觉。',
    rows: 4,
    required: false,
  },
];

export const STORY_REQUIRED_TEXT_FIELDS = STORY_TEXT_FIELDS.filter((field) => field.required);

export function normalizeStartKind(value) {
  const id = typeof value === 'string' ? value.trim() : '';
  if (STORY_START_KINDS.includes(id)) return id;
  return LEGACY_START_KINDS[id] || 'character';
}

export function createStoryState() {
  return {
    startKind: 'character',
    seed: '',
    text: Object.fromEntries(STORY_TEXT_FIELDS.map((field) => [field.id, ''])),
  };
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function saveStoryText(state, fieldId, value) {
  if (!STORY_TEXT_FIELDS.some((field) => field.id === fieldId)) return state;
  return {
    ...state,
    text: {
      ...state.text,
      [fieldId]: typeof value === 'string' ? value : '',
    },
  };
}

export function isStoryReady(state) {
  return STORY_REQUIRED_TEXT_FIELDS.every((field) => clean(state.text?.[field.id]));
}

export function storyCompletion(state) {
  return STORY_REQUIRED_TEXT_FIELDS.filter((field) => clean(state.text?.[field.id])).length;
}

export function buildStorySummary(state) {
  return STORY_TEXT_FIELDS.map((field) => {
    const value = clean(state.text?.[field.id]);
    return `${field.label}：${value || '待补充'}`;
  }).join('\n');
}

export function buildStoryValues(state) {
  return Object.fromEntries(
    STORY_TEXT_FIELDS.map((field) => [field.id, clean(state.text?.[field.id])]),
  );
}

export function buildLegacyCard(values = {}) {
  const lines = [
    ['故事主角', clean(values.hero)],
    ['故事目标', clean(values.goal)],
    ['遇到的困难', clean(values.obstacle)],
    ['采取的行动', clean(values.action)],
    ['故事结果', clean(values.result)],
  ];
  const filled = lines.filter(([, value]) => value);
  return filled.length ? filled.map(([label, value]) => `${label}：${value}`).join('\n') : '';
}

export function applyStoryValues(values = {}) {
  return {
    startKind: normalizeStartKind(values.start || values.startKind),
    seed: clean(values.seed),
    text: {
      card: clean(values.card) || buildLegacyCard(values),
      storyTitle: clean(values.storyTitle) || clean(values.title),
      storyBody: clean(values.storyBody) || clean(values.story),
      decisions: clean(values.decisions),
    },
  };
}

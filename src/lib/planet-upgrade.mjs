/**
 * AI星球第 2 节课「升级工坊」的选项与提示词生成。
 * 全部是纯函数：不读写 DOM、不联网、不落盘，便于在课堂静态页与测试中复用。
 */

/** @typedef {{ id: string, label: string, description?: string }} UpgradeOption */
/**
 * @typedef {object} UpgradeState
 * @property {string[]} avatarEffects
 * @property {string} cursorEffect
 * @property {string} petType
 * @property {string} petCustom
 * @property {string} petName
 * @property {string[]} petActions
 */

export const AVATAR_EFFECT_OPTIONS = [
  { id: 'follow-cursor', label: '眼睛跟着鼠标看', description: '鼠标移动时，头像的眼睛会跟着转' },
  { id: 'glow', label: '发光呼吸', description: '头像周围有一圈慢慢变亮变暗的光' },
  { id: 'head-pat', label: '摸头有反应', description: '鼠标移到头顶，头像会眯眼、轻轻弹一下' },
  { id: 'blink', label: '会眨眼', description: '每隔几秒眨一次眼' },
  { id: 'float', label: '轻轻浮动', description: '头像上下轻轻飘' },
  { id: 'expression', label: '点击换表情', description: '点一下头像，就换一个表情' },
];

export const CURSOR_EFFECT_OPTIONS = [
  { id: 'none', label: '这次不加' },
  { id: 'stardust', label: '星尘拖尾' },
  { id: 'rainbow', label: '彩虹拖尾' },
  { id: 'bubbles', label: '气泡上浮' },
  { id: 'pixel', label: '像素方块' },
  { id: 'ripple', label: '点击涟漪' },
];

export const PET_TYPE_OPTIONS = [
  { id: 'none', label: '这次不加' },
  { id: 'robot-dog', label: '小机器狗' },
  { id: 'cat', label: '小猫' },
  { id: 'dinosaur', label: '小恐龙' },
  { id: 'robot', label: '小机器人' },
  { id: 'fox', label: '小狐狸' },
  { id: 'octopus', label: '小章鱼' },
  { id: 'custom', label: '自己描述' },
];

export const PET_ACTION_OPTIONS = [
  { id: 'follow-cursor', label: '跟着鼠标走' },
  { id: 'nap', label: '在角落打盹' },
  { id: 'jump', label: '点一下会跳' },
  { id: 'greet', label: '说一句欢迎语' },
];

export const UPGRADE_STEP_LABELS = ['头像升级', '鼠标特效', '屏幕宠物', '检查并生成'];

export const MAX_AVATAR_EFFECTS = 3;
export const MAX_PET_ACTIONS = 2;
export const DEFAULT_AVATAR_EFFECTS = ['follow-cursor', 'glow', 'expression'];

/** 每一步只生成自己那一段提示词，避免一次改太多、改坏别的部分。 */
export const UPGRADE_STEP_PROMPTS = [
  {
    id: 'avatar',
    title: '头像升级',
    resultTitle: '第 1 步：只改头像',
    instruction: '请只修改头像相关的代码和样式，网站名字、介绍、板块和布局都保持原样。',
  },
  {
    id: 'cursor',
    title: '鼠标特效',
    resultTitle: '第 2 步：只加鼠标特效',
    instruction: '请只添加鼠标特效，头像、网站名字、介绍、板块和布局都保持上一步完成后的样子。',
  },
  {
    id: 'pet',
    title: '屏幕宠物',
    resultTitle: '第 3 步：只加屏幕宠物',
    instruction: '请只添加屏幕宠物，头像、鼠标特效、网站名字、介绍、板块和布局都保持上一步完成后的样子。',
  },
];

/** @returns {UpgradeState} */
export function createUpgradeState() {
  return {
    avatarEffects: [...DEFAULT_AVATAR_EFFECTS],
    cursorEffect: 'none',
    petType: 'none',
    petCustom: '',
    petName: '',
    petActions: [],
  };
}

/** @param {unknown} value */
function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/** @param {string[]} ids @param {UpgradeOption[]} options */
function labelsFor(ids, options) {
  return ids
    .map((id) => options.find((option) => option.id === id)?.label || clean(id))
    .filter(Boolean);
}

/** @param {UpgradeState} state */
function hasPet(state) {
  return clean(state.petType) !== '' && state.petType !== 'none';
}

/** @param {UpgradeState} state */
function petLabel(state) {
  if (state.petType === 'custom') return clean(state.petCustom);
  return PET_TYPE_OPTIONS.find((option) => option.id === state.petType)?.label || clean(state.petType);
}

/**
 * 逐步校验；返回中文提示，交给页面显示。
 * @param {UpgradeState} state @param {number} stepIndex
 */
export function validateUpgradeStep(state, stepIndex) {
  if (stepIndex === 0) {
    const effects = Array.isArray(state.avatarEffects) ? state.avatarEffects.filter(Boolean) : [];
    if (effects.length === 0) {
      return { valid: false, message: '至少选择一种头像效果。' };
    }
    if (effects.length > MAX_AVATAR_EFFECTS) {
      return { valid: false, message: `头像效果最多选择三个。` };
    }
  }

  if (stepIndex === 1) {
    const cursor = clean(state.cursorEffect) || 'none';
    if (!CURSOR_EFFECT_OPTIONS.some((option) => option.id === cursor)) {
      return { valid: false, message: '请选择一种鼠标特效，或选择「这次不加」。' };
    }
  }

  if (stepIndex === 2) {
    const petType = clean(state.petType) || 'none';
    if (!PET_TYPE_OPTIONS.some((option) => option.id === petType)) {
      return { valid: false, message: '请选择一种屏幕宠物，或选择「这次不加」。' };
    }
    if (petType === 'custom' && !clean(state.petCustom)) {
      return { valid: false, message: '选择「自己描述」时，请写下你的宠物是什么。' };
    }
    const actions = Array.isArray(state.petActions) ? state.petActions.filter(Boolean) : [];
    if (actions.length > MAX_PET_ACTIONS) {
      return { valid: false, message: '宠物动作最多选择两个。' };
    }
  }

  return { valid: true, message: '' };
}

/** @param {UpgradeState} state */
export function validateUpgradeAll(state) {
  for (const stepIndex of [0, 1, 2]) {
    const result = validateUpgradeStep(state, stepIndex);
    if (!result.valid) return { ...result, stepIndex };
  }
  return { valid: true, message: '', stepIndex: -1 };
}

/**
 * 生成「修改型」提示词。段落按选择省略，不留空标题。
 * @param {UpgradeState} state
 */
export function buildUpgradePrompt(state) {
  const avatarLabels = labelsFor(state.avatarEffects || [], AVATAR_EFFECT_OPTIONS);
  const cursorLabel = CURSOR_EFFECT_OPTIONS.find((option) => option.id === state.cursorEffect)?.label || '';
  const petName = clean(state.petName);
  const actionLabels = labelsFor(state.petActions || [], PET_ACTION_OPTIONS);
  const petTypeLabel = petLabel(state);

  const changeLines = [];
  if (avatarLabels.length > 0) {
    changeLines.push(`1. 头像：${avatarLabels.join('、')}。`);
  }
  if (cursorLabel && state.cursorEffect !== 'none') {
    changeLines.push(`${changeLines.length + 1}. 鼠标特效：${cursorLabel}。`);
  }
  if (hasPet(state)) {
    const petParts = [petTypeLabel];
    if (petName) petParts.push(`名字叫「${petName}」`);
    if (actionLabels.length > 0) petParts.push(actionLabels.join('、'));
    changeLines.push(`${changeLines.length + 1}. 屏幕宠物：${petParts.join('，')}。`);
  }

  const lines = [
    '请在我上一条消息做好的网站基础上继续修改，做出「我的AI星球 2.0」。',
    '不要重新做一个新网站。',
    '',
    '一、必须保留',
    '网站名字、自我介绍、已有内容板块、原来的主色和布局都先保留。',
    '如果某个改动会影响到这些内容，先停下来告诉我，不要直接删改。',
    '',
  ];

  if (changeLines.length > 0) {
    lines.push('二、这次只改这些地方', ...changeLines, '');
  }

  lines.push(
    '三、可以自由发挥',
    '在不破坏上面内容的前提下，细节你可以自己决定。',
    '',
    '四、不要做的事',
    '不要删除我没提到的内容；不要编造我的经历、奖项和事实；',
    '不要添加我没有要求的板块；特效不要挡住文字和按钮。',
    '',
    '五、完成后请告诉我',
    '1. 你改了哪些地方。',
    '2. 哪些地方需要我自己检查。',
  );

  return lines.join('\n');
}

/** @param {UpgradeState} state @param {number} stepIndex */
function stepChangeLine(state, stepIndex) {
  if (stepIndex === 0) {
    const avatarLabels = labelsFor(state.avatarEffects || [], AVATAR_EFFECT_OPTIONS);
    return avatarLabels.length > 0 ? `头像效果：${avatarLabels.join('、')}。` : '';
  }
  if (stepIndex === 1) {
    const cursorLabel = CURSOR_EFFECT_OPTIONS.find((option) => option.id === state.cursorEffect)?.label || '';
    return state.cursorEffect !== 'none' && cursorLabel ? `鼠标特效：${cursorLabel}。` : '';
  }
  if (stepIndex === 2) {
    if (!hasPet(state)) return '';
    const petParts = [petLabel(state)];
    const petName = clean(state.petName);
    const actionLabels = labelsFor(state.petActions || [], PET_ACTION_OPTIONS);
    if (petName) petParts.push(`名字叫「${petName}」`);
    if (actionLabels.length > 0) petParts.push(actionLabels.join('、'));
    return `屏幕宠物：${petParts.join('，')}。`;
  }
  return '';
}

/**
 * 只生成当前步骤的修改提示词，孩子复制一次、让 AI 只改这一块。
 * 头像与鼠标特效步骤始终生成；宠物步骤选择「这次不加」时返回空字符串，由页面提示跳过。
 * @param {UpgradeState} state @param {number} stepIndex
 */
export function buildUpgradeStepPrompt(state, stepIndex) {
  if (stepIndex === 2 && !hasPet(state)) return '';
  if (stepIndex < 0 || stepIndex > 2) return '';

  const step = UPGRADE_STEP_PROMPTS[stepIndex];
  const changeLine = stepChangeLine(state, stepIndex);
  if (!changeLine) return '';

  return [
    `请在我上一条消息做好的网站基础上继续修改。这是第 ${stepIndex + 1} 步：${step.title}。`,
    step.instruction,
    '',
    '一、这次只改这里',
    changeLine,
    '',
    '二、必须保留',
    '网站名字、自我介绍、已有内容板块、原来的主色和布局都保留。',
    '前面已经做好的升级也保留：不要删掉或重写上一步已经完成的效果。',
    '如果这个改动会影响到这些内容，先停下来告诉我，不要直接删改。',
    '',
    '三、不要做的事',
    '不要重新做一个新网站；不要删除我没提到的内容；不要编造我的经历、奖项和事实；',
    '不要添加我没有要求的板块；特效不要挡住文字和按钮。',
    '',
    '四、完成后请告诉我',
    '1. 你只改了哪些地方。',
    '2. 哪些地方需要我自己检查。',
  ].join('\n');
}

/**
 * 路演卡：第 2 问自动填入孩子的选择，第 1、3 问留空让孩子现场说。
 * @param {UpgradeState} state
 */
export function buildRoadshowCard(state) {
  const avatarLabels = labelsFor(state.avatarEffects || [], AVATAR_EFFECT_OPTIONS);
  const cursorLabel = CURSOR_EFFECT_OPTIONS.find((option) => option.id === state.cursorEffect)?.label || '';
  const actionLabels = labelsFor(state.petActions || [], PET_ACTION_OPTIONS);
  const changes = [];

  if (avatarLabels.length > 0) changes.push(`头像加了${avatarLabels.join('和')}`);
  if (cursorLabel && state.cursorEffect !== 'none') changes.push(`鼠标移动时会有${cursorLabel}`);
  if (hasPet(state)) {
    const petName = clean(state.petName);
    const petText = `加了一只${petLabel(state)}${petName ? `，叫${petName}` : ''}${actionLabels.length ? `，会${actionLabels.join('、')}` : ''}`;
    changes.push(petText);
  }

  return [
    '01 介绍自己的网站',
    '我的网站是关于：____________________',
    '我希望别人了解：____________________',
    '',
    '02 相对 1.0 做了哪些改进',
    changes.length > 0 ? `我给网站${changes.join('；')}。` : '我给网站做了这些改进：____________________',
    '我最满意的变化是：____________________',
    '',
    '03 未来你还想如何改善它',
    '我还想增加：____________________',
  ].join('\n');
}

export const AVATAR_OPTIONS = [
  { id: 'pixel-builder', label: '像素建造师', description: '喜欢把想法一格一格做出来' },
  { id: 'robot-inventor', label: '机器人发明家', description: '喜欢设计会帮忙的小发明' },
  { id: 'dinosaur-explorer', label: '恐龙探险家', description: '带着好奇心探索未知世界' },
  { id: 'space-traveler', label: '太空旅行者', description: '准备出发去看看星星' },
  { id: 'monster-trainer', label: '怪兽训练家', description: '和有趣的伙伴一起成长' },
  { id: 'magic-apprentice', label: '魔法学徒', description: '用想象力施展奇妙创意' },
  { id: 'original-hero', label: '原创超级英雄', description: '拥有自己的超能力和任务' },
  { id: 'mecha-pilot', label: '机甲驾驶员', description: '驾驶酷炫机甲解决问题' },
  { id: 'ninja-explorer', label: '忍者探险家', description: '敏捷地发现新的线索' },
  { id: 'undersea-explorer', label: '海底探险家', description: '去深海寻找神奇故事' },
  { id: 'racer', label: '赛车手', description: '喜欢速度、挑战和终点' },
  { id: 'cat-companion', label: '猫咪伙伴', description: '一位软乎乎的好朋友' },
  { id: 'dog-companion', label: '狗狗伙伴', description: '一位热情可靠的好朋友' },
  { id: 'rabbit-companion', label: '兔子伙伴', description: '一位轻快可爱的好朋友' },
  { id: 'nature-spirit', label: '自然精灵', description: '和森林、花朵与风一起玩' },
  { id: 'custom', label: '自己描述', description: '写下你脑海中的原创形象' },
];

export const SECTION_OPTIONS = [
  { id: 'about-me', label: '关于我' },
  { id: 'hobbies', label: '我的爱好' },
  { id: 'works', label: '我的作品' },
  { id: 'dreams', label: '我的梦想' },
  { id: 'collection', label: '我的收藏' },
  { id: 'pets', label: '我的宠物' },
  { id: 'game-world', label: '我的游戏世界' },
  { id: 'inventions', label: '我的小发明' },
  { id: 'travel-map', label: '我的旅行地图' },
  { id: 'recommendations', label: '我推荐的书或电影' },
];

export const STYLE_OPTIONS = [
  { id: 'lively', label: '活泼热闹', description: '颜色明亮，感觉像一场热闹的派对' },
  { id: 'quiet', label: '安静干净', description: '留出空间，让重要内容更清楚' },
  { id: 'tech', label: '科技酷炫', description: '像进入一座正在运行的未来基地' },
  { id: 'natural', label: '自然清爽', description: '像在阳光、风和植物之间探索' },
  { id: 'dreamy', label: '梦幻想象', description: '让现实和想象一起发光' },
];

export const COLOR_OPTIONS = [
  { id: 'sky-blue', label: '天空蓝', hex: '#65B7F3' },
  { id: 'ocean-blue', label: '海洋蓝', hex: '#2E6FD8' },
  { id: 'mint-green', label: '薄荷绿', hex: '#78DCC2' },
  { id: 'grass-green', label: '草地绿', hex: '#63B85B' },
  { id: 'lemon-yellow', label: '柠檬黄', hex: '#F5D34D' },
  { id: 'orange', label: '橘子橙', hex: '#F48B45' },
  { id: 'strawberry-red', label: '草莓红', hex: '#E95C6B' },
  { id: 'grape-purple', label: '葡萄紫', hex: '#8865C8' },
  { id: 'cherry-blossom', label: '樱花粉', hex: '#F2A8C3' },
  { id: 'space-black', label: '深空黑', hex: '#111315' },
  { id: 'cream-white', label: '奶油白', hex: '#FFF7E8' },
  { id: 'rainbow', label: '彩虹渐变', hex: 'linear-gradient(90deg, #F16B7A, #F5D34D, #78DCC2, #65B7F3, #8865C8)' },
];

export const LAYOUT_OPTIONS = [
  { id: 'vertical', label: '竖着一路排', description: '从上到下一块接一块，像下楼梯' },
  { id: 'split', label: '左右分开', description: '左边放头像和导航，右边放主要内容' },
  { id: 'bloom', label: '中间开花', description: '最重要的内容在中间，其它内容围在四周' },
  { id: 'grid', label: '格子铺开', description: '像相册一样，一格一格摆开' },
  { id: 'zigzag', label: '左右交替走', description: '左一块、右一块往下走，像逛展览' },
];

export const STEP_LABELS = [
  '网站名字',
  '头像 / 形象',
  '介绍自己',
  '网站内容',
  '网站风格',
  '主色与搭配色',
  '页面布局',
  '检查并生成',
];

/** @returns {BuilderState} */
export function createInitialState() {
  return {
    websiteName: '',
    avatars: [],
    avatarCustom: '',
    intro: {
      self: '',
      favorite: '',
      known: '',
    },
    sections: [],
    sectionsCustom: '',
    style: '',
    colors: [],
    customColor: '',
    layout: '',
  };
}

/** @param {unknown} value */
function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/** @param {string[]} ids @param {BuilderOption[]} options */
function labelsFor(ids, options) {
  return ids
    .map((id) => options.find((option) => option.id === id)?.label || clean(id))
    .filter(Boolean);
}

/** @param {BuilderState} state */
function avatarLabels(state) {
  const labels = labelsFor(state.avatars, AVATAR_OPTIONS).filter((label) => label !== '自己描述');
  const custom = clean(state.avatarCustom);
  if (custom) labels.push(custom);
  return labels;
}

/** @param {BuilderState} state */
function sectionLabels(state) {
  const labels = labelsFor(state.sections, SECTION_OPTIONS);
  const custom = clean(state.sectionsCustom);
  if (custom) labels.push(custom);
  return labels;
}

/** @param {BuilderState} state */
function colorLabels(state) {
  const labels = labelsFor(state.colors, COLOR_OPTIONS);
  const custom = clean(state.customColor);
  if (custom) labels.push(custom);
  return labels;
}

/** @param {BuilderState} state @param {number} stepIndex */
export function validateStep(state, stepIndex) {
  if (stepIndex === 0 && !clean(state.websiteName)) {
    return { valid: false, message: '请先写一个网站名字。' };
  }

  if (stepIndex === 1) {
    if (state.avatars.length > 2) {
      return { valid: false, message: '头像最多选择两个。' };
    }
    if (avatarLabels(state).length === 0) {
      return { valid: false, message: '请选择一个形象，或写下你自己的想法。' };
    }
  }

  if (stepIndex === 3 && sectionLabels(state).length === 0) {
    return { valid: false, message: '至少选择一项内容，或自己补充一项。' };
  }

  if (stepIndex === 4 && !clean(state.style)) {
    return { valid: false, message: '请选择一种网站风格。' };
  }

  if (stepIndex === 5) {
    if (colorLabels(state).length === 0) {
      return { valid: false, message: '至少选择一种颜色，或自己填写颜色。' };
    }
    if (colorLabels(state).length > 3) {
      return { valid: false, message: '颜色最多选择三个。' };
    }
  }

  if (stepIndex === 6 && !clean(state.layout)) {
    return { valid: false, message: '请选择一种页面布局。' };
  }

  return { valid: true, message: '' };
}

/** @param {BuilderState} state */
function introductionLines(state) {
  const lines = [];
  const intro = state.intro || {};
  if (clean(intro.self)) lines.push(`一句话介绍我自己：${clean(intro.self)}`);
  if (clean(intro.favorite)) lines.push(`我最喜欢的内容：${clean(intro.favorite)}`);
  if (clean(intro.known)) lines.push(`我希望大家知道的我：${clean(intro.known)}`);
  return lines;
}

/** @param {BuilderState} state */
export function buildPrompt(state) {
  const lines = [
    '你是一位经验丰富的网站设计专家，特别擅长帮小学生做出好看又好用的个人网站。',
    '请帮我做一个【个人网站】。下面是我的想法：',
    '',
    `一、网站名称：${clean(state.websiteName)}`,
    `二、我的头像 / 形象：${avatarLabels(state).join('、')}`,
  ];

  const introLines = introductionLines(state);
  lines.push(
    introLines.length > 0 ? '三、我想这样介绍自己：' : '三、我想这样介绍自己：这次先不写',
    ...introLines,
  );

  const sectionValues = sectionLabels(state);
  lines.push(
    `四、网站上要放的内容：${sectionValues.join('、')}`,
  );

  const colors = colorLabels(state);
  const primaryColor = colors[0] || '';
  const supportingColors = colors.slice(1);
  const styleLabel = STYLE_OPTIONS.find((option) => option.id === state.style)?.label || clean(state.style);
  const layoutLabel = LAYOUT_OPTIONS.find((option) => option.id === state.layout)?.label || clean(state.layout);
  lines.push(
    `五、整体风格：${styleLabel}`,
    `六、主色与搭配色：主色是${primaryColor}${supportingColors.length ? `，搭配色是${supportingColors.join('、')}` : ''}`,
    `七、页面布局：${layoutLabel}`,
  );

  return lines.join('\n');
}

/** @param {BuilderState} state */
export function validateAll(state) {
  const requiredSteps = [0, 1, 3, 4, 5, 6];
  for (const stepIndex of requiredSteps) {
    const result = validateStep(state, stepIndex);
    if (!result.valid) return { ...result, stepIndex };
  }
  return { valid: true, message: '', stepIndex: -1 };
}

/**
 * 复制文本到剪贴板，优先使用异步剪贴板 API，失败后降级到隐藏 textarea。
 * 只有真正复制成功时才返回 true；调用方据此决定反馈文案。
 * @param {string} text
 * @param {any} environment 注入的宿主环境（默认全局对象），便于测试
 */
export async function copyTextToClipboard(text, environment = globalThis) {
  const value = typeof text === 'string' ? text : '';
  const clipboard = environment?.navigator?.clipboard;

  if (clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(value);
      return true;
    } catch {
      // 非安全上下文或权限被拒绝时继续尝试降级方案。
    }
  }

  const document = environment?.document;
  if (!document?.createElement || !document.body?.appendChild) return false;

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';

  let copied = false;
  try {
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    if (typeof textarea.setSelectionRange === 'function') {
      textarea.setSelectionRange(0, value.length);
    }
    copied = typeof document.execCommand === 'function' && document.execCommand('copy') === true;
  } catch {
    copied = false;
  } finally {
    textarea.remove?.();
  }

  return copied;
}
/** @typedef {{ id: string, label: string, description?: string, hex?: string }} BuilderOption */
/** @typedef {{ websiteName: string, avatars: string[], avatarCustom: string, intro: { self: string, favorite: string, known: string }, sections: string[], sectionsCustom: string, style: string, colors: string[], customColor: string, layout: string }} BuilderState */

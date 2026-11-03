export const PAGE_COUNT = 6;

export const STYLE_OPTIONS = {
  ratio: ['横版 4:3', '竖版 3:4', '方形 1:1'],
  artStyle: ['治愈水彩', '可爱卡通', '精致 3D', '手绘蜡笔'],
  palette: ['暖色', '冷色', '鲜艳撞色', '粉彩'],
};

export const CHARACTER_TRAITS = [
  { id: 'color', label: '颜色', placeholder: '例如：深蓝色' },
  { id: 'shape', label: '发型/外形', placeholder: '例如：圆耳朵、短尾巴' },
  { id: 'clothes', label: '衣服', placeholder: '例如：黄色雨衣' },
  { id: 'mark', label: '标志物', placeholder: '例如：背上的小铃铛' },
];

const STORY_LABELS = [
  ['hero', '主角'],
  ['goal', '目标'],
  ['obstacle', '困难'],
  ['action', '行动'],
  ['result', '结果'],
];

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function createStoryboard() {
  return Array.from({ length: PAGE_COUNT }, (_, index) => ({
    page: index + 1,
    scene: '',
    action: '',
    emotion: '',
  }));
}

export function storyboardCompletion(storyboard) {
  return (Array.isArray(storyboard) ? storyboard : []).filter(
    (page) => clean(page.scene) && clean(page.action) && clean(page.emotion),
  ).length;
}

export function buildStoryboardPrompt(story) {
  const lines = STORY_LABELS.map(([id, label]) => `${label}：${clean(story[id]) || '待补充'}`);
  return [
    '请根据我的故事卡，帮我把故事拆成 6 页分镜。',
    '不要新增我没有说过的主要情节，不要替我改结局。',
    '',
    '我的故事卡：',
    ...lines,
    '',
    '请按 6 页输出，每页只写三项：',
    '1. 画面发生什么',
    '2. 角色在做什么',
    '3. 角色是什么情绪',
    '',
    '如果某一页信息不够，先问我一个问题，不要自己补。',
  ].join('\n');
}

export function buildSocraticPrompt({ element, story, childAnswer, attempt }) {
  const lines = STORY_LABELS.map(([id, label]) => `${label}：${clean(story[id]) || '待补充'}`);
  const heard = clean(childAnswer);
  return [
    '你是我的故事搭档，不是代写者。',
    '你的任务：帮我把故事想清楚，但故事由我决定。',
    '',
    '规则：',
    '1. 每次只问我一个问题，等我回答后再问下一个。',
    '2. 先复述你听到的我的原话，再指出一个还不清楚的地方。',
    '3. 不要替我写完整情节，不要替我决定结局。',
    '4. 不要评价我的想法好不好，只帮我把它说得更具体。',
    '5. 如果我说“不知道”，给我两三个方向让我选，不要逼我。',
    '6. 不要问我真实姓名、学校、住址、电话或照片。',
    '',
    '现在我的故事卡是：',
    ...lines,
    '',
    heard ? `我刚刚说的是：${heard}` : '我还没有回答这一格。',
    `这是第 ${attempt} 次追问。请从「${element}」开始，只问我一个问题。`,
  ].join('\n');
}

export function buildReferencePrompt({ artStyle, palette, traits }) {
  return [
    '请先为我的绘本主角生成一张参考图，用来确认长相。',
    '只生成主角，不要生成整页绘本。',
    '',
    '角色固定特征：',
    `颜色：${clean(traits?.color) || '待补充'}`,
    `发型/外形：${clean(traits?.shape) || '待补充'}`,
    `衣服：${clean(traits?.clothes) || '待补充'}`,
    `标志物：${clean(traits?.mark) || '待补充'}`,
    '',
    `画风：${clean(artStyle) || '待补充'}`,
    `色调：${clean(palette) || '待补充'}`,
    '',
    '请让角色保持中性姿势、清楚露出上述特征，方便我之后逐页沿用。',
  ].join('\n');
}

export function buildPagePrompt({ page, visual, traits }) {
  return [
    `这是绘本第 ${page.page} 页的插画。`,
    '',
    `画面：${clean(page.scene) || '待补充'}`,
    `角色动作：${clean(page.action) || '待补充'}`,
    `角色情绪：${clean(page.emotion) || '待补充'}`,
    '',
    '角色固定特征（每一页都必须一致）：',
    `颜色：${clean(traits?.color) || '待补充'}`,
    `发型/外形：${clean(traits?.shape) || '待补充'}`,
    `衣服：${clean(traits?.clothes) || '待补充'}`,
    `标志物：${clean(traits?.mark) || '待补充'}`,
    '',
    `画风：${clean(visual?.artStyle) || '待补充'}`,
    `色调：${clean(visual?.palette) || '待补充'}`,
    `比例：${clean(visual?.ratio) || '待补充'}`,
    '',
    '不要改变角色长相，不要加入文字，不要新增分镜里没有的主要角色。',
  ].join('\n');
}

export function buildRevisionPrompt({ pageNumber, change, keep }) {
  return [
    '请只修改这一页，不要重做整本绘本，也不要改变角色的固定特征。',
    '',
    `这是第 ${pageNumber} 页。`,
    `要改的地方：${clean(change) || '待补充'}`,
    `必须保留：${clean(keep) || '待补充'}`,
    '',
    '改完后告诉我：你改了哪里，还有哪里需要我自己检查。',
  ].join('\n');
}

export function buildRoadshowCard({ story, storyboard }) {
  const favorite = (Array.isArray(storyboard) ? storyboard : []).find(
    (page) => clean(page.scene) && clean(page.action),
  );
  return [
    '01 我的故事讲什么',
    clean(story.hero) ? `我的故事主角是：${clean(story.hero)}` : '我的故事主角是：____________________',
    clean(story.goal) ? `他最想完成：${clean(story.goal)}` : '他最想完成：____________________',
    '',
    '02 我最满意的一页',
    favorite ? `我最满意第 ${favorite.page} 页：${clean(favorite.scene)}` : '我最满意第 ____ 页：____________________',
    '因为：____________________',
    '',
    '03 我最想继续改进的地方',
    '我还想改：____________________',
    '',
    '给同伴的反馈',
    '我看懂了：____________________',
    '我最喜欢：____________________',
    '我有一个建议：____________________',
  ].join('\n');
}

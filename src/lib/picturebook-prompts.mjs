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

export function buildSocraticPrompt({ story = {} } = {}) {
  const lines = STORY_LABELS.map(([id, label]) => `${label}：${clean(story[id]) || '待补充'}`);
  const missing = STORY_LABELS.filter(([id]) => !clean(story[id])).map(([, label]) => label);
  const start = missing.length
    ? `现在故事卡里还缺：${missing.join('、')}。请从第一个缺失的格子开始，只问我一个问题。`
    : '我的故事卡已经填满。请先复述一遍确认，再进入第二阶段写出完整故事；写完后问我是否和我想的一样。';

  return [
    '你是我的故事搭档，不是代写者。',
    '我的故事由我决定。你负责把问题问清楚，再帮我把回答整理成一个完整故事。',
    '',
    '我现在的故事卡：',
    ...lines,
    '',
    '请按三个阶段进行，不要跳步：',
    '',
    '第一阶段：把缺口问清楚',
    '1. 先复述你听到的我的原话，再指出一个还不清楚的地方。',
    '2. 每次只问我一个问题，等我回答后再问下一个；不要一次给我一整套问卷。',
    '3. 只问还没填、或者说得太笼统的格子；已经清楚的部分不要重复问。',
    '4. 如果我说“不知道”，给我两三个具体方向让我选，不要逼我，也不要替我编。',
    '5. 不要问我真实姓名、学校、住址、电话或照片。',
    '',
    '第二阶段：写出完整故事',
    '6. 当我回答完必要的问题后，把故事整理成完整的一版，按「主角 / 目标 / 困难 / 行动 / 结果」五段写。',
    '7. 只能使用我说过的内容。需要补充细节时，先问我；不要新增我没说过的主要角色、转折或结局。',
    '8. 写完后停下来，不要直接替我定稿。',
    '',
    '第三阶段：请我检查并修改',
    '9. 问我：“这是你想讲的故事吗？哪里和你想象的不一样？”',
    '10. 等我说出不一样的地方，再按我的意见改；每次改完都告诉我改了哪里。',
    '11. 如果我说“就是这样”，再输出最终故事卡，并提醒我回到网站，把五格填进故事卡，再拆成 6 页分镜。',
    '',
    start,
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

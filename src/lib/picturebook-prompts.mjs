export const PAGE_COUNT = 6;

export const STYLE_OPTIONS = {
  ratio: ['横版 4:3', '竖版 3:4', '方形 1:1'],
  artStyle: ['治愈水彩', '可爱卡通', '精致 3D', '手绘蜡笔'],
  palette: ['暖色', '冷色', '鲜艳撞色', '粉彩'],
};

export const STORY_STARTS = {
  character: {
    id: 'character',
    label: '一个角色',
    prompt: '一个角色',
    placeholder: '例如：会发光的小恐龙、影子不听话的小猫',
    ideas: [
      '会发光的小恐龙',
      '不会飞的鸟',
      '变不准颜色的变色龙',
      '影子不听话的小猫',
      '一朵走到哪下到哪的小云',
      '听见植物说话的女孩',
    ],
  },
  wish: {
    id: 'wish',
    label: '一个愿望',
    prompt: '一个愿望',
    placeholder: '例如：想把月亮摘下来当夜灯',
    ideas: [
      '想把月亮摘下来当夜灯',
      '想和已经搬走的朋友再玩一次',
      '想让所有人记住自己的名字',
      '想听懂大海在说什么',
      '想让冬天提前一天到来',
      '想找到世界上最后一颗糖',
    ],
  },
  strange: {
    id: 'strange',
    label: '一件奇怪的事',
    prompt: '一件奇怪的事',
    placeholder: '例如：每天醒来，家门口多一扇没见过的门',
    ideas: [
      '每天醒来，家门口多一扇没见过的门',
      '影子会在半夜自己出门散步',
      '所有钟表一起停在了同一个分钟',
      '书包里长出了一棵小树',
      '雨只下在一个人头顶',
      '镜子里的自己慢半拍',
    ],
  },
};

export const STORY_START_ORDER = ['character', 'wish', 'strange'];

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

export const PAGE_BEATS = [
  { page: 1, label: '认识主角', prompt: '主角是谁？他在哪里？' },
  { page: 2, label: '主角的目标', prompt: '他想要什么？为什么现在就要？' },
  { page: 3, label: '困难出现', prompt: '什么挡住了他？' },
  { page: 4, label: '采取行动', prompt: '他具体做了什么？' },
  { page: 5, label: '转折', prompt: '什么发生了变化？' },
  { page: 6, label: '结果与结尾', prompt: '最后怎么样了？' },
];

export function storyboardCompletion(storyboard) {
  return (Array.isArray(storyboard) ? storyboard : []).filter(
    (page) => clean(page.scene) && clean(page.action) && clean(page.emotion),
  ).length;
}

export function buildStoryboardPrompt(story) {
  const lines = STORY_LABELS.map(([id, label]) => `${label}：${clean(story[id]) || '待补充'}`);
  const beats = PAGE_BEATS.map((beat) => `第 ${beat.page} 页 · ${beat.label}：${beat.prompt}`).join('\n');
  return [
    '请根据我的故事卡，帮我把故事拆成 6 页分镜。',
    '不要新增我没有说过的主要情节，不要替我改结局。',
    '',
    '我的故事卡：',
    ...lines,
    '',
    '6 页各自的叙事任务（顺序不要改）：',
    beats,
    '',
    '请按 6 页输出，每页写四项：',
    '1. 这一页的叙事任务（照抄上面的任务）',
    '2. 画面发生什么',
    '3. 角色在做什么',
    '4. 角色是什么情绪',
    '',
    '文字少一点，给画面留空间；不要把一整段故事塞进同一页。',
    '',
    '如果某一页信息不够，先问我一个问题，不要自己补。',
  ].join('\n');
}

export function buildSocraticPrompt({ story = {} } = {}) {
  const lines = STORY_LABELS.map(([id, label]) => `${label}：${clean(story[id]) || '待补充'}`);
  const missing = STORY_LABELS.filter(([id]) => !clean(story[id])).map(([, label]) => label);
  const startKind = clean(story.startKind);
  const seed = clean(story.seed);
  const opening = seed
    ? `我的故事从「${startKind || '一个念头'}」开始：「${seed}」。`
    : startKind
      ? `我的故事想从「${startKind}」开始，但还没想好具体是什么。请先只问我一个关于「${startKind}」的问题。`
      : `我还没想好从哪里开始。请先只问我一个问题：“你的故事想从一个角色、一个愿望，还是一件奇怪的事开始？”`;
  const focus = missing.length
    ? `我最不确定的是：${missing.join('、')}。但不要按顺序盘问，只挑最能改变故事的那个问题。`
    : '五个格子我已经有想法了，但要先请你检查它们是否真的连得起来。';

  return [
    '你是一位很会提问的故事搭档，不是代写机器。',
    '我的故事由我决定；你负责帮我想清楚，再把我说的整理成一个完整故事。',
    '',
    opening,
    '',
    '我现在已经写下的（没写的表示还没想好，不要替我补）：',
    ...lines,
    `我的起点类型：${startKind || '还没决定'}`,
    `我的故事种子：${seed || '还没决定'}`,
    '',
    focus,
    '',
    '请严格按三个阶段进行，不要跳步，也不要在第一阶段就写完整故事：',
    '',
    '第一阶段：一次只问一个问题，把故事问清楚',
    '1. 每次只问一个问题，等我说完再问下一个；不要提前给我一整套问卷。',
    '2. 每次提问前，先用一句话复述上一条回答让你更新了什么判断。',
    '3. 优先区分：我说的是画面里看得见的事实、我的解释、我的喜好，还是我希望发生的事。',
    '4. 检查关键词是否含糊：谁？在哪里？想要什么？为什么做不到？如果他做到了，会发生什么？',
    '5. 只问可能改变故事的问题；已经有清楚答案的不要重复问。',
    '6. 我如果说“不知道”，给我两三个具体、可画出来的方向让我选，不要替我编，也不要重复同一个问题。',
    '7. 最多问 6 个问题。信息够了就立刻停止，不用凑满。',
    '8. 不要问我真实姓名、学校、住址、电话或照片；也不要要求我上传自己的照片。',
    '',
    '第二阶段：把我说过的整理成完整故事',
    '9. 当信息足够时，先告诉我“我准备写了”，然后按「主角 / 目标 / 困难 / 行动 / 结果」五段写出完整故事。',
    '10. 只能使用我说过的内容；需要补充细节时先问我，不要新增我没说过的主要角色、转折或结局。',
    '11. 写完后列出「我用了你的哪些原话」，让我看得出哪些是我的、哪些是整理。',
    '12. 写完就停下来，不要自己宣布定稿。',
    '',
    '第三阶段：请我检查并修改',
    '13. 问我：“这是你想讲的故事吗？哪里和你想象的不一样？”',
    '14. 等我说出不一样的地方，再按我的意见改；每次只改我说的那处，并告诉我改了哪里。',
    '15. 如果我说“就是这样”，再输出最终故事卡（主角 / 目标 / 困难 / 行动 / 结果各一行），并提醒我回到网站，把这五行填进故事卡。',
    '',
    '现在开始第一阶段。请只问我第一个问题，不要写故事。',
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

export function buildTraitExtractionPrompt({ story = {} } = {}) {
  const lines = STORY_LABELS.map(([id, label]) => `${label}：${clean(story[id]) || '待补充'}`);
  return [
    '请根据第 1 节课的故事，帮我提取绘本主角的固定外观。',
    '只做提取和追问，不要凭空发明角色。',
    '',
    '我的故事：',
    `起点类型：${clean(story.startKind) || '待补充'}`,
    `故事种子：${clean(story.seed) || '待补充'}`,
    ...lines,
    '',
    '请按四项输出，每项一行：',
    '颜色：',
    '发型/外形：',
    '衣服：',
    '标志物：',
    '',
    '规则：',
    '1. 只能使用故事里已经出现或明确暗示的外观信息。',
    '2. 故事没提到的项写“待补充”，并问我一个能补上它的小问题；一次只问一个。',
    '3. 如果某项有两个可能，给我两三个可画出来的选项让我选。',
    '4. 不要编造真实人物的长相，也不要用我自己或同学的照片。',
    '',
    '先输出你从故事里读到的四项，再问我第一个需要补的问题。',
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

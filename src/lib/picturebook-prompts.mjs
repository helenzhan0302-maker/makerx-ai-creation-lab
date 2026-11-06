export const PAGE_COUNT = 6;

export const STYLE_OPTIONS = {
  ratio: ['横版 4:3', '竖版 3:4', '方形 1:1'],
  artStyle: ['治愈水彩', '可爱卡通', '精致 3D', '手绘蜡笔'],
  palette: ['暖色', '冷色', '鲜艳撞色', '粉彩'],
};

export const STORY_STARTS = {
  character: {
    id: 'character',
    label: '一个特别的角色',
    prompt: '一个角色',
    placeholder: '例如：会飞的小猫、害怕黑暗的小龙',
    ideas: [
      '会飞的小猫',
      '害怕黑暗的小龙',
      '想当厨师的机器人',
      '会说话的恐龙',
      '住在瓶子里的精灵',
      '自己想一个角色',
    ],
  },
  theme: {
    id: 'theme',
    label: '一个想讲的主题',
    prompt: '一个主题',
    placeholder: '例如：一次奇妙的冒险、寻找失踪的朋友',
    ideas: [
      '一次奇妙的冒险',
      '寻找失踪的朋友',
      '实现一个愿望',
      '交到一个新朋友',
      '一次意想不到的比赛',
      '自己想一个主题',
    ],
  },
  event: {
    id: 'event',
    label: '一件奇妙的事情',
    prompt: '一件奇妙的事',
    placeholder: '例如：天空突然下起糖果雨',
    ideas: [
      '天空突然下起糖果雨',
      '动物们开始上学',
      '所有人都变成小巨人',
      '时间突然停止了',
      '森林里的树会走路',
      '自己想一件怪事',
    ],
  },
};

export const STORY_START_ORDER = ['character', 'theme', 'event'];

export const CHARACTER_TRAITS = [
  { id: 'color', label: '颜色', placeholder: '例如：深蓝色' },
  { id: 'shape', label: '发型/外形', placeholder: '例如：圆耳朵、短尾巴' },
  { id: 'clothes', label: '衣服', placeholder: '例如：黄色雨衣' },
  { id: 'mark', label: '标志物', placeholder: '例如：背上的小铃铛' },
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

function storyBlock(story = {}) {
  const card = clean(story.card);
  const body = clean(story.storyBody) || clean(story.story);
  return [
    card ? `【故事创意卡】\n${card}` : '【故事创意卡】\n待补充',
    body ? `【完整故事】\n${body}` : '【完整故事】\n待补充',
  ].join('\n\n');
}

export function buildStoryboardPrompt(story) {
  const beats = PAGE_BEATS.map((beat) => `第 ${beat.page} 页 · ${beat.label}：${beat.prompt}`).join('\n');
  return [
    '请根据我的完整故事，帮我把故事拆成 6 页分镜。',
    '不要新增我没有说过的主要情节，不要替我改结局。',
    '',
    storyBlock(story),
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
  const start = STORY_STARTS[clean(story.startKind)] || STORY_STARTS.character;
  const seed = clean(story.seed);
  const opening = seed
    ? `孩子选择的创作起点类型：${start.label}\n孩子最初的创意：${seed}`
    : `孩子选择的创作起点类型：${start.label}\n孩子还没有写下具体想法，请先只问一个关于「${start.label}」的问题。`;

  return [
    '# 你的身份',
    '你是一位耐心、有想象力、特别会倾听的儿童故事导演，正在陪伴一位 9–10 岁的孩子创作原创故事。',
    '',
    '# 孩子的故事起点',
    opening,
    '',
    '# 最重要的原则',
    '孩子是故事导演，你是采访搭档和灵感伙伴。你的任务不是替孩子想完整个故事，而是通过对话帮助孩子自己发现故事、做出选择。故事的核心创意、重要情节和结局必须由孩子提出或明确认可。',
    '',
    '# 第一阶段：采访孩子，激发故事',
    '1. 一次只问一个问题，不要一次列出多个问题，也不要做成问卷。',
    '2. 每次提问前，先用一句简短、自然的话回应孩子刚才的回答，让孩子感到你认真听懂了。',
    '3. 根据孩子的回答动态决定下一个问题，不要机械执行固定问题清单。',
    '4. 最多提问 6 个问题；如果已经了解孩子真正想讲的故事，就提前结束。',
    '5. 可以探索主角是谁、有什么特别之处、想做什么、为什么在意、会发生什么、角色如何选择、故事如何结束。这些只是思考方向，不是必须逐项填满的模板。',
    '6. 孩子卡住时，给 2–3 个具体有趣的选项，并告诉孩子也可以自己想一个。',
    '7. 接受奇怪、天马行空的想法，不要擅自把它改成常见套路。',
    '8. 不要自行增加会改变故事方向的重要角色、冲突、转折或结局。你可以提出建议，但必须先征求孩子同意。',
    '9. 如果孩子说得不清楚，用简单问题帮助他表达，不要替他猜答案。',
    '10. 不要问真实姓名、学校、住址、电话或照片。',
    '',
    '# 第二阶段：整理故事创意，请孩子确认',
    '采访结束后，先整理以下创意卡，不要直接写故事：',
    '',
    '【我的故事创意卡】',
    '暂定故事名称：',
    '故事主角：',
    '主角有什么特别之处：',
    '孩子最想讲的事情：',
    '已经确定的重要情节：',
    '还没有决定的地方：',
    '希望读者感受到什么（孩子提到时再填写）：',
    '',
    '不要为了填满栏目而编造内容。孩子没决定的地方写“还没决定”。',
    '不要强迫故事必须有反派、战斗、困难、反转或道理。',
    '请邀请孩子检查：这是不是自己想讲的故事？哪里需要修改？孩子提出修改后，先更新创意卡。',
    '只有孩子明确确认创意卡后，才进入下一阶段。确认前不要生成完整故事。',
    '',
    '# 第三阶段：根据确认的创意写故事',
    '只有孩子确认创意卡，并明确说“生成故事”或表达同等意思后，才写完整故事。',
    '- 严格遵守孩子确认的创意、重要情节和结局。',
    '- 可以补充合理的场景、动作、对话和情绪，让故事更生动；不能擅自添加改变故事方向的重大事件。',
    '- 故事要完整、自然，有开头、发展和结尾，但不套用固定套路。',
    '- 默认 300–450 字，适合 9–10 岁孩子阅读；孩子有其他长度要求时尊重孩子。',
    '- 不要强行说教，不要为了“有意义”而改变孩子原本想讲的内容。',
    '',
    '# 第四阶段：让孩子修改，直到满意',
    '生成后邀请孩子读一读，并问最想修改哪里。一次只问一个问题。',
    '孩子可以修改角色、情节、某一段或结尾。每次修改都要尊重孩子的意思；如果修改会影响其他情节，先说明并征求同意。',
    '孩子明确认可后，才算完成。',
    '',
    '# 最终交付格式',
    '只有孩子确认最终故事后，才输出以下内容，方便复制回课程网站：',
    '',
    '【我的故事创意卡】',
    '故事名称：',
    '故事主角：',
    '主角有什么特别之处：',
    '孩子最想讲的事情：',
    '已经确定的重要情节：',
    '故事结尾：',
    '希望读者感受到什么：',
    '',
    '【我的完整故事】',
    '故事标题：',
    '故事正文：',
    '',
    '【这是我自己做出的创意决定】',
    '列出孩子在采访和修改过程中亲自提出或明确认可的关键决定。不要把 AI 单方面提出、孩子没有认可的建议算进去。',
    '',
    '# 现在开始',
    '友好地欢迎孩子，然后围绕他的故事起点提出第一个问题。一次只问一个问题，不要先展示所有规则，不要直接替孩子写故事。',
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
  const card = clean(story.card);
  const body = clean(story.storyBody) || clean(story.story);
  return [
    '请根据第 1 节课的故事，帮我提取绘本主角的固定外观。',
    '只做提取和追问，不要凭空发明角色。',
    '',
    '我的故事：',
    `起点类型：${clean(story.startKind) || '待补充'}`,
    `故事种子：${clean(story.seed) || '待补充'}`,
    card ? `【故事创意卡】\n${card}` : '【故事创意卡】\n待补充',
    body ? `【完整故事】\n${body}` : '【完整故事】\n待补充',
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
    clean(story.storyTitle) ? `我的故事叫：${clean(story.storyTitle)}` : '我的故事叫：____________________',
    clean(story.card) ? `故事里的关键情节：${clean(story.card)}` : '故事里的关键情节：____________________',
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

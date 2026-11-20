export const QUIZ_COURSE = {
  overview: {
    eyebrow: 'project 003 / quiz challenge',
    title: 'AI 趣味知识挑战赛',
    lead: '两节课，把好奇心变成一场真正能玩的挑战赛。第 1 节先当较真的出题官，做出 10 道查过证据的题；第 2 节再把题库交给 AI 程序员，设计并测试自己的网页游戏。',
    status: '两节课 · 10 道核验题 · 一局 5 题',
    boundary: '这一页不会替你保存内容。题目、提示词和游戏设计都只在当前浏览器里，下课前请把整理好的文件带走。',
    lessons: [
      {
        id: '01',
        label: '第 3 次课',
        title: '我是出题官',
        meta: '10 道核验题',
        description: '选一个聚焦主题，让 AI 生成 10 道初稿；再用权威资料逐题查证，只把盖上「正确 · 准予通过」印章的题收入题库。',
        action: '进入出题官工作台',
        href: 'lab/003-quiz-game/lesson-1/',
        variant: 'bank',
      },
      {
        id: '02',
        label: '第 4 次课',
        title: '我是游戏设计师',
        meta: '一局 5 题 · 满分 100',
        description: '导入第 1 节整理好的题库，设计首页、答题页和结果页；生成给 AI 程序员的任务单，再按清单测试、修 Bug、做 1 分钟发布。',
        action: '进入游戏设计工作台',
        href: 'lab/003-quiz-game/lesson-2/',
        variant: 'game',
      },
    ],
    flow: [
      { step: '01', title: '灵感选题', detail: '从真正好奇的领域里挑一个足够聚焦的主题。' },
      { step: '02', title: 'AI 出初稿', detail: '用清晰指令请 AI 生成 10 道单选题。' },
      { step: '03', title: '事实核验', detail: '打开权威资料，逐题找出支持答案的证据。' },
      { step: '04', title: '游戏制作', detail: '把题库交给 AI，做出能抽题、能计分的网页。' },
    ],
  },
  lessonOne: {
    label: '第 3 次课',
    eyebrow: 'lesson 01 / question detective',
    title: '我是出题官',
    lead: '不是把 AI 给的题直接搬进游戏，而是像一个较真的出题官：选主题、出初稿、查证据、盖印章，最后做出 10 道经得起追问的好题。',
    notes: ['两节课中的第 1 节', '目标：10 道核验题', 'AI 初稿必须查证', '下课前整理题库文件'],
    missions: [
      { step: '01', title: '选主题', detail: '越聚焦越好玩。' },
      { step: '02', title: '指挥 AI', detail: '用模板生成 10 道初稿。' },
      { step: '03', title: '查证据', detail: '为每个答案找权威出处。' },
      { step: '04', title: '盖印章', detail: '只有通过的题才进游戏。' },
    ],
    warmup: {
      title: '热身：章鱼到底有几颗心脏？',
      lead: '先凭直觉选一个答案，不查手机、不问 AI。10 秒钟，看看你的科学直觉准不准。',
      options: [
        { key: 'A', text: '只有 1 颗' },
        { key: 'B', text: '拥有 2 颗' },
        { key: 'C', text: '拥有 3 颗' },
        { key: 'D', text: '夸张的 4 颗' },
      ],
      answer: 'C',
      explanation: '章鱼有 3 颗心脏：1 颗主心脏把血液送往全身，2 颗鳃心脏专门帮助鳃部呼吸。有趣的问题，会让人忍不住继续追问。',
    },
    standards: [
      { title: '有趣', detail: '激发好奇心，让人忍不住想知道答案。' },
      { title: '准确', detail: '有据可查，能找到权威可靠的资料支持。' },
      { title: '清晰', detail: '一读就懂，题干简洁，没有歧义和废话。' },
      { title: '唯一', detail: '4 个选项里只有一个真正正确的答案。' },
      { title: '有收获', detail: '答完哪怕答错了，也能学到一条新知识。' },
    ],
    risks: [
      { title: '记错事实', detail: '把时间、数字或地理信息记混。' },
      { title: '张冠李戴', detail: '把一位科学家的发现安到另一个人头上。' },
      { title: '编造解释', detail: '遇到冷门知识时，编出一个听起来很像真的答案。' },
    ],
    verifySteps: [
      { title: '锁定关键事实', detail: '这道题里最核心、最需要确认的数据或事实是什么？' },
      { title: '搜寻权威铁证', detail: '打开权威网页看原文，不要只看搜索摘要。' },
      { title: '科学下达裁决', detail: '权威资料支持 AI 的答案吗？冲突时以真实资料为准。' },
    ],
    verifyRecord: [
      '题目内容：要核验的具体问题',
      'AI 给的答案：选项与解释',
      '查证来源：网站、书名或机构名',
      '支撑证据：摘录 1–2 句权威原文',
      '核验结论：正确 / 部分正确 / 错误 / 存疑',
      '优化改动：最终定稿题目',
    ],
    publishQuestions: [
      '我的挑战赛主题是什么？为什么选这个领域？',
      '我最自豪的一道题是哪题？它藏着什么冷知识？',
      '生成过程中，我抓到了 AI 的什么小糊涂？',
      '我是用什么关键词、在哪个网站找到终极证据的？',
    ],
  },
  lessonTwo: {
    label: '第 4 次课',
    eyebrow: 'lesson 02 / game designer',
    title: '我是游戏设计师',
    lead: '先看懂一个游戏怎么开始、怎么答题、怎么重来；再把核验题库交给 AI 程序员，做出首页、答题页、结果页，最后用测试清单把它打磨成真正能玩的作品。',
    notes: ['先导入整理好的题库', '一局随机 5 题', '每题 20 分，满分 100', '下课前导出 quiz-project-v2.json'],
    journey: [
      { title: '起点站', detail: '打开首页，看到主题和【开始挑战】。' },
      { title: '转盘站', detail: '从 10 道题库里随机抽出 5 道。' },
      { title: '挑战站', detail: '选答案，立即看到对错和解释。' },
      { title: '终点站', detail: '看总分和评价，再玩一次重新开局。' },
    ],
    webRoles: [
      { title: 'HTML', role: '网页的骨架', detail: '摆好标题、文字和按钮。' },
      { title: 'CSS', role: '网页的衣服', detail: '决定颜色、间距和按钮形状。' },
      { title: 'JavaScript', role: '网页的大脑', detail: '负责抽题、判分和重新开始。' },
    ],
    bugSteps: [
      { step: '01', title: '发现 Bug', detail: '定位哪个按钮或哪一步出错了。' },
      { step: '02', title: '描述现象', detail: '说清楚你点了什么、看到了什么。' },
      { step: '03', title: '协作修改', detail: '让 AI 只改出问题的部分。' },
      { step: '04', title: '再次测试', detail: '打开新文件，把同一套动作重跑一遍。' },
    ],
    publishQuestions: [
      '游戏名字与知识主题：我的游戏叫《…》，考考大家对…的了解。',
      '我最喜欢的一个设计：抽题规则、解释弹窗或结果页。',
      '测试时揪出的 Bug：一开始哪里不对，后来怎么修好的。',
    ],
    finishLine: 'AI 可以帮我们写出代码，但真正决定作品价值的，是我们提出什么问题、做出什么判断，以及怎样坚持改进它。',
  },
};

export function courseHref(baseUrl, href) {
  return `${baseUrl}${href}`;
}

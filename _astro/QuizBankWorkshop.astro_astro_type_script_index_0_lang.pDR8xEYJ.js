import{r as e}from"./ai-planet-builder.DuySYeDi.js";import{C as t,E as n,S as r,T as i,_ as a,a as o,b as s,c,f as l,h as u,i as d,l as f,m as p,p as m,t as h,v as g,w as _,x as v}from"./quiz-workspace.Bs6cboBB.js";var y=`你是一名专业的题库数据整理助手。
我会提供一组已经生成好的知识问答题目，请你将这些题目整理成两个文件：
Markdown 文件（.md）：方便人类和AI阅读、修改和扩充。
JSON 文件（.json）：方便计算机程序读取，未来可以用于制作知识问答游戏。
一、基本要求
完整保留我提供的所有题目。
不得擅自修改题目、选项、正确答案和答案解释。
不得删除任何题目。
不得自行增加未经提供的题目。
如果发现题目缺少信息或存在格式问题，请标记出来，不要自行编造。
两个文件中的题目数量、题目内容和正确答案必须完全一致。
二、Markdown文件格式要求
文件名称：主题名称.md
按照以下结构整理：
主题名称
题库基本信息
题库名称
题库ID
知识分类
适合年龄
题目数量
创建日期
版本号
题目列表
每道题按照以下格式整理：
第01题
题目ID：
题目：
选项：
A.
B.
C.
D.
正确答案：
答案解释：
核验关键词：
资料来源：如果原题没有提供，填写「待补充」
核验状态：如果原题没有提供，填写「待核验」
每道题独立成块，题目编号连续。
三、JSON文件格式要求
文件名称：主题名称.json
使用标准JSON格式，结构如下：
{
"bank_id": "ANIMAL-SLEEP-001",
"title": "主题名称",
"category": "知识分类",
"age_range": [9, 12],
"version": "1.0",
"question_count": 10,
"questions": [
{
"id": "ANIMAL-SLEEP-001-Q001",
"type": "single_choice",
"question": "题目内容",
"options": [
{"key": "A", "text": "选项A"},
{"key": "B", "text": "选项B"},
{"key": "C", "text": "选项C"},
{"key": "D", "text": "选项D"}
],
"answer": "B",
"explanation": "答案解释",
"keywords": ["关键词1", "关键词2"],
"source": [],
"verification": "pending"
}
]
}
注意：
每道题必须包含4个选项。
answer只能填写A、B、C、D。
verification使用pending、verified、disputed、deprecated四种状态之一。
不得在JSON中添加注释。
必须保证JSON语法正确，可以被程序直接解析。
所有题目都必须完整写入，不允许使用省略号代替内容。
四、文件生成与检查
完成整理后，请执行以下检查：
统计原始题目数量。
检查Markdown和JSON中的题目数量是否一致。
检查每道题是否有4个选项。
检查答案是否为A、B、C、D之一。
检查题目ID是否唯一。
检查题目内容、选项、答案和解释在两个文件中是否一致。
检查JSON是否符合标准语法。
五、最终交付要求
请直接生成两个可以下载的文件：
主题名称.md
主题名称.json
不要只在聊天窗口展示代码，也不要只给我复制保存的文本。
请将两个文件分别生成并提供下载链接。
如果文件生成失败，请明确告诉我原因，不要假装已经生成。
现在请等待我提供题目内容。`,b={overview:{eyebrow:`project 003 / quiz challenge`,title:`AI 趣味知识挑战赛`,lead:`两节课，把好奇心变成一场真正能玩的挑战赛。第 1 节先当较真的出题官，做出 10 道查过证据的题；第 2 节再把题库交给 AI 程序员，设计并测试自己的网页游戏。`,status:`两节课 · 10 道核验题 · 一局 5 题`,boundary:`这一页不会替你保存内容。所有题目、核验记录和游戏设计都只在当前浏览器里，下课前请导出工程文件带走。`,lessons:[{id:`01`,label:`第 3 次课`,title:`我是出题官`,meta:`10 道核验题`,description:`选一个聚焦主题，让 AI 生成 10 道初稿；再用权威资料逐题查证，只把盖上「正确 · 准予通过」印章的题收入题库。`,action:`进入出题官工作台`,href:`lab/003-quiz-game/lesson-1/`,variant:`bank`},{id:`02`,label:`第 4 次课`,title:`我是游戏设计师`,meta:`一局 5 题 · 满分 100`,description:`导入第 1 节的题库，设计首页、答题页和结果页；生成给 AI 程序员的任务单，再按清单测试、修 Bug、做 1 分钟发布。`,action:`进入游戏设计工作台`,href:`lab/003-quiz-game/lesson-2/`,variant:`game`}],flow:[{step:`01`,title:`灵感选题`,detail:`从真正好奇的领域里挑一个足够聚焦的主题。`},{step:`02`,title:`AI 出初稿`,detail:`用清晰指令请 AI 生成 10 道单选题。`},{step:`03`,title:`事实核验`,detail:`打开权威资料，逐题找出支持答案的证据。`},{step:`04`,title:`游戏制作`,detail:`把题库交给 AI，做出能抽题、能计分的网页。`}]},lessonOne:{label:`第 3 次课`,eyebrow:`lesson 01 / question detective`,title:`我是出题官`,lead:`不是把 AI 给的题直接搬进游戏，而是像一个较真的出题官：选主题、出初稿、查证据、盖印章，最后做出 10 道经得起追问的好题。`,notes:[`两节课中的第 1 节`,`目标：10 道核验题`,`AI 初稿必须查证`,`下课前导出 quiz-project-v1.json`],missions:[{step:`01`,title:`选主题`,detail:`越聚焦越好玩。`},{step:`02`,title:`指挥 AI`,detail:`用模板生成 10 道初稿。`},{step:`03`,title:`查证据`,detail:`为每个答案找权威出处。`},{step:`04`,title:`盖印章`,detail:`只有通过的题才进游戏。`}],warmup:{title:`热身：章鱼到底有几颗心脏？`,lead:`先凭直觉选一个答案，不查手机、不问 AI。10 秒钟，看看你的科学直觉准不准。`,options:[{key:`A`,text:`只有 1 颗`},{key:`B`,text:`拥有 2 颗`},{key:`C`,text:`拥有 3 颗`},{key:`D`,text:`夸张的 4 颗`}],answer:`C`,explanation:`章鱼有 3 颗心脏：1 颗主心脏把血液送往全身，2 颗鳃心脏专门帮助鳃部呼吸。有趣的问题，会让人忍不住继续追问。`},standards:[{title:`有趣`,detail:`激发好奇心，让人忍不住想知道答案。`},{title:`准确`,detail:`有据可查，能找到权威可靠的资料支持。`},{title:`清晰`,detail:`一读就懂，题干简洁，没有歧义和废话。`},{title:`唯一`,detail:`4 个选项里只有一个真正正确的答案。`},{title:`有收获`,detail:`答完哪怕答错了，也能学到一条新知识。`}],risks:[{title:`记错事实`,detail:`把时间、数字或地理信息记混。`},{title:`张冠李戴`,detail:`把一位科学家的发现安到另一个人头上。`},{title:`编造解释`,detail:`遇到冷门知识时，编出一个听起来很像真的答案。`}],verifySteps:[{title:`锁定关键事实`,detail:`这道题里最核心、最需要确认的数据或事实是什么？`},{title:`搜寻权威铁证`,detail:`打开权威网页看原文，不要只看搜索摘要。`},{title:`科学下达裁决`,detail:`权威资料支持 AI 的答案吗？冲突时以真实资料为准。`}],verifyRecord:[`题目内容：要核验的具体问题`,`AI 给的答案：选项与解释`,`查证来源：网站、书名或机构名`,`支撑证据：摘录 1–2 句权威原文`,`核验结论：正确 / 部分正确 / 错误 / 存疑`,`优化改动：最终定稿题目`],publishQuestions:[`我的挑战赛主题是什么？为什么选这个领域？`,`我最自豪的一道题是哪题？它藏着什么冷知识？`,`生成过程中，我抓到了 AI 的什么小糊涂？`,`我是用什么关键词、在哪个网站找到终极证据的？`]},lessonTwo:{label:`第 4 次课`,eyebrow:`lesson 02 / game designer`,title:`我是游戏设计师`,lead:`先看懂一个游戏怎么开始、怎么答题、怎么重来；再把核验题库交给 AI 程序员，做出首页、答题页、结果页，最后用测试清单把它打磨成真正能玩的作品。`,notes:[`先导入 quiz-project-v1.json`,`一局随机 5 题`,`每题 20 分，满分 100`,`下课前导出 quiz-project-v2.json`],journey:[{title:`起点站`,detail:`打开首页，看到主题和【开始挑战】。`},{title:`转盘站`,detail:`从 10 道题库里随机抽出 5 道。`},{title:`挑战站`,detail:`选答案，立即看到对错和解释。`},{title:`终点站`,detail:`看总分和评价，再玩一次重新开局。`}],webRoles:[{title:`HTML`,role:`网页的骨架`,detail:`摆好标题、文字和按钮。`},{title:`CSS`,role:`网页的衣服`,detail:`决定颜色、间距和按钮形状。`},{title:`JavaScript`,role:`网页的大脑`,detail:`负责抽题、判分和重新开始。`}],bugSteps:[{step:`01`,title:`发现 Bug`,detail:`定位哪个按钮或哪一步出错了。`},{step:`02`,title:`描述现象`,detail:`说清楚你点了什么、看到了什么。`},{step:`03`,title:`协作修改`,detail:`让 AI 只改出问题的部分。`},{step:`04`,title:`再次测试`,detail:`打开新文件，把同一套动作重跑一遍。`}],publishQuestions:[`游戏名字与知识主题：我的游戏叫《…》，考考大家对…的了解。`,`我最喜欢的一个设计：抽题规则、解释弹窗或结果页。`,`测试时揪出的 Bug：一开始哪里不对，后来怎么修好的。`],finishLine:`AI 可以帮我们写出代码，但真正决定作品价值的，是我们提出什么问题、做出什么判断，以及怎样坚持改进它。`}},x=document.querySelector(`[data-warmup]`)?.closest(`main`),S=(e,t,n)=>{let r=new Blob([e],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t,document.body.appendChild(a),a.click(),a.remove(),window.setTimeout(()=>URL.revokeObjectURL(i),1e3)};if(x){let C=b.lessonOne.warmup;x.querySelector(`[data-warmup-reveal]`)?.addEventListener(`click`,e=>{e.currentTarget.hidden=!0;let t=x.querySelector(`[data-warmup-answer]`);t&&(t.hidden=!1)}),x.querySelectorAll(`[data-warmup-option]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.warmupOption===C.answer;x.querySelectorAll(`[data-warmup-option]`).forEach(e=>{e.disabled=!0,e.dataset.state=e.dataset.warmupOption===C.answer?`correct`:`idle`}),e.dataset.state=t?`correct`:`wrong`;let n=x.querySelector(`[data-warmup-result]`);n&&(n.hidden=!1,n.dataset.tone=t?`ok`:`error`,n.textContent=t?`答对了！章鱼确实有 3 颗心脏。`:`这次没猜中。正确答案是 C：章鱼有 3 颗心脏。`);let r=x.querySelector(`[data-warmup-answer]`);r&&(r.hidden=!1)})});let w=x.querySelector(`[data-outline-output]`),T=x.querySelector(`[data-topic-custom]`),E=x.querySelector(`[data-topic-feedback]`),D=x.querySelector(`[data-draft-count]`),O=x.querySelector(`[data-verified-count]`),k=x.querySelector(`[data-ready-state]`),A=x.querySelector(`[data-bank-check]`),j=x.querySelector(`[data-bank-check-text]`),M=x.querySelector(`[data-bank-issues]`),N=x.querySelector(`[data-download-feedback]`),P=()=>{if(!w)return;let e=o();w.textContent=e.label?t(p.topic):g,E&&(E.textContent=e.label?`主题已锁定：`+e.label+`。现在可以生成专属出题提示词。`:`选一个方向，再把它改成一个具体的题目范围。`,E.dataset.tone=e.label?`ok`:`neutral`)},F=()=>{let e=n(p.questions);if(D&&(D.textContent=e.drafted+` / 10`),O&&(O.textContent=e.verified+` / 10`),k){let t=e.verified===10;k.dataset.ready=String(t),k.textContent=t?`10 道题已全部通过，可以导出`:`还不能进入游戏`}p.questions.forEach(e=>{let t=x.querySelector(`[data-question-card="`+e.id+`"]`);if(!t)return;let n=x.querySelector(`[data-question-summary="`+e.id+`"]`),r=x.querySelector(`[data-question-meta="`+e.id+`"]`),a=x.querySelector(`[data-question-pill="`+e.id+`"]`),o=i(e),s=!!(e.question||e.options.some(Boolean)||e.answer);t.dataset.verified=String(o),n&&(n.textContent=e.question?`第 `+e.id+` 题：`+e.question:`第 `+e.id+` 题：还没有题干`),r&&(r.textContent=o?`已通过核验 · `+e.source:s?`已开始填写 · 还没有通过核验`:`未开始`),a&&(a.dataset.state=o?`verified`:e.verdict&&e.verdict!==`correct`?`rejected`:s?`draft`:`empty`,a.textContent=o?`准予通过`:e.verdict===`correct`?`缺少证据`:e.verdict?`未通过`:s?`填写中`:`未开始`)}),I(e.verified===10)},I=e=>{x.querySelectorAll(`[data-download-md], [data-download-json], [data-export-project]`).forEach(t=>{t.disabled=!e}),N&&(N.textContent=e?`题库已通过检查，可以下载三个文件。`:`题库通过检查后，三个下载按钮才会启用。`)};x.querySelectorAll(`[data-topic-radio]`).forEach(e=>{e.addEventListener(`change`,()=>{e.checked&&(l(e.value),e.value===`custom`&&T&&T.focus())})}),T?.addEventListener(`input`,()=>{if(m(T.value),p.topic.id!==`custom`&&T.value.trim()){l(`custom`);let e=x.querySelector(`[data-topic-radio][value="custom"]`);e&&(e.checked=!0)}P()}),x.querySelectorAll(`[data-question]`).forEach(e=>{e.addEventListener(`input`,()=>{let t=Number(e.dataset.question);e.dataset.option===void 0?e.dataset.field&&c(t,e.dataset.field,e.value):f(t,Number(e.dataset.option),e.value)})}),x.querySelector(`[data-check-bank]`)?.addEventListener(`click`,()=>{let e=_(p.questions);A&&(A.dataset.ok=String(e.ok)),j&&(j.textContent=e.ok?`10 道题全部通过：题面、4 个选项、答案、解释、来源、证据和关键词都齐了。`:`还有 `+(10-e.approvedCount)+` 道题没有通过核验。先处理下面的问题，再导出。`),M&&(M.replaceChildren(),e.issues.length?(e.issues.forEach(e=>{let t=document.createElement(`li`);t.textContent=e,M.appendChild(t)}),M.hidden=!1):M.hidden=!0),I(e.ok)}),x.querySelector(`[data-copy-outline]`)?.addEventListener(`click`,async()=>{let t=await e(w?.textContent||``),n=x.querySelector(`[data-outline-feedback]`);n&&(n.textContent=t?`已复制。粘到课堂智能体里，等 10 道题全部生成。`:`复制没有成功，请手动选中文字。`,n.dataset.tone=t?`ok`:`error`)}),x.querySelector(`[data-download-md]`)?.addEventListener(`click`,()=>{o(),S(r({topic:p.topic,questions:p.questions}),s(p.topic)+`.md`,`text/markdown;charset=utf-8`)}),x.querySelector(`[data-download-json]`)?.addEventListener(`click`,()=>{let e=v({topic:p.topic,questions:p.questions});S(JSON.stringify(e,null,2)+`
`,s(p.topic)+`.json`,`application/json;charset=utf-8`)}),x.querySelector(`[data-export-project]`)?.addEventListener(`click`,()=>{let e=d(1);S(a(e),u(1),`application/json;charset=utf-8`),p.lastExportedVersion=1,N&&(N.textContent=`已保存 quiz-project-v1.json。下节课导入它继续。`),document.dispatchEvent(new CustomEvent(`quiz:exported`,{detail:e}))}),x.querySelector(`[data-copy-organizer]`)?.addEventListener(`click`,async()=>{let t=await e(y),n=x.querySelector(`[data-organizer-feedback]`);n&&(n.textContent=t?`已复制原文提示词。接下来把题目内容发给 AI。`:`复制没有成功，请手动选中整段文字。`,n.dataset.tone=t?`ok`:`error`)}),document.addEventListener(h,()=>{P(),F()}),P(),F()}
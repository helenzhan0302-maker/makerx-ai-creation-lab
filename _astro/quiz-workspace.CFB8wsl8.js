var e=`你是一名专业的题库数据整理助手。
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
现在请等待我提供题目内容。`,t=`任务：开发儿童趣味知识挑战赛网页,请读取我提供的 .md 和 .json 题库文件，基于现有题库开发一个完整、可运行的知识挑战赛网页，适合9—12岁小学生。,一、题库调用与出题规则,以 JSON 文件作为网页题库数据源，Markdown 文件用于查看和核对。,不要将题目写死在代码中，后续只需更新 JSON 就能扩充题库。,每轮随机抽取5道题，同一轮不能出现重复题目。,连续两轮题目重复率不超过50%，即两轮最多重复2道题，至少有3道新题。,使用题目唯一ID判断重复，记录上一轮题目ID。,如果题库数量不足以满足规则，给出提示，不要强行出题。,每题20分，答对得20分，答错不得分。,二、页面设计,网页包含三个页面，采用统一的视觉风格：,1. 首页,根据题库主题设计精美的全屏背景插画。,中央放置游戏标题、简短主题介绍和【开始挑战】按钮。,2. 答题页,延续主题背景，中央放置醒目的答题卡片。,顶部显示当前题号、总得分和答题进度条。,中间展示题目，下方展示4个大尺寸选项卡（A、B、C、D），采用2×2布局。,点击选项后立即判断正误，展示正确答案和题库中的知识解释。,设置【下一题】按钮，完成5题后进入结果页。,3. 结果页,展示总分、答对数量、答错数量和正确率。,根据成绩给出有趣、积极的成就评价。,展示每道题的答题情况。,设置【重新挑战】按钮，重新随机抽题并继续执行两轮重复率限制。,4. 返回主页功能,在答题页和结果页都添加醒目的【返回主页】按钮。,建议固定放在页面左上角或右上角，方便随时点击。,点击后立即返回首页。,返回主页不应清除已经记录的上一轮题目ID，确保再次开始挑战时仍遵守连续两轮重复率限制。,首页不需要显示返回主页按钮。,三、视觉风格,整体采用儿童绘本风格，结合科学探索和轻游戏化设计。,根据题库主题生成专属背景插画，不要使用单调的纯色背景。,答题区域采用白色或浅色圆角卡片，搭配柔和阴影。,选项使用活泼、协调的颜色，大尺寸设计，方便孩子点击。,加入适当的答题反馈动画和按钮交互效果。,页面要活泼可爱，但不要过度幼稚或花哨。,适配电脑、平板和手机。,四、开发与验收要求,请确保网页真正可以运行，并测试以下功能：,能正确读取 JSON 题库。,每轮随机抽取5道不重复的题目。,连续两轮最多重复2道题。,答题、判分、解释展示和页面切换正常。,重新挑战能够重新抽题。,所有非首页页面都能通过【返回主页】回到首页。,返回主页后，上一轮题目记录不会丢失。,题库数据与网页代码分离，方便未来扩充。,请直接完成网页开发，不要只提供设计方案或代码片段。`.split(`,`).join(`
`),n=[`A`,`B`,`C`,`D`],r=[{id:`space`,label:`宇宙太空`,hint:`黑洞、行星、宇航员生活`},{id:`animals`,label:`动物王国`,hint:`奇葩生存技能、冷血怪兽`},{id:`body`,label:`人体奥秘`,hint:`神奇大脑、骨骼、超感知觉`},{id:`science`,label:`科学魔法`,hint:`物理视错觉、神奇化学反应`},{id:`history`,label:`历史趣闻`,hint:`古文明冷知识、古代发明`},{id:`tech`,label:`现代科技`,hint:`机器人、人工智能、新能源`},{id:`custom`,label:`我自己想一个`,hint:`越聚焦越出彩`}],i=[`correct`,`partial`,`wrong`,`unsure`],a=[`设定身份：你是一位专业的知识挑战赛出题专家。`,`核心任务：请围绕【我的主题】，设计 10 道趣味单选题。`,`严格规则：`,`① 4 个选项，只有一个真正正确答案；`,`② 题目有趣、有挑战性，错误选项有迷惑性；`,`③ 附带通俗易懂的答案解释与核验关键词；`,`④ 不确定的信息明确标记，绝对不要凭空捏造！`,`输出格式：题号 ｜ 题目 ｜ 选项 ｜ 正确答案 ｜ 解释 ｜ 关键词`].join(`
`),o=[{id:`start`,title:`启动测试`,prompt:`点击开始按钮，能秒进答题页吗？`},{id:`amount`,title:`题量测试`,prompt:`每轮真的只抽 5 道题吗？不多也不少？`},{id:`unique`,title:`去重测试`,prompt:`同一轮挑战里，有没有出现一模一样的题目？`},{id:`explain`,title:`科普测试`,prompt:`点完选项后，有没有立刻显示正确答案与解释？`},{id:`reset`,title:`清零测试`,prompt:`点击再玩一次，分数是否从 0 分重新算起？`}];function s(e){return typeof e==`string`?e.trim():``}function c(e=1){return{id:e,question:``,options:[``,``,``,``],answer:``,explanation:``,keywords:``,source:``,evidence:``,verification:``,verdict:``,revision:``}}function l(){return Array.from({length:10},(e,t)=>c(t+1))}function u(e){let t=r.find(t=>t.id===e);return t?t.label:``}function d(e){let t=s(e?.id);return r.some(e=>e.id===t)?{id:t,label:t===`custom`?s(e?.custom):u(t),custom:t===`custom`?s(e?.custom):``}:{id:``,label:``,custom:``}}function f(e){let t=d(e).label||`待补充`;return a.replace(`【我的主题】`,`【`+t+`】`)}function p(e){let t=n.every((t,n)=>s(e?.options?.[n]));return[s(e?.question),t,n.includes(s(e?.answer)),s(e?.explanation)].filter(Boolean).length}function m(e){return p(e)===4}function h(e){return!!(m(e)&&s(e?.keywords)&&s(e?.source)&&(s(e?.evidence)||s(e?.verification)===`verified`)&&s(e?.verdict)===`correct`)}function g(e){return(Array.isArray(e)?e:[]).filter(h)}function _(e){return g(e).length===10}function v({topic:e,questions:t}){let r=d(e),i=g(t),a=b(e);return{bank_id:a,title:r.label||`待补充`,category:r.label||`待补充`,age_range:[9,12],version:`1.0`,question_count:i.length,questions:i.map(e=>({id:a+`-Q`+String(e.id).padStart(3,`0`),type:`single_choice`,question:s(e.question),options:n.map((t,n)=>({key:t,text:s(e.options[n])})),answer:s(e.answer),explanation:s(e.explanation),keywords:y(e.keywords),source:s(e.source)?[s(e.source)]:[],verification:s(e.verdict)===`correct`?`verified`:`pending`}))}}function y(e){return s(e).split(/[、,，;；\n]+/).map(e=>e.trim()).filter(Boolean)}function b(e){let t=d(e);return(t.id===`custom`?`CUSTOM`:t.id?t.id.toUpperCase():`QUIZ`)+`-001`}var x=[{id:`home`,title:`首页看门面`,items:[`醒目的游戏大标题`,`简短的主题背景介绍`,`超大醒目的【开始挑战】按钮`]},{id:`play`,title:`答题页玩互动`,items:[`第几题与当前得分栏`,`居中放大的科学题目`,`4 个大尺寸选项卡`,`【下一题】跳转按钮`]},{id:`result`,title:`结果页领成就`,items:[`通关大总分结算牌`,`答对题数统计`,`专属知识荣耀评价`,`【重新挑战】清零重来按钮`]}],S=[{min:100,title:`知识王者`,description:`五题全对，而且每一道都经得起核验。你已经能把好奇心变成一场真正好玩的挑战了。`},{min:80,title:`知识侦探`,description:`只差一点点满分。你已经能分辨清楚哪些题值得被相信，继续把错题查明白。`},{min:60,title:`挑战新手`,description:`你玩到了关键知识点。把答错的题再看一遍解释，下一轮会更有把握。`},{min:0,title:`再试一次`,description:`分数不是终点。先看看每道题的正确答案和解释，再来一轮。`}];function C(e){return S.find(t=>e>=t.min)||S[S.length-1]}function w(e){return(Array.isArray(e)?e:[]).map((e,t)=>({id:e.id||t+1,question:String(e.question||``),options:Array.isArray(e.options)?e.options.slice(0,4):[],answer:String(e.answer||`A`).toUpperCase(),explanation:String(e.explanation||``)}))}function T(e,t=Math.random){let n=[...e];for(let e=n.length-1;e>0;--e){let r=Math.floor(t()*(e+1));[n[e],n[r]]=[n[r],n[e]]}return n}function E(e){let t;try{t=JSON.parse(e)}catch{return{ok:!1,message:`这不是题库文件：内容无法被 JSON 解析。`}}if(!t||typeof t!=`object`)return{ok:!1,message:`这不是题库文件：没有找到题库对象。`};if(!Array.isArray(t.questions))return{ok:!1,message:`这不是题库文件：缺少 questions 列表。`};if(t.questions.length!==10)return{ok:!1,message:`题库需要正好 10 道核验题，当前读到 `+t.questions.length+` 道。`};for(let e=0;e<t.questions.length;e+=1){let n=t.questions[e],r=`第 `+(e+1)+` 题`;if(!n||typeof n.question!=`string`||!n.question.trim())return{ok:!1,message:r+`缺少题干。`};if(!Array.isArray(n.options)||n.options.length!==4)return{ok:!1,message:r+`不是 4 个选项。`};if(!n.options.every(e=>e&&typeof e.text==`string`&&e.text.trim()))return{ok:!1,message:r+`有一个选项是空的。`};if(![`A`,`B`,`C`,`D`].includes(String(n.answer||``).toUpperCase()))return{ok:!1,message:r+`的答案不是 A/B/C/D。`};if(typeof n.explanation!=`string`||!n.explanation.trim())return{ok:!1,message:r+`缺少答案解释。`};if(!Array.isArray(n.keywords)||!n.keywords.some(e=>String(e||``).trim()))return{ok:!1,message:r+`缺少核验关键词。`};if(!(Array.isArray(n.source)?n.source.map(e=>String(e||``).trim()).filter(Boolean).join(`、`):String(n.source||``).trim()))return{ok:!1,message:r+`缺少查证来源。`};if(n.verification!==`verified`)return{ok:!1,message:r+`还没有核验通过，不能进入游戏。`}}return{ok:!0,data:{title:String(t.title||`我的知识挑战赛`),bankId:String(t.bank_id||``),questions:w(t.questions)}}}function D({design:e,bank:t}){let n=A(e.title)||`我的知识挑战赛`,r=A(e.topic)||`待补充`,i=A(e.intro)||`待补充`,a=JSON.stringify(t,null,2);return[`你是一名专业的儿童互动网页开发助手。`,``,`请帮我制作一个可以直接双击打开的单文件 HTML 知识挑战赛。`,``,`# 我的游戏信息`,`游戏名字：`+n,`知识主题：`+r,`首页介绍：`+i,``,`# 必须实现的功能`,`1. 首页：显示游戏名字、主题介绍和【开始挑战】按钮。`,`2. 答题页：每轮从题库随机抽 5 题，同一轮不重复；显示第几题和当前得分。`,`3. 每题 4 个选项，点击后立即判分；每题 20 分，满分 100。`,`4. 答题后立即显示正确答案和答案解释，让玩家学到知识。`,`5. 做完 5 题显示总分、答对题数和评价，并提供【再玩一次】按钮。`,`6. 再玩一次时分数清零；下一轮优先抽上一轮没出现过的题。`,``,`# 技术铁律`,`生成完整 HTML，CSS 和 JavaScript 写在同一个文件里，所有按钮都必须有效。`,`不要引用外部图片、字体或 CDN；不要使用框架和重型依赖。`,`页面要适合 9–12 岁孩子，文字清楚、按钮够大、键盘也能操作。`,`不要改变下面题库中的题目、选项、正确答案和解释，不得增删题目。`,``,`# 题库 JSON（必须原样使用）`,a].join(`
`)}function O({phenomenon:e,expected:t,actual:n}){return[`请帮我修复一个网页游戏 Bug。不要重做整个游戏，只修改出问题的部分。`,``,`我看到的异常现象：`+(A(e)||`待补充`),`我原本期望：`+(A(t)||`待补充`),`实际发生了什么：`+(A(n)||`待补充`),``,`请先告诉我最可能的原因，再给我修改后的完整代码，并列出我该重新测试哪几个按钮。`].join(`
`)}function k({design:e,bank:t,checks:n,rounds:r,roadshow:i}){let a=n.filter(e=>e.checked).length;return[`# `+(A(e.title)||`我的知识挑战赛`),``,`## 游戏设计单`,`知识主题：`+(A(e.topic)||`待补充`),`首页介绍：`+(A(e.intro)||`待补充`),`题库：`+(t?.title||`待补充`)+`（`+(t?.questions?.length||0)+` 道）`,``,`## 三大页面`,...x.map(e=>`- `+e.title+`：`+e.items.join(`、`)),``,`## 测试清单`,`已完成 `+a+` / 5 项。`,...n.map(e=>`- [`+(e.checked?`x`:` `)+`] `+e.label),``,`## 两轮测试记录`,`第 1 轮抽到的题号：`+(A(r.firstIds)||`待补充`),`第 1 轮得分：`+(A(r.firstScore)||`待补充`),`第 2 轮抽到的题号：`+(A(r.secondIds)||`待补充`),`第 2 轮得分：`+(A(r.secondScore)||`待补充`),`发现的 Bug：`+(A(r.bugs)||`待补充`),``,`## 一分钟发布提纲`,`游戏名字与知识主题：`+(A(i.name)||`待补充`),`我最喜欢的一个设计：`+(A(i.favorite)||`待补充`),`测试时揪出的 Bug：`+(A(i.bug)||`待补充`),``].join(`
`)}function A(e){return typeof e==`string`?e.trim():``}var j=`003-quiz-game`;function M(e,t){let r=e||{};return{id:t+1,question:s(r.question),options:n.map((e,t)=>s(r.options?.[t])),answer:s(r.answer).toUpperCase(),explanation:s(r.explanation),keywords:s(r.keywords),source:s(r.source),evidence:s(r.evidence),verification:s(r.verification)===`verified`?`verified`:``,verdict:i.includes(s(r.verdict))?s(r.verdict):``,revision:s(r.revision)}}function N(e){let t=[`start`,`amount`,`unique`,`explain`,`reset`],n=Array.isArray(e)?e:[];return t.map(e=>({id:e,checked:!!n.find(t=>t?.id===e)?.checked}))}function P(e={}){return{firstIds:s(e.firstIds),firstScore:s(e.firstScore),secondIds:s(e.secondIds),secondScore:s(e.secondScore),bugs:s(e.bugs)}}function ee(e={}){return{name:s(e.name),favorite:s(e.favorite),bug:s(e.bug)}}function F(e={}){return{title:s(e.title),topic:s(e.topic),intro:s(e.intro)}}function I({topic:e,questions:t,design:n,checks:r,rounds:i,roadshow:a,version:o=1}){let s=Array.isArray(t)?t:[];return{schemaVersion:2,projectCode:j,exportedAt:new Date().toISOString(),version:o,topic:d(e),questions:Array.from({length:10},(e,t)=>M(s[t],t)),design:F(n),checks:N(r),rounds:P(i),roadshow:ee(a)}}function L(e){return`quiz-project-v`+e+`.json`}function R(e){return JSON.stringify(e,null,2)+`
`}function z(e){let t;try{t=JSON.parse(e)}catch{return{ok:!1,message:`这不是题库工程文件：内容无法被 JSON 解析。`}}if(!t||typeof t!=`object`||t.projectCode!==`003-quiz-game`)return{ok:!1,message:`这不是「AI 趣味知识挑战赛」的工程文件。`};if(!Number.isInteger(t.schemaVersion)||t.schemaVersion<1||t.schemaVersion>2)return{ok:!1,message:`工程文件版本过新：请用更新后的页面打开。`};if(!Array.isArray(t.questions)||t.questions.length!==10)return{ok:!1,message:`题库需要正好 10 道题，当前文件不是完整题库。`};let r=t.questions.map(e=>Number(e?.id));if(new Set(r).size!==10||r.some(e=>!Number.isInteger(e)||e<1||e>10))return{ok:!1,message:`题目编号必须连续且不重复。`};let i=Array.from({length:10},(e,n)=>M(t.questions[n],n));for(let e of i){if(!e.question)return{ok:!1,message:`第 `+e.id+` 题缺少题干。`};if(!e.options.every(Boolean))return{ok:!1,message:`第 `+e.id+` 题没有写满 4 个选项。`};if(!n.includes(e.answer))return{ok:!1,message:`第 `+e.id+` 题的答案不是 A/B/C/D。`};if(!e.explanation)return{ok:!1,message:`第 `+e.id+` 题缺少答案解释。`};if(!e.keywords)return{ok:!1,message:`第 `+e.id+` 题缺少核验关键词。`};if(!e.source)return{ok:!1,message:`第 `+e.id+` 题缺少查证来源。`};if(!e.evidence&&e.verification!==`verified`)return{ok:!1,message:`第 `+e.id+` 题缺少支撑证据或核验通过标记。`};if(e.verdict!==`correct`)return{ok:!1,message:`第 `+e.id+` 题还没有盖上「正确 · 准予通过」印章，不能进入游戏。`}}return{ok:!0,data:I({topic:t.topic,questions:i,design:t.design,checks:t.checks,rounds:t.rounds,roadshow:t.roadshow,version:Number(t.version)||1})}}function B(e){let t;try{t=JSON.parse(e)}catch{return{ok:!1,message:`这不是可读取的 JSON 文件：内容无法被解析。`}}if(t&&typeof t==`object`&&t.projectCode===`003-quiz-game`)return z(e);let n=E(e);if(!n.ok)return n;let r=s(n.data.title),i=Array.isArray(t.questions)?t.questions:[],a=n.data.questions.map((e,t)=>({id:t+1,question:s(e.question),options:i[t].options.map(e=>s(e?.text)),answer:s(e.answer).toUpperCase(),explanation:s(e.explanation),keywords:i[t].keywords.map(e=>s(e)).filter(Boolean).join(`、`),source:i[t].source.map(e=>s(e)).filter(Boolean).join(`、`),evidence:``,verification:`verified`,verdict:`correct`,revision:``}));return{ok:!0,data:I({topic:{id:`custom`,custom:r},questions:a,version:1})}}var V=`quiz:workspace-change`;function H(){return o.map(e=>({id:e.id,checked:!1}))}function U(){return{topic:{id:``,custom:``},questions:l(),design:{title:``,topic:``,intro:``},checks:H(),rounds:{firstIds:``,firstScore:``,secondIds:``,secondScore:``,bugs:``},roadshow:{name:``,favorite:``,bug:``},imported:!1,importedVersion:null,lastExportedVersion:null}}var W=U();function G(){typeof document<`u`&&typeof CustomEvent==`function`&&document.dispatchEvent(new CustomEvent(V,{detail:W}))}function K(e){W.topic={...W.topic,id:typeof e==`string`?e:``},G()}function q(e){W.topic={...W.topic,custom:typeof e==`string`?e:``},G()}function J(){return d(W.topic)}function Y(e){return W.topic={id:e.topic?.id||``,custom:e.topic?.custom||``},W.questions=e.questions.map(e=>({...e,options:[...e.options]})),W.design={...e.design},W.checks=e.checks.map(e=>({...e})),W.rounds={...e.rounds},W.roadshow={...e.roadshow},W.imported=!0,W.importedVersion=e.version,G(),W}function X(e,t){[`title`,`topic`,`intro`].includes(e)&&(W.design[e]=typeof t==`string`?t:``,G())}function Z(e,t){let n=W.checks.find(t=>t.id===e);n&&(n.checked=!!t,G())}function Q(e,t){[`firstIds`,`firstScore`,`secondIds`,`secondScore`,`bugs`].includes(e)&&(W.rounds[e]=typeof t==`string`?t:``,G())}function $(e,t){[`name`,`favorite`,`bug`].includes(e)&&(W.roadshow[e]=typeof t==`string`?t:``,G())}function te(){return _(W.questions)}function ne(e=1){return I({topic:W.topic,questions:W.questions,design:W.design,checks:W.checks,rounds:W.rounds,roadshow:W.roadshow,version:e})}export{o as C,t as D,e as E,a as S,f as T,k as _,J as a,T as b,$ as c,q as d,W as f,O as g,R as h,ne as i,Q as l,B as m,Y as n,Z as o,L as p,te as r,X as s,V as t,K as u,D as v,v as w,w as x,C as y};
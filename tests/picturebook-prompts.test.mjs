import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  PAGE_COUNT,
  CHARACTER_TRAITS,
  createStoryboard,
  storyboardCompletion,
  buildStoryboardPrompt,
  buildSocraticPrompt,
  buildReferencePrompt,
  buildPagePrompt,
  buildRevisionPrompt,
  buildRoadshowCard,
} from '../src/lib/picturebook-prompts.mjs';

const root = process.cwd();

test('page count is exactly six in one shared constant', () => {
  assert.equal(PAGE_COUNT, 6);
  const source = fs.readFileSync(path.join(root, 'src/lib/picturebook-prompts.mjs'), 'utf8');
  assert.match(source, /export const PAGE_COUNT = 6/);
});

test('character traits follow the four course-fixed features', () => {
  assert.deepEqual(CHARACTER_TRAITS.map((trait) => trait.id), ['color', 'shape', 'clothes', 'mark']);
});

test('storyboard starts with six empty pages in order', () => {
  const pages = createStoryboard();
  assert.equal(pages.length, 6);
  assert.deepEqual(pages.map((page) => page.page), [1, 2, 3, 4, 5, 6]);
  assert.ok(pages.every((page) => page.scene === '' && page.action === '' && page.emotion === ''));
  assert.equal(storyboardCompletion(pages), 0);
});

test('storyboard completion needs all three fields on a page', () => {
  const pages = createStoryboard();
  pages[0].scene = '雨中的车站';
  pages[0].action = '主角举起伞';
  assert.equal(storyboardCompletion(pages), 0);
  pages[0].emotion = '紧张';
  assert.equal(storyboardCompletion(pages), 1);
});

test('storyboard prompt lists pending story elements instead of inventing them', () => {
  const prompt = buildStoryboardPrompt({
    hero: '',
    goal: '找到丢失的星星',
    obstacle: '',
    action: '',
    result: '',
  });
  assert.match(prompt, /主角：待补充/);
  assert.match(prompt, /困难：待补充/);
  assert.match(prompt, /不要自己补/);
});

test('socratic prompt runs three phases: ask, write, let the child check', () => {
  const prompt = buildSocraticPrompt({
    story: { hero: '一只怕黑的小猫', goal: '', obstacle: '', action: '', result: '' },
  });
  assert.match(prompt, /不是代写者/);
  assert.match(prompt, /第一阶段：把缺口问清楚/);
  assert.match(prompt, /第二阶段：写出完整故事/);
  assert.match(prompt, /第三阶段：请我检查并修改/);
  assert.match(prompt, /每次只问我一个问题/);
  assert.match(prompt, /不要一次给我一整套问卷/);
  assert.match(prompt, /只能使用我说过的内容/);
  assert.match(prompt, /这是你想讲的故事吗/);
});

test('socratic prompt carries the filled story card and names the missing slots', () => {
  const prompt = buildSocraticPrompt({
    story: { hero: '小猫', goal: '找回星星', obstacle: '天黑', action: '它决定提灯出门', result: '' },
  });
  assert.match(prompt, /主角：小猫/);
  assert.match(prompt, /目标：找回星星/);
  assert.match(prompt, /困难：天黑/);
  assert.match(prompt, /行动：它决定提灯出门/);
  assert.match(prompt, /还缺：结果/);
  assert.match(prompt, /从第一个缺失的格子开始/);
});

test('socratic prompt switches to confirm-then-write when the card is full', () => {
  const prompt = buildSocraticPrompt({
    story: { hero: '小猫', goal: '找星星', obstacle: '天黑', action: '提灯出门', result: '星星回家' },
  });
  assert.match(prompt, /故事卡已经填满/);
  assert.match(prompt, /先复述一遍确认/);
  assert.doesNotMatch(prompt, /还缺：/);
});

test('page prompt contains all four character traits and three style settings', () => {
  const prompt = buildPagePrompt({
    page: { page: 3, scene: '雨中的车站', action: '主角举起伞', emotion: '紧张' },
    visual: { ratio: '竖版 3:4', artStyle: '治愈水彩', palette: '冷色' },
    traits: { color: '深蓝色', shape: '圆耳朵', clothes: '黄色雨衣', mark: '背上的小铃铛' },
  });
  assert.match(prompt, /第 3 页/);
  assert.match(prompt, /深蓝色/);
  assert.match(prompt, /圆耳朵/);
  assert.match(prompt, /黄色雨衣/);
  assert.match(prompt, /小铃铛/);
  assert.match(prompt, /竖版 3:4/);
  assert.match(prompt, /治愈水彩/);
  assert.match(prompt, /冷色/);
});

test('reference prompt asks for the character only, not a full page', () => {
  const prompt = buildReferencePrompt({
    artStyle: '可爱卡通',
    palette: '暖色',
    traits: { color: '橘色', shape: '短尾巴', clothes: '背带裤', mark: '额头上的星星' },
  });
  assert.match(prompt, /只生成主角/);
  assert.match(prompt, /不要生成整页绘本/);
});

test('revision prompt only changes one page and keeps character traits', () => {
  const prompt = buildRevisionPrompt({ pageNumber: 4, change: '把雨改小', keep: '角色动作和衣服' });
  assert.match(prompt, /只修改这一页/);
  assert.match(prompt, /不要重做整本绘本/);
  assert.match(prompt, /不要改变角色的固定特征/);
});

test('roadshow card answers the three lesson questions', () => {
  const pages = createStoryboard();
  pages[2] = { page: 3, scene: '主角找到星星', action: '伸手接住', emotion: '开心' };
  const card = buildRoadshowCard({
    story: { hero: '一只小猫', goal: '找回星星' },
    storyboard: pages,
  });
  assert.match(card, /我的故事讲什么/);
  assert.match(card, /我最满意的一页/);
  assert.match(card, /我最想继续改进/);
  assert.match(card, /我最满意第 3 页/);
  assert.match(card, /我看懂了/);
  assert.match(card, /我有一个建议/);
});

test('prompts never include child identity fields', () => {
  const source = fs.readFileSync(path.join(root, 'src/lib/picturebook-prompts.mjs'), 'utf8');
  assert.doesNotMatch(source, /name\s*:|school\s*:|address\s*:|phone\s*:|email\s*:/i);
  assert.match(source, /不要问我真实姓名、学校、住址、电话或照片/);
});

test('lesson one page includes story card, storyboard and save controls', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/lab/002-picturebook/lesson-1.astro'), 'utf8');
  const storyCard = fs.readFileSync(path.join(root, 'src/components/StoryCardBuilder.astro'), 'utf8');
  const storyboard = fs.readFileSync(path.join(root, 'src/components/StoryboardBuilder.astro'), 'utf8');

  assert.match(page, /StoryCardBuilder/);
  assert.match(page, /StoryboardBuilder/);
  assert.match(page, /ProjectFileBar/);
  assert.match(storyCard, /data-story-card/);
  assert.match(storyboard, /data-storyboard/);
  assert.match(storyboard, /PAGE_COUNT/);
  assert.match(storyboard, /data-storyboard-page/);
  assert.match(page, /pb-save-panel/, 'lesson 1 keeps a save panel');
  assert.match(page, /pb-save-panel[\s\S]*ProjectFileBar/, 'save panel wraps the file bar');
  assert.doesNotMatch(page, /pb-save-dock/, 'save entry was moved out of the top of the page');
  assert.doesNotMatch(page, /pb-story-check|data-review/, 'the story check block was removed');
  assert.match(storyCard, /data-story-inspiration/, 'hero question offers character ideas');
  const storyData = fs.readFileSync(path.join(root, 'src/lib/picturebook-story.mjs'), 'utf8');
  assert.match(storyData, /会发光的小恐龙/);
  assert.match(storyData, /影子不听话的小猫/);
  assert.match(storyData, /听见植物说话的女孩/);
  assert.doesNotMatch(page, /pb-boundary|pb-stack-end|保存方式说明/, 'lesson 1 no longer repeats the classroom save speech');
  assert.doesNotMatch(page, /两个周六中的第 1 节|不填写姓名|不上传照片/, 'lesson 1 chips were removed by user request');
  assert.doesNotMatch(storyCard, /生成追问提示词|复制追问提示词/, 'prompt buttons use the shorter labels');
  assert.match(storyCard, /生成提示词/);
  assert.match(storyCard, /复制提示词/);
});

test('course hub omits the chip strip and the long save notice', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/lab/002-picturebook/index.astro'), 'utf8');
  const home = fs.readFileSync(path.join(root, 'src/pages/index.astro'), 'utf8');
  assert.doesNotMatch(page, /project-intro-notes|pb-boundary|两节课之间，网站不保存你的内容/);
  assert.doesNotMatch(home, /静态原型 · 持续更新/);
});

test('lesson two imports a project file before showing the studio', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/lab/002-picturebook/lesson-2.astro'), 'utf8');
  const studio = fs.readFileSync(path.join(root, 'src/components/PicturebookStudio.astro'), 'utf8');
  const fileBar = fs.readFileSync(path.join(root, 'src/components/ProjectFileBar.astro'), 'utf8');

  assert.match(page, /ProjectFileBar/);
  assert.match(page, /PicturebookStudio/);
  assert.match(studio, /data-picturebook-studio/);
  assert.match(fileBar, /type="file"/);
  assert.match(fileBar, /accept="\.json,application\/json"/);
  assert.match(studio, /data-import-gate/);
});

test('studio exposes all four checks and three roadshow questions', () => {
  const studio = fs.readFileSync(path.join(root, 'src/components/PicturebookStudio.astro'), 'utf8');
  assert.match(studio, /故事读得懂/);
  assert.match(studio, /页序清楚/);
  assert.match(studio, /图片符合情节/);
  assert.match(studio, /主角基本统一/);
  assert.match(studio, /我的故事讲什么/);
  assert.match(studio, /我最满意的一页/);
  assert.match(studio, /我最想继续改进/);
});

test('lesson pages never persist to browser storage or call the network', () => {
  const files = [
    'src/components/StoryCardBuilder.astro',
    'src/components/StoryboardBuilder.astro',
    'src/components/PicturebookStudio.astro',
    'src/components/ProjectFileBar.astro',
    'src/lib/picturebook-workspace.mjs',
    'src/pages/lab/002-picturebook/lesson-1.astro',
    'src/pages/lab/002-picturebook/lesson-2.astro',
  ];
  for (const file of files) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|fetch\(/);
  }
});

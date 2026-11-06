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
  buildTraitExtractionPrompt,
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
  assert.match(prompt, /不是代写机器/);
  assert.match(prompt, /第一阶段：一次只问一个问题，把故事问清楚/);
  assert.match(prompt, /第二阶段：把我说过的整理成完整故事/);
  assert.match(prompt, /第三阶段：请我检查并修改/);
  assert.match(prompt, /每次只问一个问题/);
  assert.match(prompt, /不要提前给我一整套问卷/);
  assert.match(prompt, /只能使用我说过的内容/);
  assert.match(prompt, /这是你想讲的故事吗/);
  assert.match(prompt, /最多问 6 个问题/);
  assert.match(prompt, /信息够了就立刻停止/);
  assert.doesNotMatch(prompt, /颜色 \/ 发型或外形 \/ 衣服 \/ 标志物/, 'trait extraction belongs to lesson 2');
});

test('socratic prompt carries the seed and the filled story card', () => {
  const prompt = buildSocraticPrompt({
    story: {
      startKind: '一个角色',
      seed: '一只总把袜子藏起来的小猫',
      hero: '小猫',
      goal: '找回星星',
      obstacle: '天黑',
      action: '它决定提灯出门',
      result: '',
    },
  });
  assert.match(prompt, /我的故事从「一个角色」开始/);
  assert.match(prompt, /一只总把袜子藏起来的小猫/);
  assert.match(prompt, /主角：小猫/);
  assert.match(prompt, /目标：找回星星/);
  assert.match(prompt, /困难：天黑/);
  assert.match(prompt, /行动：它决定提灯出门/);
  assert.match(prompt, /我最不确定的是：结果/);
});

test('socratic prompt asks the child to choose a starting kind when nothing is written', () => {
  const prompt = buildSocraticPrompt({
    story: { hero: '', goal: '', obstacle: '', action: '', result: '' },
  });
  assert.match(prompt, /一个角色、一个愿望，还是一件奇怪的事/);
  assert.match(prompt, /不要写故事/);
});

test('socratic prompt keeps the chosen start kind when the seed is still empty', () => {
  const prompt = buildSocraticPrompt({
    story: { startKind: '一件奇怪的事', seed: '', hero: '', goal: '', obstacle: '', action: '', result: '' },
  });
  assert.match(prompt, /我的故事想从「一件奇怪的事」开始/);
  assert.match(prompt, /请先只问我一个关于「一件奇怪的事」的问题/);
  assert.doesNotMatch(prompt, /你的故事想从一个角色、一个愿望，还是一件奇怪的事开始/);
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

test('trait extraction only uses the story and marks unknown items as pending', () => {
  const prompt = buildTraitExtractionPrompt({
    story: {
      startKind: '一个角色',
      seed: '一只会发光的小恐龙',
      hero: '一只会发光的小恐龙',
      goal: '想找到自己的影子',
      obstacle: '',
      action: '',
      result: '',
    },
  });
  assert.match(prompt, /一只会发光的小恐龙/);
  assert.match(prompt, /起点类型：一个角色/);
  assert.match(prompt, /故事种子：一只会发光的小恐龙/);
  assert.match(prompt, /颜色：/);
  assert.match(prompt, /待补充/);
  assert.match(prompt, /不要凭空发明角色/);
  assert.match(prompt, /不要编造真实人物的长相/);
});

test('storyboard prompt assigns one narrative task to each of the six pages', () => {
  const prompt = buildStoryboardPrompt({ hero: '小猫', goal: '找星星', obstacle: '天黑', action: '提灯', result: '找到' });
  assert.match(prompt, /第 1 页 · 认识主角/);
  assert.match(prompt, /第 3 页 · 困难出现/);
  assert.match(prompt, /第 6 页 · 结果与结尾/);
  assert.match(prompt, /这一页的叙事任务/);
});

test('lesson two has a separate prompt to extract character traits from the story', () => {
  const studio = fs.readFileSync(path.join(root, 'src/components/PicturebookStudio.astro'), 'utf8');
  assert.match(studio, /data-generate-traits/);
  assert.match(studio, /buildTraitExtractionPrompt/);
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
  assert.match(storyCard, /data-story-inspiration/, 'seed panel offers starting ideas');
  assert.match(storyCard, /data-story-seed/, 'seed field is the first input');
  const promptData = fs.readFileSync(path.join(root, 'src/lib/picturebook-prompts.mjs'), 'utf8');
  assert.match(promptData, /会发光的小恐龙/);
  assert.match(promptData, /影子不听话的小猫/);
  assert.match(promptData, /听见植物说话的女孩/);
  assert.doesNotMatch(page, /pb-boundary|pb-stack-end|保存方式说明/, 'lesson 1 no longer repeats the classroom save speech');
  assert.doesNotMatch(page, /两个周六中的第 1 节|不填写姓名|不上传照片/, 'lesson 1 chips were removed by user request');
  assert.doesNotMatch(storyCard, /生成追问提示词|复制追问提示词/, 'prompt buttons use the shorter labels');
  assert.match(storyCard, /生成提示词/);
  assert.match(storyCard, /复制提示词/);
});

test('lesson steps are numbered continuously on each page', () => {
  const lessonOne = ['src/components/StoryCardBuilder.astro', 'src/components/StoryboardBuilder.astro']
    .map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
    .join('\n');
  const lessonTwo = fs.readFileSync(path.join(root, 'src/components/PicturebookStudio.astro'), 'utf8');
  const lessonOneSteps = [...lessonOne.matchAll(/step (\d{2})\b/g)].map((match) => match[1]);
  const lessonTwoSteps = [...lessonTwo.matchAll(/step (\d{2})\b/g)].map((match) => match[1]);
  assert.deepEqual(lessonOneSteps, ['01', '02', '03', '04']);
  assert.deepEqual(lessonTwoSteps, ['01', '02', '03', '04', '05']);
});

test('lesson two save copy does not imply the project file contains images', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/lab/002-picturebook/lesson-2.astro'), 'utf8');
  assert.match(page, /不包含图片本身/);
  assert.match(page, /6 张插图和绘本文件请另外保存/);
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

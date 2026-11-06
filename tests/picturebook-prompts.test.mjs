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

test('storyboard prompt carries the confirmed story instead of inventing it', () => {
  const prompt = buildStoryboardPrompt({ card: '', storyBody: '' });
  assert.match(prompt, /【故事创意卡】\n待补充/);
  assert.match(prompt, /【完整故事】\n待补充/);
  assert.match(prompt, /不要新增我没有说过的主要情节/);
});

test('socratic prompt runs four phases: ask, confirm card, write, revise', () => {
  const prompt = buildSocraticPrompt({
    story: { startKind: 'character', seed: '一只怕黑的小猫' },
  });
  assert.match(prompt, /采访搭档和灵感伙伴/);
  assert.match(prompt, /# 第一阶段：采访孩子，激发故事/);
  assert.match(prompt, /# 第二阶段：整理故事创意，请孩子确认/);
  assert.match(prompt, /# 第三阶段：根据确认的创意写故事/);
  assert.match(prompt, /# 第四阶段：让孩子修改，直到满意/);
  assert.match(prompt, /一次只问一个问题/);
  assert.match(prompt, /最多提问 6 个问题/);
  assert.match(prompt, /确认前不要生成完整故事/);
  assert.match(prompt, /这是不是自己想讲的故事/);
  assert.match(prompt, /【我的完整故事】/);
  assert.match(prompt, /【这是我自己做出的创意决定】/);
  assert.doesNotMatch(prompt, /颜色 \/ 发型或外形 \/ 衣服 \/ 标志物/, 'trait extraction belongs to lesson 2');
});

test('socratic prompt carries the chosen start and the seed', () => {
  const prompt = buildSocraticPrompt({
    story: {
      startKind: 'character',
      seed: '一只总把袜子藏起来的小猫',
    },
  });
  assert.match(prompt, /孩子选择的创作起点类型：一个特别的角色/);
  assert.match(prompt, /一只总把袜子藏起来的小猫/);
  assert.match(prompt, /孩子最初的创意/);
});

test('socratic prompt asks about the chosen start when no seed is written', () => {
  const prompt = buildSocraticPrompt({
    story: { startKind: 'event', seed: '' },
  });
  assert.match(prompt, /孩子选择的创作起点类型：一件奇妙的事情/);
  assert.match(prompt, /请先只问一个关于「一件奇妙的事情」的问题/);
  assert.match(prompt, /确认前不要生成完整故事/);
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
      card: '故事主角：一只会发光的小恐龙',
      storyBody: '它想找到自己的影子。',
    },
  });
  assert.match(prompt, /一只会发光的小恐龙/);
  assert.match(prompt, /起点类型：一个角色/);
  assert.match(prompt, /故事种子：一只会发光的小恐龙/);
  assert.match(prompt, /【故事创意卡】/);
  assert.match(prompt, /【完整故事】/);
  assert.match(prompt, /颜色：/);
  assert.match(prompt, /待补充/);
  assert.match(prompt, /不要凭空发明角色/);
  assert.match(prompt, /不要编造真实人物的长相/);
});

test('storyboard prompt assigns one narrative task to each of the six pages', () => {
  const prompt = buildStoryboardPrompt({ card: '故事主角：小猫', storyBody: '小猫提灯找回星星。' });
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
    story: { storyTitle: '小猫的灯笼' },
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
  assert.match(source, /不要问真实姓名、学校、住址、电话或照片/);
});

test('lesson one page includes the four-step story flow and save controls', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/lab/002-picturebook/lesson-1.astro'), 'utf8');
  const storyCard = fs.readFileSync(path.join(root, 'src/components/StoryCardBuilder.astro'), 'utf8');

  assert.match(page, /StoryCardBuilder/);
  assert.doesNotMatch(page, /StoryboardBuilder/, 'storyboard belongs to lesson 2');
  assert.match(page, /ProjectFileBar/);
  assert.match(storyCard, /data-story-card/);
  assert.match(storyCard, /step 01 \/ find your idea/);
  assert.match(storyCard, /step 02 \/ create your prompt/);
  assert.match(storyCard, /step 03 \/ story interview/);
  assert.match(storyCard, /step 04 \/ save your story/);
  assert.match(storyCard, /data-story-text=\{field\.id\}/);
  assert.match(storyCard, /STORY_TEXT_FIELDS\.map/);
  assert.match(page, /pb-save-panel/, 'lesson 1 keeps a save panel');
  assert.match(page, /pb-save-panel[\s\S]*ProjectFileBar/, 'save panel wraps the file bar');
  assert.doesNotMatch(page, /pb-save-dock/, 'save entry was moved out of the top of the page');
  assert.doesNotMatch(page, /pb-story-check|data-review/, 'the story check block was removed');
  assert.match(storyCard, /data-story-inspiration/, 'seed panel offers starting ideas');
  assert.match(storyCard, /data-story-seed/, 'seed field is the first input');
  const promptData = fs.readFileSync(path.join(root, 'src/lib/picturebook-prompts.mjs'), 'utf8');
  assert.match(promptData, /会飞的小猫/);
  assert.match(promptData, /害怕黑暗的小龙/);
  assert.match(promptData, /住在瓶子里的精灵/);
  assert.doesNotMatch(page, /pb-boundary|pb-stack-end|保存方式说明/, 'lesson 1 no longer repeats the classroom save speech');
  assert.doesNotMatch(page, /两个周六中的第 1 节|不填写姓名|不上传照片/, 'lesson 1 chips were removed by user request');
  assert.doesNotMatch(storyCard, /生成追问提示词|复制追问提示词/, 'prompt buttons use the shorter labels');
  assert.match(storyCard, /生成提示词/);
  assert.match(storyCard, /复制提示词/);
});

test('lesson steps are numbered continuously on each page', () => {
  const lessonOne = fs.readFileSync(path.join(root, 'src/components/StoryCardBuilder.astro'), 'utf8');
  const storyboard = fs.readFileSync(path.join(root, 'src/components/StoryboardBuilder.astro'), 'utf8');
  const studio = fs.readFileSync(path.join(root, 'src/components/PicturebookStudio.astro'), 'utf8');
  const lessonTwo = studio.replace('<StoryboardBuilder />', storyboard);
  const lessonOneSteps = [...lessonOne.matchAll(/step (\d{2})\b/g)].map((match) => match[1]);
  const lessonTwoSteps = [...lessonTwo.matchAll(/step (\d{2})\b/g)].map((match) => match[1]);
  assert.deepEqual(lessonOneSteps, ['01', '02', '03', '04']);
  assert.deepEqual(lessonTwoSteps, ['01', '02', '03', '04', '05', '06']);
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

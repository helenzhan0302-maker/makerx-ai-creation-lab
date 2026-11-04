(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const toast = $("#toast");
  let toastTimer = null;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(helper);
      return copied;
    }
  };

  const shuffle = (items) => {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  };

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  /* Page views */
  const hub = $("#hub");
  const views = {
    arith: $("#tool-arith"),
    pinyin: $("#tool-pinyin"),
    dictation: $("#tool-dictation"),
  };

  const showView = (name) => {
    const isTool = Boolean(views[name]);
    if (hub) hub.hidden = isTool;
    Object.entries(views).forEach(([key, view]) => {
      if (view) view.hidden = key !== name;
    });
    document.body.classList.toggle("tool-open", isTool);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const route = () => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "tool-arith" || hash === "tool-pinyin" || hash === "tool-dictation") {
      showView(hash.replace("tool-", ""));
    } else {
      showView(null);
    }
  };
  window.addEventListener("hashchange", route);
  route();

  /* Copy buttons */
  const copyChallengeButton = $("[data-copy-challenge]");
  if (copyChallengeButton) {
    copyChallengeButton.addEventListener("click", async () => {
      const template = $("#challenge-template");
      if (!template) return;
      const copied = await copyText(template.content.textContent.trim());
      showToast(copied ? "回群模板已复制" : "复制失败，请手动选择");
    });
  }

  /* Shared print helpers */
  const printSheet = $("#print-sheet");
  const printDoc = (title, subtitle, bodyHtml, footer = "MakerX AI工具盒 · 免费内测 · 本地生成") => {
    if (!printSheet) return;
    printSheet.innerHTML = `
      <div class="print-brand">MakerX AI工具盒 · 免费内测</div>
      <h1>${title}</h1>
      <p class="print-sub">${subtitle}</p>
      ${bodyHtml}
      <div class="print-foot">${footer}</div>
    `;
    window.print();
  };

  /* ---------------- Arithmetic ---------------- */
  const arithStart = $("#arith-start");
  const arithPlay = $("#arith-play");
  const arithEnd = $("#arith-end");
  const arithTime = $("#arith-time");
  const arithScore = $("#arith-score");
  const arithCount = $("#arith-count");
  const arithQuestion = $("#arith-question");
  const arithAnswers = $("#arith-answers");
  const arithFeedback = $("#arith-feedback");
  const arithResultTitle = $("#arith-result-title");
  const arithResultSub = $("#arith-result-sub");
  const arithWrongWrap = $("#arith-wrong-wrap");
  const arithWrongList = $("#arith-wrong-list");

  let arithMode = "mix";
  let arithCurrent = null;
  let arithScoreValue = 0;
  let arithCountValue = 0;
  let arithTimeValue = 60;
  let arithWrong = [];
  let arithTimer = null;
  let arithLocked = false;

  const buildArithQuestion = () => {
    let mode = arithMode;
    if (mode === "mix") mode = Math.random() < 0.5 ? "add" : "sub";
    let left;
    let right;
    let answer;
    if (mode === "add") {
      left = randomInt(0, 9);
      right = randomInt(0, 9 - left);
      answer = left + right;
    } else {
      left = randomInt(1, 9);
      right = randomInt(0, left);
      answer = left - right;
    }
    const options = new Set([answer]);
    while (options.size < 4) {
      const candidate = Math.max(0, Math.min(10, answer + randomInt(-3, 3)));
      options.add(candidate);
    }
    return { left, right, answer, mode, options: shuffle(Array.from(options)) };
  };

  const renderArithQuestion = () => {
    if (!arithCurrent || !arithQuestion || !arithAnswers) return;
    arithQuestion.textContent = `${arithCurrent.left} ${arithCurrent.mode === "add" ? "+" : "−"} ${arithCurrent.right} = ?`;
    arithAnswers.innerHTML = "";
    arithCurrent.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-btn";
      button.textContent = String(option);
      button.addEventListener("click", () => handleArithAnswer(button, option));
      arithAnswers.appendChild(button);
    });
    arithLocked = false;
    if (arithFeedback) {
      arithFeedback.textContent = "";
      arithFeedback.classList.remove("is-wrong");
    }
  };

  const handleArithAnswer = (button, option) => {
    if (arithLocked || !arithCurrent) return;
    arithLocked = true;
    const correct = option === arithCurrent.answer;
    button.classList.add(correct ? "is-correct" : "is-wrong");
    if (!correct) {
      arithWrong.push(`${arithCurrent.left} ${arithCurrent.mode === "add" ? "+" : "−"} ${arithCurrent.right} = ${arithCurrent.answer}`);
      const rightButton = $$(".answer-btn", arithAnswers).find((item) => Number(item.textContent) === arithCurrent.answer);
      if (rightButton) rightButton.classList.add("is-correct");
    }
    arithCountValue += 1;
    if (correct) arithScoreValue += 1;
    if (arithScore) arithScore.textContent = String(arithScoreValue);
    if (arithCount) arithCount.textContent = String(arithCountValue);
    if (arithFeedback) {
      arithFeedback.textContent = correct ? "答对了" : `正确答案是 ${arithCurrent.answer}`;
      arithFeedback.classList.toggle("is-wrong", !correct);
    }
    window.setTimeout(() => {
      if (arithTimer === null) return;
      arithCurrent = buildArithQuestion();
      renderArithQuestion();
    }, correct ? 320 : 780);
  };

  const stopArith = () => {
    if (arithTimer !== null) {
      window.clearInterval(arithTimer);
      arithTimer = null;
    }
  };

  const finishArith = () => {
    stopArith();
    if (arithStart) arithStart.hidden = true;
    if (arithPlay) arithPlay.hidden = true;
    if (arithEnd) arithEnd.hidden = false;
    const total = arithCountValue;
    const rate = total > 0 ? Math.round((arithScoreValue / total) * 100) : 0;
    if (arithResultTitle) arithResultTitle.textContent = `做对 ${arithScoreValue} 题`;
    if (arithResultSub) {
      arithResultSub.textContent = total === 0
        ? "这一分钟没有作答。可以换一个题型，或先陪孩子做一题。"
        : `一共做了 ${total} 题，正确率 ${rate}%。${arithWrong.length > 0 ? "错题在下面，等会儿再看一遍。" : "这一局没有错题。"}`
    }
    if (arithWrongWrap) arithWrongWrap.hidden = arithWrong.length === 0;
    if (arithWrongList) {
      arithWrongList.innerHTML = "";
      Array.from(new Set(arithWrong)).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        arithWrongList.appendChild(li);
      });
    }
  };

  const tickArith = () => {
    arithTimeValue -= 1;
    if (arithTime) arithTime.textContent = String(Math.max(0, arithTimeValue));
    if (arithTimeValue <= 0) finishArith();
  };

  const startArith = () => {
    stopArith();
    arithScoreValue = 0;
    arithCountValue = 0;
    arithTimeValue = 60;
    arithWrong = [];
    arithCurrent = buildArithQuestion();
    if (arithScore) arithScore.textContent = "0";
    if (arithCount) arithCount.textContent = "0";
    if (arithTime) arithTime.textContent = "60";
    if (arithStart) arithStart.hidden = true;
    if (arithEnd) arithEnd.hidden = true;
    if (arithPlay) arithPlay.hidden = false;
    renderArithQuestion();
    arithTimer = window.setInterval(tickArith, 1000);
  };

  $$("[data-arith-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      arithMode = button.dataset.arithMode || "mix";
      $$("[data-arith-mode]").forEach((item) => item.classList.toggle("is-active", item === button));
    });
  });

  const arithStartButton = $("#arith-start-btn");
  if (arithStartButton) arithStartButton.addEventListener("click", startArith);
  const arithAgain = $("#arith-again");
  if (arithAgain) arithAgain.addEventListener("click", startArith);

  const printArithWorksheet = () => {
    const questions = [];
    const sheetMode = arithMode === "mix" ? (Math.random() < 0.5 ? "add" : "sub") : arithMode;
    for (let index = 0; index < 20; index += 1) {
      const question = buildArithQuestion();
      questions.push(question);
    }
    const listHtml = questions.map((question) => {
      const symbol = question.mode === "add" ? "+" : "−";
      return `<li>${question.left} ${symbol} ${question.right} = ______</li>`;
    }).join("");
    const answers = questions.map((question) => {
      const symbol = question.mode === "add" ? "+" : "−";
      return `${question.left} ${symbol} ${question.right} = ${question.answer}`;
    }).join("　　");
    printDoc(
      "10 以内加减法练习单",
      `题型：${sheetMode === "add" ? "加法" : sheetMode === "sub" ? "减法" : "混合"} · 共 20 题 · 建议 5-8 分钟`,
      `<ol>${listHtml}</ol><p class="print-answer"><strong>参考答案</strong><br>${answers}</p>`,
      "MakerX AI工具盒 · 请按孩子状态使用，不追求一次做完"
    );
  };
  ["#arith-print-start", "#arith-print-end"].forEach((selector) => {
    const button = $(selector);
    if (button) button.addEventListener("click", printArithWorksheet);
  });

  /* ---------------- Pinyin ---------------- */
  const pinyinData = [
    { pinyin: "shān", char: "山", options: ["山", "水", "火", "田"] },
    { pinyin: "shuǐ", char: "水", options: ["水", "木", "土", "石"] },
    { pinyin: "huǒ", char: "火", options: ["火", "山", "雨", "风"] },
    { pinyin: "tián", char: "田", options: ["田", "天", "口", "日"] },
    { pinyin: "mù", char: "木", options: ["木", "目", "米", "马"] },
    { pinyin: "yún", char: "云", options: ["云", "雨", "雪", "风"] },
    { pinyin: "niǎo", char: "鸟", options: ["鸟", "马", "鱼", "虫"] },
    { pinyin: "huā", char: "花", options: ["花", "草", "树", "叶"] },
    { pinyin: "yuè", char: "月", options: ["月", "日", "星", "天"] },
    { pinyin: "rén", char: "人", options: ["人", "大", "小", "口"] },
    { pinyin: "dà", char: "大", options: ["大", "小", "人", "天"] },
    { pinyin: "xiǎo", char: "小", options: ["小", "少", "水", "木"] },
  ];

  const pinyinStart = $("#pinyin-start");
  const pinyinPlay = $("#pinyin-play");
  const pinyinEnd = $("#pinyin-end");
  const pinyinQuestion = $("#pinyin-question");
  const pinyinOptions = $("#pinyin-options");
  const pinyinIndex = $("#pinyin-index");
  const pinyinScore = $("#pinyin-score");
  const pinyinFeedback = $("#pinyin-feedback");
  const pinyinNext = $("#pinyin-next");
  const pinyinRead = $("#pinyin-read");
  const pinyinResultTitle = $("#pinyin-result-title");
  const pinyinResultSub = $("#pinyin-result-sub");
  const pinyinWrongWrap = $("#pinyin-wrong-wrap");
  const pinyinWrongList = $("#pinyin-wrong-list");

  let pinyinRound = [];
  let pinyinPosition = 0;
  let pinyinScoreValue = 0;
  let pinyinWrong = [];
  let pinyinAnswered = false;

  const speak = (text) => {
    if (!("speechSynthesis" in window)) {
      showToast("当前浏览器不支持朗读，请家长带读");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.78;
    window.speechSynthesis.speak(utterance);
  };

  const renderPinyin = () => {
    const item = pinyinRound[pinyinPosition];
    if (!item) return;
    pinyinAnswered = false;
    if (pinyinQuestion) pinyinQuestion.textContent = item.pinyin;
    if (pinyinIndex) pinyinIndex.textContent = String(pinyinPosition + 1);
    if (pinyinFeedback) pinyinFeedback.textContent = "";
    if (pinyinNext) pinyinNext.hidden = true;
    if (pinyinRead) pinyinRead.hidden = true;
    if (!pinyinOptions) return;
    pinyinOptions.innerHTML = "";
    shuffle(item.options).forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pinyin-btn";
      button.textContent = option;
      button.addEventListener("click", () => handlePinyinAnswer(button, option, item));
      pinyinOptions.appendChild(button);
    });
  };

  const handlePinyinAnswer = (button, option, item) => {
    if (pinyinAnswered) return;
    pinyinAnswered = true;
    const correct = option === item.char;
    button.classList.add(correct ? "is-correct" : "is-wrong");
    if (!correct) {
      pinyinWrong.push(`${item.pinyin} = ${item.char}`);
      const rightButton = $$(".pinyin-btn", pinyinOptions).find((element) => element.textContent === item.char);
      if (rightButton) rightButton.classList.add("is-correct");
    } else {
      pinyinScoreValue += 1;
    }
    if (pinyinScore) pinyinScore.textContent = String(pinyinScoreValue);
    if (pinyinFeedback) {
      pinyinFeedback.textContent = correct ? "读对了" : `正确答案是「${item.char}」`;
      pinyinFeedback.classList.toggle("is-wrong", !correct);
    }
    if (pinyinNext) pinyinNext.hidden = false;
    if (pinyinRead) pinyinRead.hidden = false;
  };

  const finishPinyin = () => {
    if (pinyinStart) pinyinStart.hidden = true;
    if (pinyinPlay) pinyinPlay.hidden = true;
    if (pinyinEnd) pinyinEnd.hidden = false;
    if (pinyinResultTitle) pinyinResultTitle.textContent = `做对 ${pinyinScoreValue} 题`;
    if (pinyinResultSub) {
      pinyinResultSub.textContent = pinyinScoreValue >= 9
        ? "常用单字拼读比较稳。可以换更长的词语继续练。"
        : pinyinScoreValue >= 6
          ? "大部分能读出来，错题再看一遍，明天再练一次。"
          : "先从错题里的拼音重新带读，不急着加新字。";
    }
    if (pinyinWrongWrap) pinyinWrongWrap.hidden = pinyinWrong.length === 0;
    if (pinyinWrongList) {
      pinyinWrongList.innerHTML = "";
      Array.from(new Set(pinyinWrong)).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        pinyinWrongList.appendChild(li);
      });
    }
  };

  const startPinyin = () => {
    pinyinRound = shuffle(pinyinData).slice(0, 10);
    pinyinPosition = 0;
    pinyinScoreValue = 0;
    pinyinWrong = [];
    if (pinyinScore) pinyinScore.textContent = "0";
    if (pinyinStart) pinyinStart.hidden = true;
    if (pinyinEnd) pinyinEnd.hidden = true;
    if (pinyinPlay) pinyinPlay.hidden = false;
    renderPinyin();
  };

  const pinyinStartButton = $("#pinyin-start-btn");
  if (pinyinStartButton) pinyinStartButton.addEventListener("click", startPinyin);
  const pinyinAgain = $("#pinyin-again");
  if (pinyinAgain) pinyinAgain.addEventListener("click", startPinyin);
  if (pinyinRead) {
    pinyinRead.addEventListener("click", () => {
      const item = pinyinRound[pinyinPosition];
      if (item) speak(item.char);
    });
  }
  if (pinyinNext) {
    pinyinNext.addEventListener("click", () => {
      if (pinyinPosition >= pinyinRound.length - 1) {
        finishPinyin();
        return;
      }
      pinyinPosition += 1;
      renderPinyin();
    });
  }

  const printPinyinCards = () => {
    const cards = shuffle(pinyinData).slice(0, 10);
    const items = cards.map((item) => `<li><strong>${item.pinyin}</strong>　　（　　）</li>`).join("");
    const answers = cards.map((item) => `${item.pinyin} = ${item.char}`).join("　　");
    printDoc(
      "拼音拼读练习卡",
      "先读拼音，再在括号里写汉字 · 共 10 题",
      `<ol>${items}</ol><p class="print-answer"><strong>参考答案</strong><br>${answers}</p>`,
      "MakerX AI工具盒 · 家长可先带读一遍，再让孩子独立完成"
    );
  };
  ["#pinyin-print-start", "#pinyin-print-end"].forEach((selector) => {
    const button = $(selector);
    if (button) button.addEventListener("click", printPinyinCards);
  });

  /* ---------------- Dictation / errors ---------------- */
  const dictationInput = $("#dictation-input");
  const errorsInput = $("#errors-input");
  const dictationPreview = $("#dictation-preview");
  const errorsPreview = $("#errors-preview");
  const dictationPlayer = $("#dictation-player");
  const dictationCurrent = $("#dictation-current");
  const dictationTotal = $("#dictation-total");
  let dictationWords = [];
  let dictationPosition = 0;

  const parseWords = () => (dictationInput ? dictationInput.value : "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 30);

  const renderDictationPreview = () => {
    dictationWords = parseWords();
    if (!dictationPreview) return;
    if (dictationWords.length === 0) {
      dictationPreview.hidden = true;
      showToast("先输入至少一个词");
      return;
    }
    dictationPreview.hidden = false;
    dictationPreview.innerHTML = `
      <h3>听写单预览 · ${dictationWords.length} 个</h3>
      <ol>${dictationWords.map((word) => `<li>${word}</li>`).join("")}</ol>
      <p class="answer-key">家长读词，孩子写。建议一次 5-15 个，读完再统一核对。</p>
    `;
  };

  const startDictation = () => {
    dictationWords = parseWords();
    if (dictationWords.length === 0) {
      showToast("先输入至少一个词");
      return;
    }
    dictationPosition = 0;
    if (dictationPlayer) dictationPlayer.hidden = false;
    if (dictationTotal) dictationTotal.textContent = String(dictationWords.length);
    readNextWord();
  };

  const readNextWord = () => {
    if (dictationPosition >= dictationWords.length) {
      if (dictationPlayer) dictationPlayer.hidden = true;
      showToast("听写结束，和孩子一起核对吧");
      return;
    }
    const word = dictationWords[dictationPosition];
    if (dictationCurrent) dictationCurrent.textContent = String(dictationPosition + 1);
    const hint = $("#dictation-player-hint");
    if (hint) hint.textContent = `正在读第 ${dictationPosition + 1} 个，写完后点“再读一遍”或等待下一次。`;
    speak(word);
    dictationPosition += 1;
    window.setTimeout(() => {
      if (dictationPlayer && !dictationPlayer.hidden) readNextWord();
    }, 4200);
  };

  const dictationPreviewButton = $("#dictation-preview-btn");
  if (dictationPreviewButton) dictationPreviewButton.addEventListener("click", renderDictationPreview);
  const dictationPlayButton = $("#dictation-play-btn");
  if (dictationPlayButton) dictationPlayButton.addEventListener("click", startDictation);

  const dictationReplay = $("#dictation-replay");
  if (dictationReplay) {
    dictationReplay.addEventListener("click", () => {
      const word = dictationWords[Math.max(0, dictationPosition - 1)];
      if (word) speak(word);
    });
  }
  const dictationStop = $("#dictation-stop");
  if (dictationStop) {
    dictationStop.addEventListener("click", () => {
      dictationPosition = dictationWords.length;
      if (dictationPlayer) dictationPlayer.hidden = true;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      showToast("已停止听写");
    });
  }

  const printDictation = () => {
    const words = parseWords();
    if (words.length === 0) {
      showToast("先输入至少一个词");
      return;
    }
    const lines = words.map((word, index) => `<li>${index + 1}. __________________</li>`).join("");
    printDoc(
      "听写练习单",
      `共 ${words.length} 个词 · 家长读词，孩子写`,
      `<ol>${lines}</ol>`,
      "MakerX AI工具盒 · 只用于家长自用，请勿公开传播他人教材内容"
    );
  };
  const dictationPrintButton = $("#dictation-print-btn");
  if (dictationPrintButton) dictationPrintButton.addEventListener("click", printDictation);

  const parseErrors = () => (errorsInput ? errorsInput.value : "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question, answer] = line.split("|").map((part) => (part || "").trim());
      return { question, answer };
    })
    .filter((item) => item.question);

  const renderErrors = () => {
    const items = parseErrors();
    if (!errorsPreview) return;
    if (items.length === 0) {
      errorsPreview.hidden = true;
      showToast("先输入至少一道题");
      return;
    }
    errorsPreview.hidden = false;
    errorsPreview.innerHTML = `
      <h3>错题重做单 · ${items.length} 题</h3>
      <ol>${items.map((item) => `<li>${item.question}</li>`).join("")}</ol>
      <p class="answer-key"><strong>参考答案</strong><br>${items.map((item, index) => `${index + 1}. ${item.answer || "未填写"}`).join("　　")}</p>
    `;
  };
  const errorsPreviewButton = $("#errors-preview-btn");
  if (errorsPreviewButton) errorsPreviewButton.addEventListener("click", renderErrors);

  const printErrors = () => {
    const items = parseErrors();
    if (items.length === 0) {
      showToast("先输入至少一道题");
      return;
    }
    printDoc(
      "错题重做单",
      `共 ${items.length} 题 · 先独立重做，再对照答案`,
      `<ol>${items.map((item) => `<li>${item.question}</li>`).join("")}</ol><p class="print-answer"><strong>参考答案</strong><br>${items.map((item, index) => `${index + 1}. ${item.answer || "未填写"}`).join("　　")}</p>`,
      "MakerX AI工具盒 · 答案仅供家长核对"
    );
  };
  const errorsPrintButton = $("#errors-print-btn");
  if (errorsPrintButton) errorsPrintButton.addEventListener("click", printErrors);

  $$("[data-dict-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.dictTab;
      $$("[data-dict-tab]").forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-selected", String(selected));
      });
      const dictationPane = $("#dictation-pane");
      const errorsPane = $("#errors-pane");
      if (dictationPane) dictationPane.hidden = tab !== "dictation";
      if (errorsPane) errorsPane.hidden = tab !== "errors";
    });
  });
})();

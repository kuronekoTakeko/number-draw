/* =========================
   NUMBER DRAW / LOTTERY SIMULATOR
   通常6・通常7 ＋ 特殊7（全699回の上位20から4、残り17から3）
========================= */

let selectedMode = 6;
let selectedCount = 1;

const MAX_NUMBERS = { 6: 43, 7: 37 };

// 第1〜699回（2013/04/05〜2026/10/16）の本数字出現ランキング上位20。
// 同数の場合は数字の小さい順で順位を確定（20位: 14、21位: 21 はいずれも133回）。
// この固定データは抽せん結果に応じて自動更新されません。
const TOP20_SPECIAL7 = Object.freeze([4, 7, 8, 9, 10, 11, 13, 14, 15, 17, 18, 22, 26, 29, 30, 31, 32, 34, 35, 36]);
const TOP20_SPECIAL7_SET = new Set(TOP20_SPECIAL7);
const OTHER17_SPECIAL7 = Object.freeze(
  Array.from({length: 37}, (_, i) => i + 1)
    .filter(number => !TOP20_SPECIAL7_SET.has(number))
);

/* =========================
   ELEMENTS
========================= */
const topScreen = document.getElementById("top-screen");
const drawingScreen = document.getElementById("drawing-screen");
const resultScreen = document.getElementById("result-screen");
const modeButtons = document.querySelectorAll(".mode-button");
const countButtons = document.querySelectorAll(".count-button");
const drawButton = document.getElementById("draw-button");
const drawingText = document.getElementById("drawing-text");
const resultList = document.getElementById("result-list");
const againButton = document.getElementById("again-button");
const topButton = document.getElementById("top-button");
const resultModeLabel = document.getElementById("result-mode-label");
const specialResultNote = document.getElementById("special-result-note");

function showScreen(screen) {
  topScreen.classList.remove("active");
  drawingScreen.classList.remove("active");
  resultScreen.classList.remove("active");
  screen.classList.add("active");
}

/* =========================
   MODE AND DRAW COUNT
========================= */
modeButtons.forEach(button => {
  button.addEventListener("click", () => {
    modeButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    selectedMode = button.dataset.mode === "special7"
      ? "special7"
      : Number(button.dataset.mode);
  });
});

countButtons.forEach(button => {
  button.addEventListener("click", () => {
    countButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    selectedCount = Number(button.dataset.count);
  });
});

/* =========================
   RANDOM DRAWS
========================= */
// 通常6/7：元の抽せん方式（重複なし・昇順）を維持。
function createDraw(numberCount) {
  const numbers = [];
  const maxNumber = MAX_NUMBERS[selectedMode];
  while (numbers.length < numberCount) {
    const randomNumber = Math.floor(Math.random() * maxNumber) + 1;
    if (!numbers.includes(randomNumber)) numbers.push(randomNumber);
  }
  return numbers.sort((a, b) => a - b);
}

// 指定した集合から重複なしで均等に count 個選ぶ（部分Fisher–Yates）。
function chooseWithoutReplacement(pool, count) {
  if (count > pool.length) throw new Error("抽出個数が候補数を超えています");
  const shuffled = [...pool];
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (shuffled.length - i));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

// 特殊7：全699回の上位20個から4個、上位20個には含まれない17個から3個。
function createSpecialSevenDraw() {
  const fromTop20 = chooseWithoutReplacement(TOP20_SPECIAL7, 4);
  const fromOther17 = chooseWithoutReplacement(OTHER17_SPECIAL7, 3);
  return [...fromTop20, ...fromOther17].sort((a, b) => a - b);
}

function createResults() {
  const results = [];
  for (let i = 0; i < selectedCount; i++) {
    results.push(selectedMode === "special7"
      ? createSpecialSevenDraw()
      : createDraw(selectedMode));
  }
  return results;
}

function formatNumber(number) {
  return String(number).padStart(2, "0");
}

/* =========================
   DRAWING ANIMATION
========================= */
function playDrawingAnimation() {
  showScreen(drawingScreen);
  const results = createResults();
  let dotCount = 1;
  drawingText.textContent = "抽選中.";
  const interval = setInterval(() => {
    dotCount = dotCount % 3 + 1;
    drawingText.textContent = "抽選中" + ".".repeat(dotCount);
  }, 250);
  setTimeout(() => {
    clearInterval(interval);
    showResults(results);
  }, 1200);
}

/* =========================
   RESULTS
========================= */
function showResults(results) {
  const isSpecial = selectedMode === "special7";
  resultModeLabel.textContent = isSpecial
    ? "特殊7抽選 · 4＋3"
    : `NUMBER ${selectedMode}`;
  specialResultNote.hidden = !isSpecial;
  resultList.replaceChildren();

  results.forEach((result, index) => {
    const row = document.createElement("div");
    row.className = "result-row";
    const label = document.createElement("div");
    label.className = "result-label";
    label.textContent = `${index + 1}回目`;
    const numbers = document.createElement("div");
    numbers.className = "result-numbers";

    result.forEach(number => {
      const numberElement = document.createElement("span");
      numberElement.className = "result-number";
      if (isSpecial && TOP20_SPECIAL7_SET.has(number)) {
        numberElement.classList.add("special-top-number");
      }
      numberElement.textContent = formatNumber(number);
      numbers.appendChild(numberElement);
    });

    row.appendChild(label);
    row.appendChild(numbers);
    resultList.appendChild(row);
  });

  showScreen(resultScreen);
}

drawButton.addEventListener("click", playDrawingAnimation);
againButton.addEventListener("click", playDrawingAnimation);
topButton.addEventListener("click", () => showScreen(topScreen));

/* =========================
   SERVICE WORKER (PWA)
========================= */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" })
      .then(registration => console.log("Service Worker registered:", registration.scope))
      .catch(error => console.error("Service Worker registration failed:", error));
  });
}

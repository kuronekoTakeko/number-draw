/* =========================
   SETTINGS
========================= */

let selectedMode = 6;
let selectedCount = 1;

const MAX_NUMBERS = {
  6: 43,
  7: 37
};


/* =========================
   ELEMENTS
========================= */

const topScreen =
  document.getElementById("top-screen");

const drawingScreen =
  document.getElementById("drawing-screen");

const resultScreen =
  document.getElementById("result-screen");

const modeButtons =
  document.querySelectorAll(".mode-button");

const countButtons =
  document.querySelectorAll(".count-button");

const drawButton =
  document.getElementById("draw-button");

const drawingText =
  document.getElementById("drawing-text");

const resultList =
  document.getElementById("result-list");

const againButton =
  document.getElementById("again-button");

const topButton =
  document.getElementById("top-button");

const resultModeLabel =
  document.getElementById("result-mode-label");


/* =========================
   SCREEN CHANGE
========================= */

function showScreen(screen) {

  topScreen.classList.remove("active");
  drawingScreen.classList.remove("active");
  resultScreen.classList.remove("active");

  screen.classList.add("active");

}


/* =========================
   MODE SELECT
========================= */

modeButtons.forEach((button) => {

  button.addEventListener("click", () => {

    modeButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    selectedMode =
      Number(button.dataset.mode);

  });

});


/* =========================
   COUNT SELECT
========================= */

countButtons.forEach((button) => {

  button.addEventListener("click", () => {

    countButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    selectedCount =
      Number(button.dataset.count);

  });

});


/* =========================
   CREATE ONE DRAW
========================= */

function createDraw(numberCount) {

  const numbers = [];

  while (numbers.length < numberCount) {

  const maxNumber = MAX_NUMBERS[selectedMode];

  const randomNumber =
    Math.floor(Math.random() * maxNumber) + 1;

    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber);
    }

  }

  numbers.sort((a, b) => a - b);

  return numbers;

}


/* =========================
   CREATE RESULTS
========================= */

function createResults() {

  const results = [];

  for (let i = 0; i < selectedCount; i++) {

    results.push(
      createDraw(selectedMode)
    );

  }

  return results;

}


/* =========================
   FORMAT
========================= */

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

    dotCount++;

    if (dotCount > 3) {
      dotCount = 1;
    }

    drawingText.textContent =
      "抽選中" + ".".repeat(dotCount);

  }, 250);


  setTimeout(() => {

    clearInterval(interval);

    showResults(results);

  }, 1200);

}


/* =========================
   SHOW RESULTS
========================= */

function showResults(results) {
  
  resultModeLabel.textContent =
  `NUMBER ${selectedMode}`;

  resultList.innerHTML = "";

  results.forEach((result, index) => {

    const row =
      document.createElement("div");

    row.className = "result-row";


    const label =
      document.createElement("div");

    label.className = "result-label";

    label.textContent =
      `${index + 1}回目`;


    const numbers =
      document.createElement("div");

    numbers.className =
      "result-numbers";


    result.forEach((number) => {

      const numberElement =
        document.createElement("span");

      numberElement.className =
        "result-number";

      numberElement.textContent =
        formatNumber(number);

      numbers.appendChild(
        numberElement
      );

    });


    row.appendChild(label);
    row.appendChild(numbers);

    resultList.appendChild(row);

  });

  showScreen(resultScreen);

}


/* =========================
   DRAW BUTTON
========================= */

drawButton.addEventListener("click", () => {

  playDrawingAnimation();

});


/* =========================
   AGAIN
========================= */

againButton.addEventListener("click", () => {

  playDrawingAnimation();

});


/* =========================
   TOP
========================= */

topButton.addEventListener("click", () => {

  showScreen(topScreen);

});

/* =========================
   SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("./sw.js", {
        scope: "./"
      })

      .then((registration) => {

        console.log(
          "Service Worker registered:",
          registration.scope
        );

      })

      .catch((error) => {

        console.error(
          "Service Worker registration failed:",
          error
        );

      });

  });

}
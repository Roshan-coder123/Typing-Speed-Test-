// Typing Test - main logic
// I wanted full sentences instead of random word lists because random words
// feel weird and robotic to type. Sentences flow better.

const SAMPLE_TEXTS = [
  "Typing fast is cool, but typing accurately is what actually saves time in the long run.",
  "Small projects are fun because you can experiment, break things, fix them, and learn while building.",
  "Some days your fingers move like lightning, and other days the keyboard wins. That is normal.",
  "Practice does not need to be dramatic. Ten focused minutes every day is already enough to improve.",
  "I made this test to check typing speed, but also because building interactive stuff is oddly satisfying.",
  "Clean design is nice, but a project also needs personality or it starts looking like template soup."
];

// grabbing all the DOM refs once at the top so I don't repeat querySelector everywhere
const quoteBox = document.getElementById("quoteBox");
const hiddenInput = document.getElementById("hiddenInput");
const helperText = document.getElementById("helperText");
const timeBar = document.getElementById("timeBar");

const liveWpm = document.getElementById("liveWpm");
const liveAcc = document.getElementById("liveAcc");
const liveTime = document.getElementById("liveTime");
const liveMistakes = document.getElementById("liveMistakes");

const resultPopup = document.getElementById("resultPopup");
const finalWpm = document.getElementById("finalWpm");
const finalAcc = document.getElementById("finalAcc");
const finalMistakes = document.getElementById("finalMistakes");
const finalChars = document.getElementById("finalChars");
const finalDuration = document.getElementById("finalDuration");
const finalMessage = document.getElementById("finalMessage");

// state
let currentText = "";
let currentIndex = 0;
let totalTyped = 0;
let mistakes = 0;
let hasStarted = false;
let finished = false;
let timer = null;
let selectedTime = 60;
let timeLeft = 60;

// pick a random sentence, avoid repeating the same one twice in a row if possible
let lastPicked = -1;
function pickText() {
  let idx = Math.floor(Math.random() * SAMPLE_TEXTS.length);
  if (SAMPLE_TEXTS.length > 1 && idx === lastPicked) {
    idx = (idx + 1) % SAMPLE_TEXTS.length;
  }
  lastPicked = idx;
  return SAMPLE_TEXTS[idx];
}

// builds the spans for each char so we can color them individually
// NOTE: this used to reset totalTyped/mistakes which broke WPM across sentence changes,
// fixed now (those reset only inside resetGame).
function renderText(text) {
  quoteBox.innerHTML = "";
  currentText = text;
  currentIndex = 0;

  for (let i = 0; i < text.length; i++) {
    const span = document.createElement("span");
    span.textContent = text[i];
    span.classList.add("char");
    if (i === 0) span.classList.add("current");
    quoteBox.appendChild(span);
  }

  updateLiveStats();
}

function updateLiveStats() {
  liveMistakes.textContent = mistakes;
  liveTime.textContent = timeLeft;
  liveAcc.textContent = totalTyped === 0
    ? "--"
    : Math.max(0, Math.round(((totalTyped - mistakes) / totalTyped) * 100)) + "%";
  liveWpm.textContent = calculateWpm();
}

// standard wpm calc: (correct chars / 5) / minutes
function calculateWpm() {
  const usedSeconds = selectedTime - timeLeft;
  if (usedSeconds <= 0) return 0;
  return Math.max(0, Math.round(((totalTyped - mistakes) / 5) / (usedSeconds / 60)));
}

function startGame() {
  timer = setInterval(() => {
    timeLeft--;
    updateLiveStats();
    timeBar.style.width = (timeLeft / selectedTime) * 100 + "%";

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(timer);
  finished = true;
  hiddenInput.blur();

  const speed = calculateWpm();
  const accuracy = totalTyped === 0
    ? "--"
    : Math.max(0, Math.round(((totalTyped - mistakes) / totalTyped) * 100)) + "%";

  finalWpm.textContent = speed;
  finalAcc.textContent = accuracy;
  finalMistakes.textContent = mistakes;
  finalChars.textContent = totalTyped;
  finalDuration.textContent = selectedTime + "s";

  // little personality on the result screen
  let message;
  if (speed >= 90) {
    message = "That was ridiculously fast. Keyboard did not survive.";
  } else if (speed >= 65) {
    message = "Very strong result. Properly above average.";
  } else if (speed >= 40) {
    message = "Solid. You have decent speed already.";
  } else {
    message = "Not bad. More practice and this climbs quickly.";
  }

  finalMessage.textContent = message;
  resultPopup.classList.add("show");
}

function resetGame(useNewText = false) {
  clearInterval(timer);
  hasStarted = false;
  finished = false;
  timeLeft = selectedTime;
  totalTyped = 0;
  mistakes = 0;
  hiddenInput.value = "";
  helperText.textContent = "Click the text area and start typing. Backspace works too.";
  resultPopup.classList.remove("show");

  // snap the bar back to full without animating
  timeBar.style.transition = "none";
  timeBar.style.width = "100%";
  setTimeout(() => {
    timeBar.style.transition = "width 1s linear";
  }, 30);

  renderText(useNewText ? pickText() : (currentText || pickText()));
  updateLiveStats();
}

// click the text area => focus hidden input
quoteBox.addEventListener("click", () => {
  hiddenInput.focus();
});

// global key handler for "press enter to restart after finish" + auto-focus
document.addEventListener("keydown", (e) => {
  if (finished && e.key === "Enter") {
    resetGame(false);
    return;
  }
  if (!hasStarted && e.key.length === 1) {
    hiddenInput.focus();
  }
});

// backspace handling on the hidden input
hiddenInput.addEventListener("keydown", (e) => {
  if (finished) return;

  if (!hasStarted && e.key.length === 1) {
    hasStarted = true;
    helperText.textContent = "Game in progress...";
    startGame();
  }

  if (e.key === "Backspace") {
    e.preventDefault();
    if (currentIndex > 0) {
      const chars = quoteBox.querySelectorAll(".char");
      chars[currentIndex].classList.remove("current");
      currentIndex--;
      chars[currentIndex].classList.remove("correct", "wrong");
      chars[currentIndex].classList.add("current");
    }
    hiddenInput.value = "";
  }
});

// main typing handler
hiddenInput.addEventListener("input", () => {
  if (!hasStarted || finished) return;

  const typedChar = hiddenInput.value.slice(-1);
  hiddenInput.value = "";

  const chars = quoteBox.querySelectorAll(".char");
  if (currentIndex >= chars.length) return;

  chars[currentIndex].classList.remove("current");

  if (typedChar === currentText[currentIndex]) {
    chars[currentIndex].classList.add("correct");
  } else {
    chars[currentIndex].classList.add("wrong");
    mistakes++;
  }

  totalTyped++;
  currentIndex++;

  // loaded a new sentence when current one is done — keep stats rolling
  if (currentIndex >= chars.length) {
    renderText(pickText());
  } else {
    chars[currentIndex].classList.add("current");
  }

  updateLiveStats();
});

// mode buttons (15/30/60/120)
document.querySelectorAll(".mode-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTime = Number(btn.dataset.time);
    resetGame(true);
  });
});

// control buttons
document.getElementById("restart").addEventListener("click", () => resetGame(false));
document.getElementById("newText").addEventListener("click", () => resetGame(true));
document.getElementById("playAgain").addEventListener("click", () => resetGame(true));

// kick things off
resetGame(true);

// TODO (future ideas):
//  - save best WPM to localStorage
//  - hard mode: punctuation + numbers
//  - dark theme toggle
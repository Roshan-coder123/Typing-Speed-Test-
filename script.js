const canvas = document.getElementById("typeLab");
const context = canvas.getContext("2d");

const passages = [
  "A bright idea can travel farther than a shooting star.",
  "Build small things, learn loudly, and leave a trail of light.",
  "Every careful keystroke turns a blank screen into a new world.",
  "The night sky is full of patterns waiting for curious makers.",
  "Good tools disappear while your best ideas take the spotlight.",
  "A little practice each day makes difficult work feel weightless."
];
const durations = [15, 30, 60, 120];
const colors = {
  ink: "#edf6ff",
  muted: "#8fa8c0",
  line: "#203b59",
  panel: "#0e1d31",
  cyan: "#57e0d1",
  gold: "#ffc857",
  coral: "#ff7b72",
  night: "#08111f"
};

let selectedDuration = 60;
let timeRemaining = selectedDuration;
let sentence = "";
let passageIndex = -1;
let characterIndex = 0;
let typed = 0;
let mistakes = 0;
let mistakeHistory = [];
let started = false;
let finished = false;
let timer = null;
let message = "Click anywhere, then type the passage below.";

function resizeCanvas() {
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * scale);
  canvas.height = Math.floor(window.innerHeight * scale);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  draw();
}

function nextPassage() {
  passageIndex = (passageIndex + 1) % passages.length;
  sentence = passages[passageIndex];
  characterIndex = 0;
}

function reset(loadNewPassage) {
  clearInterval(timer);
  timer = null;
  timeRemaining = selectedDuration;
  characterIndex = 0;
  typed = 0;
  mistakes = 0;
  mistakeHistory = [];
  started = false;
  finished = false;
  message = "Click anywhere, then type the passage below.";
  if (loadNewPassage || !sentence) nextPassage();
  draw();
}

function start() {
  if (started || finished) return;
  started = true;
  message = "Stay in the rhythm. Backspace corrects the last character.";
  timer = setInterval(() => {
    timeRemaining -= 1;
    if (timeRemaining <= 0) finish();
    draw();
  }, 1000);
}

function finish() {
  clearInterval(timer);
  timer = null;
  finished = true;
  started = false;
  message = "Session complete. Press Enter or choose a new duration.";
  draw();
}

function currentWpm() {
  const elapsed = selectedDuration - timeRemaining;
  if (elapsed <= 0) return 0;
  return Math.max(0, Math.round(((typed - mistakes) / 5) / (elapsed / 60)));
}

function accuracy() {
  return typed ? Math.max(0, Math.round(((typed - mistakes) / typed) * 100)) : 0;
}

function roundedRect(x, y, width, height, radius, fill, stroke) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = fill;
  context.fill();
  if (stroke) {
    context.strokeStyle = stroke;
    context.stroke();
  }
}

function text(value, x, y, size, color, weight = "400", align = "left") {
  context.font = `${weight} ${size}px "Trebuchet MS", sans-serif`;
  context.fillStyle = color;
  context.textAlign = align;
  context.textBaseline = "middle";
  context.fillText(value, x, y);
}

function drawBackground(width, height) {
  context.fillStyle = colors.night;
  context.fillRect(0, 0, width, height);
  context.fillStyle = "rgba(87, 224, 209, 0.06)";
  context.beginPath();
  context.arc(width * 0.87, height * 0.08, Math.min(width, height) * 0.28, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = colors.gold;
  for (let index = 0; index < 35; index += 1) {
    const x = (index * 97) % width;
    const y = (index * 53) % Math.max(height, 1);
    context.globalAlpha = index % 4 === 0 ? 0.8 : 0.28;
    context.fillRect(x, y, 2, 2);
  }
  context.globalAlpha = 1;
}

function drawHeader(left, top) {
  text("STARLIGHT", left, top, 14, colors.cyan, "700");
  text("TYPE LAB", left, top + 28, 27, colors.ink, "700");
  text("A focused orbit for faster, calmer typing.", left, top + 62, 15, colors.muted);
}

function drawStats(left, top, width) {
  const values = [`${currentWpm()}`, `${typed ? accuracy() : "--"}${typed ? "%" : ""}`, `${timeRemaining}s`, `${mistakes}`];
  const labels = ["WPM", "ACCURACY", "TIME LEFT", "MISTAKES"];
  const gap = 10;
  const statWidth = (width - gap * 3) / 4;
  values.forEach((value, index) => {
    const x = left + index * (statWidth + gap);
    roundedRect(x, top, statWidth, 72, 12, colors.panel, colors.line);
    text(value, x + 16, top + 27, 24, index === 3 && mistakes ? colors.coral : colors.ink, "700");
    text(labels[index], x + 16, top + 52, 10, colors.muted, "700");
  });
}

function drawDurationButtons(left, top) {
  text("SESSION LENGTH", left, top, 11, colors.muted, "700");
  durations.forEach((duration, index) => {
    const x = left + index * 82;
    const active = duration === selectedDuration;
    roundedRect(x, top + 18, 70, 34, 8, active ? colors.cyan : colors.panel, active ? colors.cyan : colors.line);
    text(`${duration}s`, x + 35, top + 35, 13, active ? colors.night : colors.ink, "700", "center");
  });
}

function drawPassage(left, top, width) {
  roundedRect(left, top, width, 190, 16, "rgba(14, 29, 49, 0.9)", colors.line);
  text("PASSAGE  //  TYPE THE LIGHT", left + 22, top + 25, 11, colors.gold, "700");
  const maxWidth = width - 44;
  const words = sentence.split(" ");
  let line = "";
  const lines = [];
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    context.font = "400 21px monospace";
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  let characterOffset = 0;
  lines.forEach((lineValue, lineIndex) => {
    let x = left + 22;
    const y = top + 72 + lineIndex * 38;
    [...lineValue].forEach((character) => {
      const color = characterOffset < characterIndex ? (characterOffset < typed - mistakes ? colors.cyan : colors.coral) : colors.muted;
      text(character, x, y, 20, color, characterOffset === characterIndex ? "700" : "400");
      const advance = context.measureText(character).width;
      if (characterOffset === characterIndex && !finished) {
        context.fillStyle = colors.gold;
        context.fillRect(x, y + 14, Math.max(advance, 3), 2);
      }
      x += advance;
      characterOffset += 1;
    });
  });
}

function drawResults(left, top, width) {
  if (!finished) return;
  roundedRect(left, top, width, 128, 16, "rgba(87, 224, 209, 0.1)", colors.cyan);
  text("NICE FLIGHT", left + 22, top + 27, 12, colors.gold, "700");
  text(`${currentWpm()} WPM`, left + 22, top + 65, 30, colors.ink, "700");
  text(`${accuracy()}% accuracy  •  ${typed} characters  •  ${mistakes} mistakes`, left + 22, top + 101, 14, colors.muted);
}

function draw() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  drawBackground(width, height);
  const contentWidth = Math.min(width - 40, 780);
  const left = (width - contentWidth) / 2;
  const compact = width < 620;
  const top = Math.max(28, (height - (compact ? 590 : 530)) / 2);
  drawHeader(left, top);
  drawDurationButtons(left, top + 98);
  drawStats(left, top + 178, contentWidth);
  drawPassage(left, top + 270, contentWidth);
  const progress = selectedDuration ? timeRemaining / selectedDuration : 0;
  context.fillStyle = colors.line;
  context.fillRect(left, top + 477, contentWidth, 5);
  context.fillStyle = colors.cyan;
  context.fillRect(left, top + 477, contentWidth * progress, 5);
  text(message, left, top + 507, 13, colors.muted);
  text("R restart    N new passage    ENTER play again", left + contentWidth, top + 507, 12, colors.muted, "400", "right");
  drawResults(left, top + 535, contentWidth);
}

function chooseDuration(x, y) {
  const top = Math.max(28, (window.innerHeight - (window.innerWidth < 620 ? 590 : 530)) / 2);
  if (y < top + 116 || y > top + 170) return false;
  const left = (window.innerWidth - Math.min(window.innerWidth - 40, 780)) / 2;
  const choice = Math.floor((x - left) / 82);
  if (choice >= 0 && choice < durations.length) {
    selectedDuration = durations[choice];
    reset(false);
    return true;
  }
  return false;
}

canvas.addEventListener("pointerdown", (event) => {
  if (chooseDuration(event.clientX, event.clientY)) return;
  if (finished) reset(false);
  canvas.focus();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && finished) {
    reset(true);
    return;
  }
  if (event.key.toLowerCase() === "r") {
    reset(false);
    return;
  }
  if (event.key.toLowerCase() === "n") {
    reset(true);
    return;
  }
  if (finished || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === "Backspace") {
    if (characterIndex > 0) {
      characterIndex -= 1;
      typed = Math.max(0, typed - 1);
      if (mistakeHistory.pop()) mistakes = Math.max(0, mistakes - 1);
      message = "Backspace used. Find the rhythm again.";
      draw();
    }
    event.preventDefault();
    return;
  }
  if (event.key.length !== 1) return;
  start();
  if (characterIndex >= sentence.length) return;
  const isMistake = event.key !== sentence[characterIndex];
  if (isMistake) mistakes += 1;
  mistakeHistory.push(isMistake);
  characterIndex += 1;
  typed += 1;
  if (characterIndex >= sentence.length) nextPassage();
  draw();
});

window.addEventListener("resize", resizeCanvas);
nextPassage();
resizeCanvas();

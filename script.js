const hackClubSentences = [
  "Typing fast is cool, but typing accurately is what actually saves time in the long run.",
  "Small projects are fun because you can experiment, break things, fix them, and learn while building.",
  "Some days your fingers move like lightning, and other days the keyboard wins. That is normal.",
  "Practice does not need to be dramatic. Ten focused minutes every day is already enough to improve.",
  "I made this test to check typing speed, but also because building interactive stuff is oddly satisfying.",
  "Clean design is nice, but a project also needs personality or it starts looking like template soup.",
  "Hack Club is a community for students to learn to code and build cool projects together every day.",
  "Stardance is the flagship event of Hack Club where students showcase their amazing projects and skills.",
  "At Hack Club, we believe that building is the best way to learn new technologies and make friends.",
  "Stardance brings together talented students who share their creative coding projects with everyone."
];

const sentenceDisplay = document.getElementById("sentenceDisplay");
const userInput = document.getElementById("userInput");
const statusMessage = document.getElementById("statusMessage");
const timerFill = document.getElementById("timerFill");

const wordsPerMinute = document.getElementById("wordsPerMinute");
const percentAccuracy = document.getElementById("percentAccuracy");
const secondsRemaining = document.getElementById("secondsRemaining");
const mistakeCount = document.getElementById("mistakeCount");

const resultsWindow = document.getElementById("resultsWindow");
const displayedWPM = document.getElementById("displayedWPM");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalMistakes = document.getElementById("finalMistakes");
const charactersTyped = document.getElementById("charactersTyped");
const testDuration = document.getElementById("testDuration");
const feedbackText = document.getElementById("feedbackText");

let currentSentence = "";
let currentCharacterIndex = 0;
let totalCharactersTyped = 0;
let totalMistakes = 0;
let isGameRunning = false;
let isGameComplete = false;
let timerInterval = null;
let selectedDuration = 60;
let timeRemaining = 60;

let previousSentenceIndex = -1;

function getRandomSentence() {
  let randomIndex = Math.floor(Math.random() * hackClubSentences.length);
  
  if (hackClubSentences.length > 1 && randomIndex === previousSentenceIndex) {
    randomIndex = (randomIndex + 1) % hackClubSentences.length;
  }
  
  previousSentenceIndex = randomIndex;
  return hackClubSentences[randomIndex];
}

function displaySentence(sentence) {
  sentenceDisplay.innerHTML = "";
  currentSentence = sentence;
  currentCharacterIndex = 0;

  for (let i = 0; i < sentence.length; i++) {
    const characterSpan = document.createElement("span");
    characterSpan.textContent = sentence[i];
    characterSpan.classList.add("character");
    
    if (i === 0) {
      characterSpan.classList.add("active");
    }
    
    sentenceDisplay.appendChild(characterSpan);
  }

  refreshStats();
}

function refreshStats() {
  mistakeCount.textContent = totalMistakes;
  secondsRemaining.textContent = timeRemaining;
  
  if (totalCharactersTyped === 0) {
    percentAccuracy.textContent = "--";
  } else {
    const correctCharacters = totalCharactersTyped - totalMistakes;
    const accuracyPercentage = Math.round((correctCharacters / totalCharactersTyped) * 100);
    percentAccuracy.textContent = Math.max(0, accuracyPercentage) + "%";
  }
  
  wordsPerMinute.textContent = calculateCurrentWPM();
}

function calculateCurrentWPM() {
  const secondsElapsed = selectedDuration - timeRemaining;
  
  if (secondsElapsed <= 0) {
    return 0;
  }
  
  const correctCharacters = totalCharactersTyped - totalMistakes;
  const words = correctCharacters / 5;
  const minutes = secondsElapsed / 60;
  const calculatedWPM = words / minutes;
  
  return Math.max(0, Math.round(calculatedWPM));
}

function startCountdown() {
  timerInterval = setInterval(() => {
    timeRemaining--;
    refreshStats();
    
    const percentageFull = (timeRemaining / selectedDuration) * 100;
    timerFill.style.width = percentageFull + "%";

    if (timeRemaining <= 0) {
      completeGame();
    }
  }, 1000);
}

function completeGame() {
  clearInterval(timerInterval);
  isGameComplete = true;
  userInput.blur();

  const finalWPM = calculateCurrentWPM();
  const correctCharacters = totalCharactersTyped - totalMistakes;
  
  let displayAccuracy = "--";
  if (totalCharactersTyped > 0) {
    displayAccuracy = Math.max(0, Math.round((correctCharacters / totalCharactersTyped) * 100)) + "%";
  }

  displayedWPM.textContent = finalWPM;
  finalAccuracy.textContent = displayAccuracy;
  finalMistakes.textContent = totalMistakes;
  charactersTyped.textContent = totalCharactersTyped;
  testDuration.textContent = selectedDuration + "s";

  if (finalWPM >= 90) {
    feedbackText.textContent = "Excellent! That was incredibly fast! You are a typing master.";
  } else if (finalWPM >= 65) {
    feedbackText.textContent = "Great job! You are well above average. Keep up the good work!";
  } else if (finalWPM >= 40) {
    feedbackText.textContent = "Good effort! You are improving. Practice more to reach higher speeds.";
  } else {
    feedbackText.textContent = "Keep practicing! With regular practice, you will get much faster.";
  }

  resultsWindow.classList.add("show");
}

function restartGameSession(shouldLoadNewSentence = false) {
  clearInterval(timerInterval);
  isGameRunning = false;
  isGameComplete = false;
  timeRemaining = selectedDuration;
  totalCharactersTyped = 0;
  totalMistakes = 0;
  userInput.value = "";
  statusMessage.textContent = "Click the text and start typing to begin. Press backspace to fix mistakes.";
  resultsWindow.classList.remove("show");

  timerFill.style.transition = "none";
  timerFill.style.width = "100%";
  
  setTimeout(() => {
    timerFill.style.transition = "width 1s linear";
  }, 50);

  if (shouldLoadNewSentence) {
    displaySentence(getRandomSentence());
  } else {
    if (currentSentence) {
      displaySentence(currentSentence);
    } else {
      displaySentence(getRandomSentence());
    }
  }
  
  refreshStats();
}

sentenceDisplay.addEventListener("click", () => {
  userInput.focus();
});

document.addEventListener("keydown", (event) => {
  if (isGameComplete && event.key === "Enter") {
    restartGameSession(false);
    return;
  }
  
  if (!isGameRunning && event.key.length === 1) {
    userInput.focus();
  }
});

userInput.addEventListener("keydown", (event) => {
  if (isGameComplete) {
    return;
  }

  if (!isGameRunning && event.key.length === 1) {
    isGameRunning = true;
    statusMessage.textContent = "Game is running! Keep typing...";
    startCountdown();
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    
    if (currentCharacterIndex > 0) {
      const allCharacters = sentenceDisplay.querySelectorAll(".character");
      allCharacters[currentCharacterIndex].classList.remove("active");
      currentCharacterIndex--;
      allCharacters[currentCharacterIndex].classList.remove("correct", "incorrect");
      allCharacters[currentCharacterIndex].classList.add("active");
    }
    
    userInput.value = "";
  }
});

userInput.addEventListener("input", () => {
  if (!isGameRunning || isGameComplete) {
    return;
  }

  const typedCharacter = userInput.value.slice(-1);
  userInput.value = "";

  const allCharacters = sentenceDisplay.querySelectorAll(".character");
  
  if (currentCharacterIndex >= allCharacters.length) {
    return;
  }

  allCharacters[currentCharacterIndex].classList.remove("active");

  const expectedCharacter = currentSentence[currentCharacterIndex];
  
  if (typedCharacter === expectedCharacter) {
    allCharacters[currentCharacterIndex].classList.add("correct");
  } else {
    allCharacters[currentCharacterIndex].classList.add("incorrect");
    totalMistakes++;
  }

  totalCharactersTyped++;
  currentCharacterIndex++;

  if (currentCharacterIndex >= allCharacters.length) {
    displaySentence(getRandomSentence());
  } else {
    allCharacters[currentCharacterIndex].classList.add("active");
  }

  refreshStats();
});

document.querySelectorAll(".duration-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".duration-button").forEach(btn => {
      btn.classList.remove("active");
    });
    
    button.classList.add("active");
    selectedDuration = Number(button.dataset.seconds);
    restartGameSession(true);
  });
});

document.getElementById("restartButton").addEventListener("click", () => {
  restartGameSession(false);
});

document.getElementById("newTextButton").addEventListener("click", () => {
  restartGameSession(true);
});

document.getElementById("playAgainButton").addEventListener("click", () => {
  restartGameSession(true);
});

restartGameSession(true);
/**
 * HANGMAN PRO - COMPLETE ENGINE
 * Features: Local/Remote JSON, Next/Prev Navigation, Game Modes, File Upload.
 */

// 1. BUILT-IN DATA (Bypasses security if files aren't found)
const INTERNAL_WORDS = [
    { word: "DIAMOND", hint: "The hardest natural mineral.", cat: "Startup" },
    { word: "KANGAROO", hint: "Australian animal that hops.", cat: "Startup" },
    { word: "PYRAMID", hint: "Ancient Egyptian monumental structure.", cat: "Startup" }
];

// List of filenames to look for in your /data/ folder
const CHAPTER_FILES = ["animals", "astronomy", "fruits", "monuments_india"];

let wordList = INTERNAL_WORDS;
let currentIndex = 0;
let selectedWord, guessedLetters, mistakes, timerInterval, timeLeft;
let score = 0;
const MAX_MISTAKES = 6;

const canvas = document.getElementById("hangmanCanvas");
const ctx = canvas.getContext("2d");

// --- INITIALIZATION ---
window.onload = () => {
    // Dynamically derive chapter names from the list
    const select = document.getElementById("chapterSelect");
    CHAPTER_FILES.forEach(file => {
        const opt = document.createElement("option");
        opt.value = `data/${file}.json`;
        opt.innerText = `Chapter: ${file.replace('_', ' ').toUpperCase()}`;
        select.appendChild(opt);
    });

    initControls();
    initGame(); // Starts the game with internal words immediately
};

function initControls() {
    // CHAPTER SELECT: Load file from data/<chapter>.json
    document.getElementById("chapterSelect").onchange = (e) => {
        if (e.target.value === "internal") {
            wordList = INTERNAL_WORDS;
            currentIndex = 0;
            initGame();
        } else {
            fetchChapter(e.target.value);
        }
    };

    // FILE UPLOAD: Provide option to upload JSON
    document.getElementById("fileInput").onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                wordList = JSON.parse(event.target.result);
                currentIndex = 0;
                initGame();
            } catch(err) { alert("Invalid JSON format!"); }
        };
        reader.readAsText(e.target.files[0]);
    };

    // NAVIGATION: Next and Previous word buttons
    document.getElementById("prevBtn").onclick = () => navigate(-1);
    document.getElementById("nextBtn").onclick = () => navigate(1);

    document.getElementById("resetBtn").onclick = () => initGame();
}

/**
 * FETCH CHAPTER: Pulls data from JSON file
 */
async function fetchChapter(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("File not found");
        wordList = await response.json();
        currentIndex = 0;
        initGame();
    } catch (err) {
        alert("Server Required: To load folder files, use Live Server. Falling back to Internal data.");
        document.getElementById("chapterSelect").value = "internal";
        wordList = INTERNAL_WORDS;
        initGame();
    }
}

/**
 * NAVIGATION LOGIC
 */
function navigate(direction) {
    if (wordList.length === 0) return;
    // Circular index logic: loops to end if going back from start
    currentIndex = (currentIndex + direction + wordList.length) % wordList.length;
    initGame();
}

/**
 * CORE GAME ENGINE
 */
function initGame() {
    if (!wordList[currentIndex]) return;
    
    const data = wordList[currentIndex];
    selectedWord = data.word.toUpperCase();
    guessedLetters = [];
    mistakes = 0;
    timeLeft = 60;

    // UI Reset
    document.getElementById("categoryName").innerText = data.cat || "General";
    document.getElementById("hintText").innerText = data.hint;
    document.getElementById("mistakes").innerText = `0 / ${MAX_MISTAKES}`;
    document.getElementById("timer").innerText = timeLeft;
    document.getElementById("resetBtn").style.display = "none";
    
    updateDisplay();
    renderKeyboard();
    drawGallows();

    // GAME MODE: Handle dropdown logic
    clearInterval(timerInterval);
    if (document.getElementById("gameSelect").value === "time-attack") {
        startTimer();
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = timeLeft;
        if (timeLeft <= 0) endGame(false, "TIME'S UP!");
    }, 1000);
}

function renderKeyboard() {
    const kb = document.getElementById("keyboard");
    kb.innerHTML = "";
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(char => {
        const btn = document.createElement("button");
        btn.innerText = char;
        btn.onclick = () => handleGuess(char, btn);
        kb.appendChild(btn);
    });
}

function handleGuess(char, btn) {
    btn.disabled = true;
    if (selectedWord.includes(char)) {
        guessedLetters.push(char);
        updateDisplay();
    } else {
        mistakes++;
        document.getElementById("mistakes").innerText = `${mistakes} / ${MAX_MISTAKES}`;
        drawMan(mistakes);
        if (mistakes >= MAX_MISTAKES) endGame(false, "GAME OVER!");
    }
}

function updateDisplay() {
    const wordArr = selectedWord.split("").map(l => guessedLetters.includes(l) ? l : "_");
    document.getElementById("wordDisplay").innerText = wordArr.join(" ");
    if (!wordArr.includes("_")) endGame(true);
}

function endGame(win, msg = "") {
    clearInterval(timerInterval);
    if (win) {
        score += (10 + Math.max(0, timeLeft));
        document.getElementById("currentScore").innerText = score;
        alert("Correct!");
    } else {
        alert(msg + " The word was: " + selectedWord);
    }
    document.getElementById("resetBtn").style.display = "block";
}

// CANVAS DRAWING
function drawGallows() {
    ctx.clearRect(0,0,200,250);
    ctx.strokeStyle = "#333"; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(10,240); ctx.lineTo(190,240);
    ctx.moveTo(30,240); ctx.lineTo(30,20);
    ctx.lineTo(150,20); ctx.lineTo(150,50);
    ctx.stroke();
}

function drawMan(s) {
    ctx.lineWidth = 3; ctx.strokeStyle = "#d32f2f";
    ctx.beginPath();
    switch(s) {
        case 1: ctx.arc(150, 75, 25, 0, Math.PI*2); break;
        case 2: ctx.moveTo(150, 100); ctx.lineTo(150, 180); break;
        case 3: ctx.moveTo(150, 120); ctx.lineTo(120, 150); break;
        case 4: ctx.moveTo(150, 120); ctx.lineTo(180, 150); break;
        case 5: ctx.moveTo(150, 180); ctx.lineTo(120, 220); break;
        case 6: ctx.moveTo(150, 180); ctx.lineTo(180, 220); break;
    }
    ctx.stroke();
}
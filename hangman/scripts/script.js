/**
 * HANGMAN PRO - LOGIC ENGINE
 */

// 1. DATA SOURCES
const INTERNAL_WORDS = [
    { word: "DIAMOND", hint: "The hardest natural mineral.", cat: "Startup" },
    { word: "KANGAROO", hint: "Australian animal that hops.", cat: "Startup" }
];

const CHAPTER_FILES = ["animals", "astronomy", "fruits", "monuments_india"];

// 2. STATE VARIABLES
let wordList = INTERNAL_WORDS, currentIndex = 0;
let selectedWord, guessedLetters, mistakes, timerInterval, timeLeft, score = 0;
const MAX_MISTAKES = 6;

const canvas = document.getElementById("hangmanCanvas");
const ctx = canvas.getContext("2d");

// 3. INITIALIZATION
window.onload = () => {
    const select = document.getElementById("chapterSelect");
    CHAPTER_FILES.forEach(file => {
        const opt = document.createElement("option");
        opt.value = `data/${file}.json`;
        opt.innerText = `Chapter: ${file.toUpperCase().replace('_', ' ')}`;
        select.appendChild(opt);
    });

    initEventListeners();
    initGame();
};

function initEventListeners() {
    // Physical Keyboard Support
    document.addEventListener("keydown", (e) => {
        const key = e.key.toUpperCase();
        if (key >= "A" && key <= "Z") {
            const btn = Array.from(document.querySelectorAll(".keyboard button"))
                             .find(b => b.innerText === key && !b.disabled);
            if (btn) handleGuess(key, btn);
        }
    });

    // Theme Selector
    document.getElementById("themeSelect").onchange = (e) => {
        document.body.className = e.target.value;
    };

    // Chapter Loader
    document.getElementById("chapterSelect").onchange = async (e) => {
        if (e.target.value === "internal") {
            wordList = INTERNAL_WORDS;
        } else {
            try {
                const res = await fetch(e.target.value);
                wordList = await res.json();
            } catch (err) {
                alert("Server Error: Cannot fetch folder. Run via Live Server.");
                return;
            }
        }
        currentIndex = 0;
        initGame();
    };

    // File Upload
    document.getElementById("fileInput").onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            wordList = JSON.parse(ev.target.result);
            currentIndex = 0;
            initGame();
        };
        reader.readAsText(e.target.files[0]);
    };

    document.getElementById("prevBtn").onclick = () => { currentIndex = (currentIndex - 1 + wordList.length) % wordList.length; initGame(); };
    document.getElementById("nextBtn").onclick = () => { currentIndex = (currentIndex + 1) % wordList.length; initGame(); };
    document.getElementById("resetBtn").onclick = () => initGame();
}

// 4. GAME CORE
function initGame() {
    const data = wordList[currentIndex];
    selectedWord = data.word.toUpperCase();
    guessedLetters = []; mistakes = 0; timeLeft = 60;

    document.getElementById("categoryName").innerText = data.cat || "General";
    document.getElementById("hintText").innerText = data.hint;
    document.getElementById("mistakes").innerText = `0 / ${MAX_MISTAKES}`;
    document.getElementById("timer").innerText = timeLeft;
    document.getElementById("resetBtn").style.display = "none";
    
    updateDisplay();
    renderKeyboard();
    drawGallows();

    clearInterval(timerInterval);
    if (document.getElementById("gameSelect").value === "time-attack") {
        timerInterval = setInterval(() => {
            timeLeft--;
            document.getElementById("timer").innerText = timeLeft;
            if (timeLeft <= 0) endGame(false, "TIME EXPIRED!");
        }, 1000);
    }
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
    const wordArr = selectedWord.split("").map(l => (l === " " ? " " : guessedLetters.includes(l) ? l : "_"));
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

// 5. CANVAS DRAWING
function drawGallows() {
    ctx.clearRect(0,0,200,250);
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--text'); 
    ctx.lineWidth = 4; ctx.beginPath();
    ctx.moveTo(10,240); ctx.lineTo(190,240);
    ctx.moveTo(30,240); ctx.lineTo(30,20);
    ctx.lineTo(150,20); ctx.lineTo(150,50);
    ctx.stroke();
}

function drawMan(s) {
    ctx.lineWidth = 3; ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--danger');
    ctx.beginPath();
    if(s===1) ctx.arc(150, 75, 25, 0, Math.PI*2);
    if(s===2) { ctx.moveTo(150, 100); ctx.lineTo(150, 180); }
    if(s===3) { ctx.moveTo(150, 120); ctx.lineTo(120, 150); }
    if(s===4) { ctx.moveTo(150, 120); ctx.lineTo(180, 150); }
    if(s===5) { ctx.moveTo(150, 180); ctx.lineTo(120, 220); }
    if(s===6) { ctx.moveTo(150, 180); ctx.lineTo(180, 220); }
    ctx.stroke();
}
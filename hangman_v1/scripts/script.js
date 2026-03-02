const wordList = [
    { word: "RAINBOW", hint: "Colorful light display in sky during rain.", cat: "Nature" },
    { word: "GUITAR", hint: "A musical instrument with strings.", cat: "Music" },
    { word: "OXYGEN", hint: "The gas humans need to breathe.", cat: "Science" },
    { word: "PIZZA", hint: "Italian dish with dough and cheese.", cat: "Food" },
    { word: "JUPITER", hint: "The largest planet in our solar system.", cat: "Space" },
    { word: "PYTHON", hint: "A programming language and a snake.", cat: "Tech" },
    { word: "EIFFEL", hint: "Famous iron tower in Paris.", cat: "Landmarks" },
    { word: "VOLCANO", hint: "A mountain that erupts with lava.", cat: "Nature" },
    { word: "OCTOPUS", hint: "Sea creature with eight arms.", cat: "Animals" },
    { word: "ALGORITHM", hint: "Set of rules to solve a problem.", cat: "Tech" },
    { word: "CHOCOLATE", hint: "Sweet treat from cocoa beans.", cat: "Food" },
    { word: "KANGAROO", hint: "Australian animal that hops.", cat: "Animals" },
    { word: "DIAMOND", hint: "Hardest natural mineral.", cat: "Science" },
    { word: "SUBMARINE", hint: "Watercraft that stays underwater.", cat: "Travel" }
];

let selectedWord, guessedLetters, mistakes, timerInterval, timeLeft;
let score = 0;
const maxMistakes = 6;
const INITIAL_TIME = 60; // 60 Seconds

const canvas = document.getElementById("hangmanCanvas");
const ctx = canvas.getContext("2d");

function initGame() {
    // Reset Data
    const item = wordList[Math.floor(Math.random() * wordList.length)];
    selectedWord = item.word;
    guessedLetters = [];
    mistakes = 0;
    timeLeft = INITIAL_TIME;

    // Reset UI
    document.getElementById("categoryName").innerText = item.cat;
    document.getElementById("hintText").innerText = item.hint;
    document.getElementById("mistakes").innerText = `0 / ${maxMistakes}`;
    document.getElementById("timer").innerText = timeLeft;
    document.getElementById("timer").style.color = "black";
    document.getElementById("resetBtn").style.display = "none";
    
    updateWordDisplay();
    createKeyboard();
    drawGallows();
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = timeLeft;
        if (timeLeft <= 10) document.getElementById("timer").style.color = "red";
        if (timeLeft <= 0) endGame(false, "Time's Up!");
    }, 1000);
}

function createKeyboard() {
    const kb = document.getElementById("keyboard");
    kb.innerHTML = "";
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(l => {
        const b = document.createElement("button");
        b.innerText = l;
        b.onclick = () => {
            b.disabled = true;
            if(selectedWord.includes(l)) {
                guessedLetters.push(l);
                timeLeft += 2; // Bonus +2s for every correct guess
                updateWordDisplay();
                if(!document.getElementById("wordDisplay").innerText.includes("_")) endGame(true);
            } else {
                mistakes++;
                document.getElementById("mistakes").innerText = `${mistakes} / ${maxMistakes}`;
                drawMan(mistakes);
                if(mistakes >= maxMistakes) endGame(false, "Out of Lives!");
            }
        };
        kb.appendChild(b);
    });
}

function updateWordDisplay() {
    document.getElementById("wordDisplay").innerText = 
        selectedWord.split("").map(l => guessedLetters.includes(l) ? l : "_").join(" ");
}

function endGame(isWin, message = "") {
    clearInterval(timerInterval);
    const resetBtn = document.getElementById("resetBtn");
    
    if(isWin) {
        score += (20 + timeLeft); // Base points + time bonus
        document.getElementById("currentScore").innerText = score;
        alert("Correct! +Points awarded for speed.");
        resetBtn.innerText = "Next Word";
    } else {
        score = 0; 
        document.getElementById("currentScore").innerText = score;
        alert(`${message} The word was: ${selectedWord}`);
        resetBtn.innerText = "Restart Game";
    }
    resetBtn.style.display = "block";
    // Disable keyboard
    document.querySelectorAll(".keyboard button").forEach(b => b.disabled = true);
}

function drawGallows() {
    ctx.clearRect(0,0,200,250);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(10,240); ctx.lineTo(190,240); // Base
    ctx.moveTo(30,240); ctx.lineTo(30,20);   // Post
    ctx.lineTo(150,20); ctx.lineTo(150,50);  // Beam & Rope
    ctx.stroke();
}

function drawMan(s) {
    ctx.lineWidth = 3;
    ctx.beginPath();
    if(s===1) ctx.arc(150, 75, 25, 0, Math.PI*2); // Head
    if(s===2) { ctx.moveTo(150, 100); ctx.lineTo(150, 180); } // Body
    if(s===3) { ctx.moveTo(150, 120); ctx.lineTo(120, 150); } // L Arm
    if(s===4) { ctx.moveTo(150, 120); ctx.lineTo(180, 150); } // R Arm
    if(s===5) { ctx.moveTo(150, 180); ctx.lineTo(120, 220); } // L Leg
    if(s===6) { ctx.moveTo(150, 180); ctx.lineTo(180, 220); } // R Leg
    ctx.stroke();
}

document.getElementById("resetBtn").onclick = initGame;
initGame();
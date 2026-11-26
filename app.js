const game = document.getElementById("game");
const counter = document.getElementById("counter");
const success = document.getElementById("success");
const holdWheel = document.getElementById("hold-wheel");

const colors = [
    "#FF7777",
    "#FFB84D",
    "#FFE066",
    "#78DCA0",
    "#58C7E8",
    "#7898F5",
    "#B18AE8",
    "#F28CCB"
];

let targetCount = 0;
let activePointers = new Set();
let completed = false;
let holdTimer = null;
let holdStart = null;
let maxCircles = 4;

const HOLD_DURATION = 1000;

// Generate a new round
function newRound() {
    targetCount = Math.floor(Math.random() * maxCircles) + 1;

    activePointers.clear();
    completed = false;
    cancelHold();

    success.classList.remove("show");
    game.querySelectorAll(".circle").forEach(c => c.remove());

    counter.textContent = "How many circles are there?";

    createCircles();
}

// Create randomly scattered circles
function createCircles() {
    const bounds = game.getBoundingClientRect();

    const diameter = Math.min(
        145,
        Math.max(75, Math.min(bounds.width / 8, bounds.height / 4))
    );

    const positions = [];

    for (let i = 0; i < targetCount; i++) {
        let x, y;
        let attempts = 0;
        let valid = false;

        do {
            x = Math.random() * (bounds.width - diameter);
            y = Math.random() * (bounds.height - diameter - 65);

            valid = positions.every(pos => {
                const dx = x - pos.x;
                const dy = y - pos.y;

                return Math.sqrt(dx * dx + dy * dy) >
                    diameter * 1.25;
            });

            attempts++;
        } while (!valid && attempts < 100);

        positions.push({ x, y });

        const circle = document.createElement("div");
        circle.className = "circle";

        circle.style.width = diameter + "px";
        circle.style.height = diameter + "px";
        circle.style.left = x + "px";
        circle.style.top = y + "px";
        circle.style.background = colors[i];

        game.appendChild(circle);
    }
}

// Track simultaneous fingers
game.addEventListener("pointerdown", event => {
    if (event.pointerType !== "touch" || completed) return;

    activePointers.add(event.pointerId);
    updateFingerCount();
});

function removeFinger(event) {
    if (event.pointerType !== "touch") return;

    activePointers.delete(event.pointerId);

    if (!completed) {
        updateFingerCount();
    }
}

game.addEventListener("pointerup", removeFinger);
game.addEventListener("pointercancel", removeFinger);

// Cancel the hold timer
function cancelHold() {
    clearInterval(holdTimer);
    holdTimer = null;
    holdStart = null;

    holdWheel.classList.remove("active");

    holdWheel.style.background =
        "conic-gradient(#7465d5 0deg, #e8e5f5 0deg)";
}

// Check finger count and start/reset hold
function updateFingerCount() {
    const count = activePointers.size;

    if (count !== targetCount) {
        cancelHold();
        counter.textContent = "";
        return;
    }

    if (holdTimer !== null) return;

    holdStart = Date.now();

    holdWheel.classList.add("active");

    holdTimer = setInterval(() => {
        const elapsed = Date.now() - holdStart;

        const progress = Math.min(elapsed / HOLD_DURATION, 1);
        const degrees = progress * 360;

        // Update circular progress wheel
        holdWheel.style.background =
            `conic-gradient(
                #7465d5 ${degrees}deg,
                #e8e5f5 ${degrees}deg
            )`;

        if (activePointers.size !== targetCount) {
            cancelHold();
            updateFingerCount();
            return;
        }

        if (elapsed >= HOLD_DURATION) {
            cancelHold();
            celebrate();
        }

    }, 30);
}

function setLevel(max, button) {
    maxCircles = max;

    document.querySelectorAll(".level-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    newRound();
}

// Celebration!
function celebrate() {
    if (completed) return;

    completed = true;

    counter.textContent = "Perfect match!";

    success.classList.add("show");

    // Confetti!
    for (let i = 0; i < 100; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti";

        piece.style.left = Math.random() * 100 + "vw";
        piece.style.background =
            colors[Math.floor(Math.random() * colors.length)];

        piece.style.animationDelay =
            Math.random() * 0.8 + "s";

        piece.style.animationDuration =
            (1.5 + Math.random() * 2) + "s";

        document.body.appendChild(piece);

        setTimeout(() => piece.remove(), 4500);
    }

    // Automatically prepare the next round
    setTimeout(() => {
        if (completed) newRound();
    }, 3000);
}

// Start the game
newRound();

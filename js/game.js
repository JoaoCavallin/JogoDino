// ==========================================================
// Dino Game - motor simples em Canvas 2D
// Comunica-se com o back-end ASP.NET via /api/score
// ==========================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const specialAudio = new Audio('/Assets/Audio/6777.mp3');
specialAudio.preload = 'auto';

const GROUND_Y = 150;
const GRAVITY = 0.6;
const JUMP_FORCE = -9;

const DINO_STAND_HEIGHT = 73;
const DINO_DUCK_HEIGHT = 44;
const DINO_STAND_WIDTH = 40;
const DINO_DUCK_WIDTH = 52;

// Posição do "chão" (pés do dino / base dos obstáculos)
const BASELINE_Y = GROUND_Y + DINO_STAND_HEIGHT; // 213

let dino, obstacles, speed, score, highScore, isRunning, isGameOver, frame;
let isScoreFrozen = false;
let freezeEndTime = 0;

const scoreLabel = document.getElementById('scoreLabel');
const highScoreLabel = document.getElementById('highScoreLabel');
const startMessage = document.getElementById('startMessage');
const gameOverMessage = document.getElementById('gameOverMessage');
const duckButton = document.getElementById('duckButton');

function resetGame() {
    scoreLabel.classList.remove('rainbow-blink'); // <- CORREÇÃO: limpa o efeito de uma partida anterior
    isScoreFrozen = false;
    dino = {
        x: 50,
        y: GROUND_Y,
        width: DINO_STAND_WIDTH,
        height: DINO_STAND_HEIGHT,
        velocityY: 0,
        isJumping: false,
        isDucking: false,
        legFrame: 0
    };
    obstacles = [];
    speed = 6;
    score = 0;
    frame = 0;
    isGameOver = false;
}

function startGame() {
    resetGame();
    isRunning = true;
    startMessage.classList.add('hidden');
    gameOverMessage.classList.add('hidden');
    requestAnimationFrame(loop);
}

function jump() {
    if (!isRunning) {
        startGame();
        return;
    }
    if (isGameOver) {
        startGame();
        return;
    }
    // não deixa pular enquanto está agachado nem já no ar
    if (!dino.isJumping && !dino.isDucking) {
        dino.velocityY = JUMP_FORCE;
        dino.isJumping = true;
    }
}

function startDuck() {
    if (!isRunning || isGameOver) return;
    if (dino.isJumping) return;

    dino.isDucking = true;
    dino.height = DINO_DUCK_HEIGHT;
    dino.width = DINO_DUCK_WIDTH;
    dino.y = GROUND_Y + (DINO_STAND_HEIGHT - DINO_DUCK_HEIGHT);
}

// Para de agachar, volta ao tamanho normal
function endDuck() {
    if (!dino.isDucking) return;

    dino.isDucking = false;
    dino.height = DINO_STAND_HEIGHT;
    dino.width = DINO_STAND_WIDTH;
    dino.y = GROUND_Y;
}

function spawnObstacle() {
    // 35% de chance de nascer um pássaro, o resto é cacto
    const isBird = Math.random() < 0.35;

    if (isBird) {
        const birdHeight = 18;
        const birdY = BASELINE_Y - DINO_STAND_HEIGHT + 6

        obstacles.push({
            type: 'bird',
            x: canvas.width,
            y: birdY,
            width: 34,
            height: birdHeight,
            wingFrame: 0
        });
    } else {
        const height = 25 + Math.random() * 20;
        obstacles.push({
            type: 'cactus',
            x: canvas.width,
            y: BASELINE_Y - height,
            width: 18 + Math.random() * 10,
            height: height
        });
    }
}

function update() {
    frame++;

    // física do dino (só se aplica quando ele não está agachado no chão)
    if (dino.isJumping) {
        dino.velocityY += GRAVITY;
        dino.y += dino.velocityY;
        if (dino.y >= GROUND_Y) {
            dino.y = GROUND_Y;
            dino.velocityY = 0;
            dino.isJumping = false;
        }
    }

    // gera obstáculos periodicamente (com folga aleatória)
    if (frame % Math.max(50, 90 - Math.floor(score / 10)) === 0) {
        spawnObstacle();
    }

    // move obstáculos e anima as asas dos pássaros
    obstacles.forEach(o => {
        o.x -= speed;
        if (o.type === 'bird') {
            o.wingFrame = Math.floor(frame / 10) % 2;
        }
    });
    obstacles = obstacles.filter(o => o.x + o.width > 0);

    // colisão (retângulos com margem de tolerância)
    for (const o of obstacles) {
        const margin = 6;
        if (
            dino.x + margin < o.x + o.width &&
            dino.x + dino.width - margin > o.x &&
            dino.y + margin < o.y + o.height &&
            dino.y + dino.height - margin > o.y
        ) {
            endGame();
            return;
        }
    }

    // pontuação e velocidade progressiva
    score++;
    if (score % 100 === 0) speed += 0.4;

    updateScoreDisplay();
}

// 67777777
function isSpecialScore(displayScore) {
    const significant = displayScore.replace(/^0+/, '');
    return significant.length >= 2 && significant.startsWith('67');
}

function playSpecialSound() {
    specialAudio.currentTime = 0; 
    specialAudio.play();
}

function getRainbowDurationMs() {
    const durationText = getComputedStyle(scoreLabel).animationDuration;
    if (durationText.endsWith('ms')) return parseFloat(durationText);
    return parseFloat(durationText) * 1000;
}

function updateScoreDisplay() {
    const realDisplayScore = String(Math.floor(score / 10)).padStart(6, '0');

    if (isScoreFrozen) {
        if (performance.now() >= freezeEndTime) {
            isScoreFrozen = false;
            scoreLabel.classList.remove('rainbow-blink');
            scoreLabel.textContent = realDisplayScore;
        }
        return;
    }

    scoreLabel.textContent = realDisplayScore;

    if (isSpecialScore(realDisplayScore)) {
        isScoreFrozen = true;
        scoreLabel.classList.add('rainbow-blink');
        freezeEndTime = performance.now() + getRainbowDurationMs();
        playSpecialSound();
    }
}
// 

function drawDino() {
    ctx.fillStyle = '#535353';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height - 8);

    // "pernas" animadas alternando para dar sensação de corrida
    if (!dino.isJumping) {
        dino.legFrame = Math.floor(frame / 6) % 2;
    }
    const legOffset = dino.legFrame === 0 ? 0 : 8;
    ctx.fillRect(dino.x + 4 + legOffset, dino.y + dino.height - 8, 8, 8);
    ctx.fillRect(dino.x + dino.width - 12 - legOffset, dino.y + dino.height - 8, 8, 8);
}

function drawObstacles() {
    ctx.fillStyle = '#535353';
    obstacles.forEach(o => {
        if (o.type === 'bird') {
            drawBird(o);
        } else {
            ctx.fillRect(o.x, o.y, o.width, o.height);
        }
    });
}

// Desenha o pássaro como um "V" (asas), alternando entre asas abertas e fechadas
function drawBird(o) {
    const midY = o.y + o.height / 2;
    const wingUp = o.wingFrame === 0;

    ctx.beginPath();
    ctx.moveTo(o.x, wingUp ? o.y + o.height : midY);
    ctx.lineTo(o.x + o.width / 2, midY - 4);
    ctx.lineTo(o.x + o.width, wingUp ? o.y + o.height : midY);
    ctx.lineTo(o.x + o.width / 2, midY + (wingUp ? -2 : 6));
    ctx.closePath();
    ctx.fill();
}

function drawGround() {
    ctx.strokeStyle = '#535353';
    ctx.beginPath();
    ctx.moveTo(0, BASELINE_Y);
    ctx.lineTo(canvas.width, BASELINE_Y);
    ctx.stroke();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawDino();
    drawObstacles();
}

function loop() {
    if (!isRunning) return;
    update();
    if (!isGameOver) {
        draw();
        requestAnimationFrame(loop);
    }
}

 function endGame() {
    isGameOver = true;
    isRunning = false;
    draw();
    gameOverMessage.classList.remove('hidden');

    const finalScore = Math.floor(score / 10);
    if (finalScore > highScore) {
        highScore = finalScore;
        highScoreLabel.textContent = `RECORDE: ${highScore}`;
    }

    // salva a pontuação direto no navegador (sem precisar de servidor)
    localStorage.setItem('dinoHighScore', String(highScore));
}

function loadHighScore() {
    const saved = localStorage.getItem('dinoHighScore');
    highScore = saved ? parseInt(saved, 10) : 0;
    highScoreLabel.textContent = `RECORDE: ${highScore}`;
}

// controles de teclado
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
    }
    if (e.code === 'ArrowDown') {
        e.preventDefault();
        startDuck();
    }
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown') {
        endDuck();
    }
});

// estado inicial
isRunning = false;
resetGame();
draw();
loadHighScore();
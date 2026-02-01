// =================== GAME DATA ===================
const cardPairs = [
    // 12 pairs (24 cards)
    { id: 1, emoji: "📅", label: "First Date", matchId: 1 },
    { id: 2, emoji: "😊", label: "Nervous Smile", matchId: 1 },
    { id: 3, emoji: "🎵", label: "Favorite Song", matchId: 2 },
    { id: 4, emoji: "💃", label: "Our Dance", matchId: 2 },
    { id: 5, emoji: "🤭", label: "Inside Joke", matchId: 3 },
    { id: 6, emoji: "😂", label: "Laughing Together", matchId: 3 },
    { id: 7, emoji: "🌙", label: "Late Night Calls", matchId: 4 },
    { id: 8, emoji: "😴", label: "Sleepy Face", matchId: 4 },
    { id: 9, emoji: "🍰", label: "Shared Dessert", matchId: 5 },
    { id: 10, emoji: "💋", label: "Sweet Kiss", matchId: 5 },
    { id: 11, emoji: "🌧️", label: "Rainy Day", matchId: 6 },
    { id: 12, emoji: "🤗", label: "Cozy Hug", matchId: 6 },
    { id: 13, emoji: "🐶", label: "Secret Nickname", matchId: 7 },
    { id: 14, emoji: "😊", label: "Blushing Face", matchId: 7 },
    { id: 15, emoji: "🧭", label: "Adventure Trip", matchId: 8 },
    { id: 16, emoji: "🤩", label: "Excited Face", matchId: 8 },
    { id: 17, emoji: "🎬", label: "Movie Night", matchId: 9 },
    { id: 18, emoji: "🥰", label: "Cuddle Time", matchId: 9 },
    { id: 19, emoji: "☀️", label: "Morning Text", matchId: 10 },
    { id: 20, emoji: "😍", label: "Heart Eyes", matchId: 10 },
    { id: 21, emoji: "📆", label: "Anniversary", matchId: 11 },
    { id: 22, emoji: "💍", label: "Ring Promise", matchId: 11 },
    { id: 23, emoji: "💫", label: "Forever Promise", matchId: 12 },
    { id: 24, emoji: "♾️", label: "Infinity Love", matchId: 12 }
];

// =================== GAME STATE ===================
let gameStarted = false;
let gameWon = false;
let moves = 0;
let matches = 0;
let startTime = null;
let timerInterval = null;
let flippedCards = [];
let lockBoard = false;

// DOM Elements
const gridContainer = document.getElementById('gridContainer');
const moveCount = document.getElementById('moveCount');
const timeCount = document.getElementById('timeCount');
const matchCount = document.getElementById('matchCount');
const feedbackMessage = document.getElementById('feedbackMessage');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resetBtn = document.getElementById('resetBtn');
const hintBtn = document.getElementById('hintBtn');
const completionScreen = document.getElementById('completionScreen');
const finalTime = document.getElementById('finalTime');
const finalMoves = document.getElementById('finalMoves');
const finalAccuracy = document.getElementById('finalAccuracy');
const continueBtn = document.getElementById('continueBtn');

// =================== INITIALIZE GAME ===================
function initGame() {
    // Reset game state
    gameStarted = false;
    gameWon = false;
    moves = 0;
    matches = 0;
    flippedCards = [];
    lockBoard = false;
    
    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Update UI
    moveCount.textContent = '0';
    timeCount.textContent = '0s';
    matchCount.textContent = '0/12';
    feedbackMessage.textContent = "Start matching our memories! 💕";
    feedbackMessage.style.color = '#9d4edd';
    updateProgress();
    
    // Clear grid
    gridContainer.innerHTML = '';
    
    // Create shuffled cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);
    
    // Create card elements
    shuffledCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.dataset.id = card.id;
        cardElement.dataset.matchId = card.matchId;
        
        cardElement.innerHTML = `
            <div class="card-back">
                <div class="question-mark">❓</div>
            </div>
            <div class="card-front">
                <div class="card-emoji">${card.emoji}</div>
                <div class="card-label">${card.label}</div>
            </div>
        `;
        
        cardElement.addEventListener('click', () => flipCard(cardElement));
        gridContainer.appendChild(cardElement);
    });
    
    // Setup controls
    resetBtn.onclick = initGame;
    hintBtn.onclick = showHint;
    continueBtn.onclick = handleContinue;
}

// =================== CARD FLIP LOGIC ===================
function flipCard(card) {
    // Don't allow flipping if board is locked, card is already flipped, or game is won
    if (lockBoard || card.classList.contains('flipped') || card.classList.contains('matched') || gameWon) {
        return;
    }
    
    // Start timer on first flip
    if (!gameStarted) {
        gameStarted = true;
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    }
    
    // Flip the card
    card.classList.add('flipped');
    flippedCards.push(card);
    
    // If two cards are flipped, check for match
    if (flippedCards.length === 2) {
        moves++;
        moveCount.textContent = moves;
        lockBoard = true;
        
        const [firstCard, secondCard] = flippedCards;
        
        if (firstCard.dataset.matchId === secondCard.dataset.matchId) {
            // Match found
            handleMatch(firstCard, secondCard);
        } else {
            // No match
            handleNoMatch(firstCard, secondCard);
        }
    }
}

// =================== HANDLE MATCH ===================
function handleMatch(firstCard, secondCard) {
    matches++;
    matchCount.textContent = `${matches}/12`;
    
    // Add matched class
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
    // Create sparkle effects
    createSparkles(firstCard);
    createSparkles(secondCard);
    
    // Romantic feedback messages
    const messages = [
        "Perfect match! Just like us! ❤️",
        "You remember every detail! 💖",
        "Our story in pictures! 📖",
        "Another memory unlocked! 🔓",
        "That's our special moment! ✨",
        "You know our story so well! 💕"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    feedbackMessage.textContent = randomMessage;
    feedbackMessage.style.color = '#c77dff';
    
    // Update progress
    updateProgress();
    
    // Check for win
    if (matches === 12) {
        winGame();
    }
    
    // Reset for next turn
    flippedCards = [];
    lockBoard = false;
}

// =================== HANDLE NO MATCH ===================
function handleNoMatch(firstCard, secondCard) {
    // Shake animation
    firstCard.classList.add('shake');
    secondCard.classList.add('shake');
    
    feedbackMessage.textContent = "Not a match, try again! 💭";
    feedbackMessage.style.color = '#ff6b6b';
    
    // Flip cards back after delay
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        firstCard.classList.remove('shake');
        secondCard.classList.remove('shake');
        
        flippedCards = [];
        lockBoard = false;
    }, 1000);
}

// =================== CREATE SPARKLES ===================
function createSparkles(card) {
    const sparkles = ['✨', '🌟', '💫', '⭐'];
    
    for (let i = 0; i < 4; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        
        const cardRect = card.getBoundingClientRect();
        const containerRect = gridContainer.getBoundingClientRect();
        
        const x = cardRect.left - containerRect.left + Math.random() * cardRect.width;
        const y = cardRect.top - containerRect.top + Math.random() * cardRect.height;
        
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        
        gridContainer.appendChild(sparkle);
        
        // Remove sparkle after animation
        setTimeout(() => {
            sparkle.remove();
        }, 600);
    }
}

// =================== SHOW HINT ===================
function showHint() {
    if (lockBoard || gameWon) return;
    
    // Find first unmatched card
    const unmatchedCards = Array.from(document.querySelectorAll('.memory-card:not(.matched)'));
    if (unmatchedCards.length < 2) return;
    
    const firstCard = unmatchedCards[0];
    const matchId = firstCard.dataset.matchId;
    
    // Find its pair
    const secondCard = unmatchedCards.find(card => 
        card !== firstCard && card.dataset.matchId === matchId
    );
    
    if (!secondCard) return;
    
    // Temporarily show both cards
    firstCard.classList.add('flipped');
    secondCard.classList.add('flipped');
    
    feedbackMessage.textContent = "Here's a hint! Remember these two! 💡";
    feedbackMessage.style.color = '#ffb347';
    
    // Flip back after delay
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
    }, 1500);
}

// =================== UPDATE TIMER ===================
function updateTimer() {
    if (!gameStarted || gameWon) return;
    
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeCount.textContent = `${elapsed}s`;
}

// =================== UPDATE PROGRESS ===================
function updateProgress() {
    const progress = (matches / 12) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}% Complete`;
}

// =================== WIN GAME ===================
function winGame() {
    gameWon = true;
    clearInterval(timerInterval);
    
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = Math.round((12 / moves) * 100);
    
    // Update final stats
    finalTime.textContent = `${elapsed}s`;
    finalMoves.textContent = moves;
    finalAccuracy.textContent = `${accuracy}%`;
    
    // Show completion screen
    setTimeout(() => {
        completionScreen.classList.add('active');
        createCelebrationHearts();
    }, 1000);
}

// =================== CREATE CELEBRATION HEARTS ===================
function createCelebrationHearts() {
    const hearts = ['❤️', '💖', '💕', '💞', '💗', '💓'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.style.position = 'fixed';
            heart.style.fontSize = `${Math.random() * 30 + 20}px`;
            heart.style.left = `${Math.random() * 100}vw`;
            heart.style.top = '-50px';
            heart.style.color = i % 2 === 0 ? '#ff6b9d' : '#c77dff';
            heart.style.opacity = '0.8';
            heart.style.zIndex = '1001';
            heart.style.pointerEvents = 'none';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            
            document.body.appendChild(heart);
            
            // Animate falling
            const animation = heart.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 0.8 },
                { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 3000 + 2000,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });
            
            // Remove after animation
            animation.onfinish = () => heart.remove();
        }, i * 100);
    }
}

// =================== HANDLE CONTINUE ===================
function handleContinue() {
    completionScreen.classList.remove('active');
    // Here you would navigate to next game
    console.log("Proceed to next section!");
    alert("Game completed! Next section would start here.");
}

// =================== KEYBOARD SUPPORT ===================
document.addEventListener('keydown', function(e) {
    if (e.key === 'r' || e.key === 'R') {
        initGame();
    }
    if (e.key === 'h' || e.key === 'H') {
        showHint();
    }
});

// =================== START GAME ===================
window.addEventListener('DOMContentLoaded', initGame);

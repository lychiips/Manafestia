// Pong Game Logic
class PongGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    this.paddleWidth = 10;
    this.paddleHeight = 80;
    this.ballSize = 10;
    this.winScore = 5;
    
    this.reset();
    this.bindControls();
  }

  reset() {
    this.player1 = {
      y: this.canvas.height / 2 - this.paddleHeight / 2,
      score: 0
    };
    
    this.player2 = {
      y: this.canvas.height / 2 - this.paddleHeight / 2,
      score: 0
    };
    
    this.ball = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      speedX: 5,
      speedY: 3
    };
    
    this.gameOver = false;
    this.gameStarted = false;
    this.paused = false;
    this.winner = null;
    this.keys = {};
  }

  resetBall() {
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height / 2;
    this.ball.speedX = -this.ball.speedX;
    this.ball.speedY = (Math.random() - 0.5) * 6;
  }

  bindControls() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      
      if (e.key === ' ' && this.gameStarted && !this.gameOver) {
        this.togglePause();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  togglePause() {
    this.paused = !this.paused;
    const pauseBtn = document.getElementById('pause-btn');
    if (this.paused) {
      pauseBtn.textContent = window.i18n ? window.i18n.t('pong.resume') : 'Resume';
    } else {
      pauseBtn.textContent = window.i18n ? window.i18n.t('pong.pause') : 'Pause';
    }
  }

  start() {
    this.reset();
    this.gameStarted = true;
    this.updateUI();
    requestAnimationFrame(() => this.gameLoop());
  }

  gameLoop() {
    if (!this.gameStarted || this.gameOver) return;
    
    if (!this.paused) {
      this.update();
    }
    this.draw();
    
    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    // Player 1 movement (W/S keys)
    if (this.keys['w'] && this.player1.y > 0) {
      this.player1.y -= 7;
    }
    if (this.keys['s'] && this.player1.y < this.canvas.height - this.paddleHeight) {
      this.player1.y += 7;
    }
    
    // AI for Player 2
    const aiSpeed = 4;
    const aiTarget = this.ball.y - this.paddleHeight / 2;
    if (this.player2.y < aiTarget && this.player2.y < this.canvas.height - this.paddleHeight) {
      this.player2.y += aiSpeed;
    }
    if (this.player2.y > aiTarget && this.player2.y > 0) {
      this.player2.y -= aiSpeed;
    }
    
    // Ball movement
    this.ball.x += this.ball.speedX;
    this.ball.y += this.ball.speedY;
    
    // Ball collision with top/bottom walls
    if (this.ball.y <= 0 || this.ball.y >= this.canvas.height - this.ballSize) {
      this.ball.speedY = -this.ball.speedY;
    }
    
    // Ball collision with player 1 paddle
    if (
      this.ball.x <= this.paddleWidth + 20 &&
      this.ball.x >= 20 &&
      this.ball.y >= this.player1.y &&
      this.ball.y <= this.player1.y + this.paddleHeight
    ) {
      this.ball.speedX = Math.abs(this.ball.speedX) * 1.05;
      const hitPos = (this.ball.y - this.player1.y) / this.paddleHeight;
      this.ball.speedY = (hitPos - 0.5) * 10;
    }
    
    // Ball collision with player 2 paddle
    if (
      this.ball.x >= this.canvas.width - this.paddleWidth - 20 - this.ballSize &&
      this.ball.x <= this.canvas.width - 20 &&
      this.ball.y >= this.player2.y &&
      this.ball.y <= this.player2.y + this.paddleHeight
    ) {
      this.ball.speedX = -Math.abs(this.ball.speedX) * 1.05;
      const hitPos = (this.ball.y - this.player2.y) / this.paddleHeight;
      this.ball.speedY = (hitPos - 0.5) * 10;
    }
    
    // Limit ball speed
    const maxSpeed = 15;
    this.ball.speedX = Math.max(-maxSpeed, Math.min(maxSpeed, this.ball.speedX));
    this.ball.speedY = Math.max(-maxSpeed, Math.min(maxSpeed, this.ball.speedY));
    
    // Score points
    if (this.ball.x <= 0) {
      this.player2.score++;
      this.updateUI();
      if (this.player2.score >= this.winScore) {
        this.endGame(2);
      } else {
        this.resetBall();
      }
    }
    
    if (this.ball.x >= this.canvas.width) {
      this.player1.score++;
      this.updateUI();
      if (this.player1.score >= this.winScore) {
        this.endGame(1);
      } else {
        this.resetBall();
      }
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw center line
    this.ctx.strokeStyle = '#2a2a4e';
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    // Draw paddles
    this.ctx.fillStyle = '#e94560';
    this.ctx.beginPath();
    this.ctx.roundRect(20, this.player1.y, this.paddleWidth, this.paddleHeight, 5);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#60a5fa';
    this.ctx.beginPath();
    this.ctx.roundRect(
      this.canvas.width - this.paddleWidth - 20,
      this.player2.y,
      this.paddleWidth,
      this.paddleHeight,
      5
    );
    this.ctx.fill();
    
    // Draw ball
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(
      this.ball.x + this.ballSize / 2,
      this.ball.y + this.ballSize / 2,
      this.ballSize / 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
    
    // Draw pause indicator
    if (this.paused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  endGame(winner) {
    this.gameOver = true;
    this.winner = winner;
    this.showGameOver();
  }

  showGameOver() {
    const overlay = document.getElementById('game-over-overlay');
    const winnerText = document.getElementById('winner-text');
    const playerLabel = this.winner === 1 
      ? (window.i18n ? window.i18n.t('pong.player1') : 'Player 1')
      : (window.i18n ? window.i18n.t('pong.player2') : 'Player 2 (AI)');
    winnerText.textContent = playerLabel;
    overlay.classList.remove('hidden');
  }

  updateUI() {
    document.getElementById('player1-score').textContent = this.player1.score;
    document.getElementById('player2-score').textContent = this.player2.score;
  }
}

// Initialize game when DOM is loaded
let pongGame;
document.addEventListener('DOMContentLoaded', () => {
  pongGame = new PongGame('game-canvas');
  pongGame.draw();
});

function startGame() {
  document.getElementById('start-overlay').classList.add('hidden');
  document.getElementById('game-over-overlay').classList.add('hidden');
  document.getElementById('pause-btn').classList.remove('hidden');
  pongGame.start();
}

function playAgain() {
  document.getElementById('game-over-overlay').classList.add('hidden');
  pongGame.start();
}

function togglePause() {
  if (pongGame && pongGame.gameStarted && !pongGame.gameOver) {
    pongGame.togglePause();
  }
}

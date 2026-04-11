// Snake Game Logic
class SnakeGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize;
    
    this.reset();
    this.bindControls();
  }

  reset() {
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 0, y: 0 };
    this.nextDirection = { x: 0, y: 0 };
    this.food = this.generateFood();
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.gameLoop = null;
  }

  generateFood() {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };
    } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }

  bindControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.gameStarted || this.gameOver) return;
      
      switch(e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          if (this.direction.y !== 1) {
            this.nextDirection = { x: 0, y: -1 };
          }
          break;
        case 'arrowdown':
        case 's':
          if (this.direction.y !== -1) {
            this.nextDirection = { x: 0, y: 1 };
          }
          break;
        case 'arrowleft':
        case 'a':
          if (this.direction.x !== 1) {
            this.nextDirection = { x: -1, y: 0 };
          }
          break;
        case 'arrowright':
        case 'd':
          if (this.direction.x !== -1) {
            this.nextDirection = { x: 1, y: 0 };
          }
          break;
      }
    });
  }

  start() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
    this.reset();
    this.gameStarted = true;
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.gameLoop = setInterval(() => this.update(), 100);
    this.updateUI();
  }

  update() {
    if (this.gameOver) return;

    this.direction = { ...this.nextDirection };
    
    const head = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y
    };

    // Check wall collision
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      this.endGame();
      return;
    }

    // Check self collision
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.endGame();
      return;
    }

    this.snake.unshift(head);

    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.food = this.generateFood();
      this.updateUI();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.ctx.strokeStyle = '#2a2a4e';
    for (let i = 0; i < this.tileCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }

    // Draw snake
    this.snake.forEach((segment, index) => {
      const gradient = this.ctx.createRadialGradient(
        segment.x * this.gridSize + this.gridSize / 2,
        segment.y * this.gridSize + this.gridSize / 2,
        0,
        segment.x * this.gridSize + this.gridSize / 2,
        segment.y * this.gridSize + this.gridSize / 2,
        this.gridSize / 2
      );
      
      if (index === 0) {
        gradient.addColorStop(0, '#4ade80');
        gradient.addColorStop(1, '#22c55e');
      } else {
        gradient.addColorStop(0, '#22c55e');
        gradient.addColorStop(1, '#16a34a');
      }
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.roundRect(
        segment.x * this.gridSize + 1,
        segment.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2,
        4
      );
      this.ctx.fill();
    });

    // Draw food
    this.ctx.fillStyle = '#e94560';
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.gridSize + this.gridSize / 2,
      this.food.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  endGame() {
    this.gameOver = true;
    clearInterval(this.gameLoop);
    
    // Save high score
    const highScore = localStorage.getItem('snakeHighScore') || 0;
    if (this.score > highScore) {
      localStorage.setItem('snakeHighScore', this.score);
    }
    
    this.showGameOver();
  }

  showGameOver() {
    const overlay = document.getElementById('game-over-overlay');
    const finalScore = document.getElementById('final-score');
    finalScore.textContent = this.score;
    overlay.classList.remove('hidden');
  }

  updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('high-score').textContent = localStorage.getItem('snakeHighScore') || 0;
  }
}

// Initialize game when DOM is loaded
let snakeGame;
document.addEventListener('DOMContentLoaded', () => {
  snakeGame = new SnakeGame('game-canvas');
  snakeGame.draw();
  snakeGame.updateUI();
});

function startGame() {
  document.getElementById('start-overlay').classList.add('hidden');
  document.getElementById('game-over-overlay').classList.add('hidden');
  snakeGame.start();
}

function playAgain() {
  document.getElementById('game-over-overlay').classList.add('hidden');
  snakeGame.start();
}

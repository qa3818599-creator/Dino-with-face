const ASSET_PATH = "../../pictures/";

export class DinoGame {
  constructor(canvas, scoreManager, faceController, onGameOver, onScoreUpdate) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.scoreManager = scoreManager;
    this.faceController = faceController;
    this.onGameOver = onGameOver;
    this.onScoreUpdate = onScoreUpdate;
    this.images = {};
    this.running = false;
    this.keys = new Set();
    this.obstacle = null;
    this.speed = 10;
    this.groundY = 535;
    this.lastTime = 0;
    this.animationFrame = 0;
    this.nextBirdScore = 300 + Math.floor(Math.random() * 151);
    this.dino = { x: 80, y: 450, width: 88, height: 85, duckHeight: 55, jumping: false, jumpVelocity: 0, ducking: false };
  }

  async loadImages() {
    const files = {
      run: "Chrome_T-Rex_Right_Run.webp",
      runAlt: "Chrome_T-Rex_Left_Run.webp",
      duck: "Chrome_T-Rex_Right_Duck.png",
      duckAlt: "Chrome_T-Rex_Left_Duck.png",
      cactus1: "1_Cactus_Chrome_Dino.webp",
      cactus3: "3_Cactus_Chrome_Dino.webp",
      bird: "Chrome_Pterodactyl.png",
      cloud: "Chromium_T-Rex-cloud.png",
      ground: "Chromium_T-Rex-horizon.png"
    };
    await Promise.all(Object.entries(files).map(([key, file]) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => { this.images[key] = image; resolve(); };
      image.onerror = reject;
      image.src = ASSET_PATH + file;
    })));
  }

  start() {
    this.scoreManager.reset();
    this.speed = 10;
    this.obstacle = null;
    this.nextBirdScore = 300 + Math.floor(Math.random() * 151);
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(time => this.loop(time));
  }

  stop() { this.running = false; }

  loop(time) {
    if (!this.running) return;
    const delta = Math.min((time - this.lastTime) / 16.67, 2);
    this.lastTime = time;
    this.update(delta);
    this.draw();
    requestAnimationFrame(nextTime => this.loop(nextTime));
  }

  update(delta) {
    this.faceController.update();
    const wantsDuck = this.keys.has("ArrowDown") || this.faceController.duck;
    const wantsJump = this.keys.has("ArrowUp") || this.keys.has("Space") || this.faceController.jump;
    if (!this.dino.jumping && wantsJump && !wantsDuck) {
      this.dino.jumping = true;
      this.dino.jumpVelocity = -14.5;
    }
    this.dino.ducking = !this.dino.jumping && wantsDuck;
    if (this.dino.jumping) {
      this.dino.y += this.dino.jumpVelocity * delta;
      this.dino.jumpVelocity += 0.65 * delta;
      if (this.dino.y >= this.groundY - this.dino.height) {
        this.dino.y = this.groundY - this.dino.height;
        this.dino.jumping = false;
      }
    } else {
      this.dino.y = this.groundY - (this.dino.ducking ? this.dino.duckHeight : this.dino.height);
    }
    this.animationFrame += delta;
    if (!this.obstacle && Math.random() < 0.018 * delta) this.spawnObstacle();
    if (this.obstacle) {
      this.obstacle.x -= this.speed * delta;
      if (this.obstacle.x + this.obstacle.width < 0) this.obstacle = null;
    }
    this.scoreManager.tick();
    this.speed = Math.min(22, this.speed + 0.004 * delta);
    this.onScoreUpdate(this.scoreManager.value, this.speed);
    if (this.obstacle && this.collides()) this.end();
  }

  spawnObstacle() {
    const isBird = this.scoreManager.value >= this.nextBirdScore;
    if (isBird) {
      this.obstacle = { type: "bird", x: this.canvas.width + 20, y: this.groundY - 135, width: 97, height: 64 };
      this.nextBirdScore = this.scoreManager.value + 250 + Math.floor(Math.random() * 201);
    } else {
      const isCactus3 = Math.random() > 0.5;
      const height = 105;
      this.obstacle = {
        type: isCactus3 ? "cactus3" : "cactus1",
        x: this.canvas.width + 20,
        y: this.groundY - height,
        width: isCactus3 ? 104 : 50,
        height
      };
    }
  }

  collides() {
    const dinoHeight = this.dino.ducking ? this.dino.duckHeight : this.dino.height;
    const dinoBox = { x: this.dino.x + 12, y: this.dino.y + 8, width: this.dino.width - 24, height: dinoHeight - 16 };
    const obstacle = this.obstacle;
    const obstacleBox = { x: obstacle.x + 4, y: obstacle.y + 4, width: obstacle.width - 8, height: obstacle.height - 8 };
    return dinoBox.x < obstacleBox.x + obstacleBox.width && dinoBox.x + dinoBox.width > obstacleBox.x && dinoBox.y < obstacleBox.y + obstacleBox.height && dinoBox.y + dinoBox.height > obstacleBox.y;
  }

  end() {
    this.running = false;
    this.scoreManager.finish();
    this.onGameOver(this.scoreManager.value);
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.globalAlpha = 0.75;
    ctx.drawImage(this.images.cloud, 720, 80);
    ctx.globalAlpha = 1;
    ctx.drawImage(this.images.ground, 0, this.groundY);
    const ducking = this.dino.ducking;
    const frame = Math.floor(this.animationFrame / 8) % 2;
    const dinoImage = ducking ? (frame ? this.images.duckAlt : this.images.duck) : (frame ? this.images.runAlt : this.images.run);
    const dinoHeight = ducking ? this.dino.duckHeight : this.dino.height;
    const dinoWidth = ducking ? 118 : this.dino.width;
    ctx.drawImage(dinoImage, this.dino.x, this.groundY - dinoHeight + (this.dino.jumping ? this.dino.y - (this.groundY - this.dino.height) : 0), dinoWidth, dinoHeight);
    if (this.obstacle) ctx.drawImage(this.images[this.obstacle.type], this.obstacle.x, this.obstacle.y, this.obstacle.width, this.obstacle.height);
  }
}

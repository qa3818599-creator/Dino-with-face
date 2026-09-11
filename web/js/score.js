export class ScoreManager {
  constructor() {
    this.value = 0;
    this.best = Number(localStorage.getItem("dino-face-high-score") || 0);
  }

  reset() { this.value = 0; }

  tick() { this.value += 1; }

  finish() {
    if (this.value > this.best) {
      this.best = this.value;
      localStorage.setItem("dino-face-high-score", String(this.best));
    }
  }
}

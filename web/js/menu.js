export class MenuController {
  constructor(elements) {
    this.elements = elements;
    this.screens = Object.values(elements.screens);
    this.onStart = () => {};
    this.onCameraToggle = () => {};
    elements.start.addEventListener("click", () => this.onStart());
    elements.restart.addEventListener("click", () => this.onStart());
    elements.settings.addEventListener("click", () => this.show("settings"));
    elements.scoreboard.addEventListener("click", () => this.show("scoreboard"));
    elements.howToPlay.addEventListener("click", () => this.show("howToPlay"));
    elements.quit.addEventListener("click", () => this.show("menu"));
    elements.settingsCamera.addEventListener("click", () => this.onCameraToggle());
    document.querySelectorAll("[data-back-menu]").forEach(button => button.addEventListener("click", () => this.show("menu")));
    window.addEventListener("keydown", event => {
      if (this.elements.screens.settings.classList.contains("hidden")) return;
      if (event.key.toLowerCase() !== "c") this.show("menu");
    });
  }

  show(name) {
    this.screens.forEach(screen => screen.classList.add("hidden"));
    this.elements.screens[name].classList.remove("hidden");
  }

  updateHighScore(value) {
    this.elements.menuHighScore.textContent = value;
    this.elements.scoreboardHighScore.textContent = value;
  }

  updateCameraStatus(enabled) {
    const label = enabled ? "On" : "Off";
    this.elements.cameraButton.textContent = enabled ? "Camera on" : "Camera off";
    this.elements.settingsCamera.textContent = enabled ? "Turn camera off" : "Turn camera on";
    this.elements.cameraSettingStatus.textContent = label;
  }
}

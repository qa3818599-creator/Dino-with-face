import { ScoreManager } from "./score.js";
import { FaceController } from "./camera.js";
import { DinoGame } from "./game.js";
import { MenuController } from "./menu.js";

const $ = id => document.getElementById(id);
const score = new ScoreManager();
const face = new FaceController($("camera-video"), $("camera-status"));
const menu = new MenuController({
  start: $("start-button"), restart: $("restart-button"), settings: $("settings-button"),
  scoreboard: $("scoreboard-button"), howToPlay: $("how-to-play-button"), quit: $("quit-button"),
  cameraButton: $("camera-button"), settingsCamera: $("settings-camera-button"),
  menuHighScore: $("menu-high-score"), scoreboardHighScore: $("scoreboard-high-score"),
  cameraSettingStatus: $("camera-setting-status"),
  screens: {
    menu: $("menu-screen"), game: $("game-screen"), settings: $("settings-screen"),
    scoreboard: $("scoreboard-screen"), howToPlay: $("how-to-play-screen"), gameOver: $("game-over-screen")
  }
});
const game = new DinoGame($("game-canvas"), score, face, finalScore => {
  $("final-score").textContent = `Score: ${finalScore}`;
  menu.updateHighScore(score.best);
  menu.show("gameOver");
}, currentScore => {
  $("score-label").textContent = `Score ${currentScore}`;
});

menu.onStart = async () => {
  try {
    await game.loadImages();
    menu.show("game");
    game.start();
  } catch (error) {
    console.error(error);
    alert("Game assets could not be loaded.");
  }
};
menu.onCameraToggle = async () => {
  try {
    await face.toggle();
    menu.updateCameraStatus(face.enabled);
  } catch (error) {
    menu.updateCameraStatus(false);
  }
};
window.addEventListener("keydown", event => {
  if (["ArrowDown", "ArrowUp", "Space"].includes(event.code)) {
    event.preventDefault();
    game.keys.add(event.code === "Space" ? "Space" : event.key);
  }
});
window.addEventListener("keyup", event => {
  game.keys.delete(event.code === "Space" ? "Space" : event.key);
});
menu.updateHighScore(score.best);

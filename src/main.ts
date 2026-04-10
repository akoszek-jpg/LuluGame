import Phaser from "phaser";
import "./style.css";
import { GameScene, HudState, AbilityName, OverlayState } from "./game/GameScene";

type InputState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

const inputState: InputState = {
  up: false,
  down: false,
  left: false,
  right: false
};

const scoreValue = document.querySelector<HTMLDivElement>("#scoreValue");
const timeValue = document.querySelector<HTMLDivElement>("#timeValue");
const levelValue = document.querySelector<HTMLDivElement>("#levelValue");
const messageValue = document.querySelector<HTMLDivElement>("#messageValue");
const trashButton = document.querySelector<HTMLButtonElement>("#trashAbility");
const fochButton = document.querySelector<HTMLButtonElement>("#fochAbility");
const trashCooldown = document.querySelector<HTMLDivElement>("#trashCooldown");
const fochCooldown = document.querySelector<HTMLDivElement>("#fochCooldown");
const touchButtons = document.querySelectorAll<HTMLButtonElement>(".touch-button");
const startOverlay = document.querySelector<HTMLDivElement>("#startOverlay");
const startButton = document.querySelector<HTMLButtonElement>("#startButton");
const eventOverlay = document.querySelector<HTMLDivElement>("#eventOverlay");
const eventAvatar = document.querySelector<HTMLImageElement>("#eventAvatar");
const eventEyebrow = document.querySelector<HTMLDivElement>("#eventEyebrow");
const eventTitle = document.querySelector<HTMLHeadingElement>("#eventTitle");
const eventQuote = document.querySelector<HTMLParagraphElement>("#eventQuote");
const eventButton = document.querySelector<HTMLButtonElement>("#eventButton");
const avatarVariantToggle =
  document.querySelector<HTMLInputElement>("#avatarVariantToggle");
const avatarVariantLabel =
  document.querySelector<HTMLSpanElement>("#avatarVariantLabel");
const musicToggle = document.querySelector<HTMLInputElement>("#musicToggle");
const musicLabel = document.querySelector<HTMLSpanElement>("#musicLabel");

if (
  !scoreValue ||
  !timeValue ||
  !levelValue ||
  !messageValue ||
  !trashButton ||
  !fochButton ||
  !trashCooldown ||
  !fochCooldown ||
  !startOverlay ||
  !startButton ||
  !eventOverlay ||
  !eventAvatar ||
  !eventEyebrow ||
  !eventTitle ||
  !eventQuote ||
  !eventButton ||
  !avatarVariantToggle ||
  !avatarVariantLabel ||
  !musicToggle ||
  !musicLabel
) {
  throw new Error("Nie znaleziono wymaganych elementów UI.");
}

let sceneRef: GameScene | null = null;

const updateHud = (state: HudState): void => {
  scoreValue.textContent = `${state.score}`;
  timeValue.textContent = `${state.timeLeft}`;
  levelValue.textContent = `${state.levelIndex} / ${state.levelCount}`;
  messageValue.textContent = state.message;

  trashButton.disabled = !state.trashOutReady;
  fochButton.disabled = !state.fochReady;
  trashCooldown.textContent =
    state.trashOutCooldown > 0
      ? `Gotowe za ${Math.ceil(state.trashOutCooldown)} s`
      : "Gotowe";
  fochCooldown.textContent =
    state.fochCooldown > 0 ? `Gotowe za ${Math.ceil(state.fochCooldown)} s` : "Gotowe";
};

const updateOverlay = (state: OverlayState): void => {
  if (!state.visible) {
    eventOverlay.classList.add("hidden");
    return;
  }

  eventOverlay.classList.remove("hidden");
  eventEyebrow.textContent = state.eyebrow;
  eventTitle.textContent = state.title;
  eventQuote.textContent = state.quote;
  eventButton.textContent = state.buttonLabel;
  eventAvatar.src = state.avatar === "arek" ? "/assets/arek.jpg" : "/assets/luiza.png";
  eventAvatar.alt = state.avatar === "arek" ? "Arek" : "Luiza";
};

const scene = new GameScene(updateHud, updateOverlay, inputState);
sceneRef = scene;

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 1280,
  height: 720,
  backgroundColor: "#f7eee2",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [scene]
});

const activateAbility = (name: AbilityName): void => {
  sceneRef?.useAbility(name);
};

const startGame = (): void => {
  startOverlay.classList.add("hidden");
  eventOverlay.classList.add("hidden");
  sceneRef?.startGame();
};

const continueOverlay = (): void => {
  eventOverlay.classList.add("hidden");
  sceneRef?.continueAfterOverlay();
};

const updateAvatarVariantUi = (): void => {
  avatarVariantLabel.textContent = avatarVariantToggle.checked ? "Wersja 2" : "Wersja 1";
  sceneRef?.setAvatarVariant(avatarVariantToggle.checked ? 2 : 1);
};

const updateMusicUi = (): void => {
  musicLabel.textContent = musicToggle.checked ? "Włączona" : "Wyłączona";
  sceneRef?.setAudioEnabled(musicToggle.checked);
};

trashButton.addEventListener("click", () => activateAbility("trashOut"));
fochButton.addEventListener("click", () => activateAbility("foch"));
startButton.addEventListener("click", startGame);
eventButton.addEventListener("click", continueOverlay);
avatarVariantToggle.addEventListener("change", updateAvatarVariantUi);
musicToggle.addEventListener("change", updateMusicUi);
startOverlay.addEventListener("click", (event) => {
  if (event.target === startOverlay) {
    startGame();
  }
});
updateAvatarVariantUi();
updateMusicUi();
eventOverlay.addEventListener("click", (event) => {
  if (event.target === eventOverlay) {
    continueOverlay();
  }
});

const setDirection = (dir: keyof InputState, active: boolean): void => {
  inputState[dir] = active;
};

const directionMap: Record<string, keyof InputState> = {
  up: "up",
  down: "down",
  left: "left",
  right: "right"
};

touchButtons.forEach((button) => {
  const dir = button.dataset.dir;
  if (!dir || !(dir in directionMap)) {
    return;
  }

  const key = directionMap[dir];
  const activate = (): void => setDirection(key, true);
  const deactivate = (): void => setDirection(key, false);

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    activate();
  });
  button.addEventListener("pointerup", deactivate);
  button.addEventListener("pointerleave", deactivate);
  button.addEventListener("pointercancel", deactivate);
});

window.addEventListener("blur", () => {
  inputState.up = false;
  inputState.down = false;
  inputState.left = false;
  inputState.right = false;
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Digit1") {
    activateAbility("trashOut");
  }
  if (event.code === "Digit2") {
    activateAbility("foch");
  }
});

const logAvailableVoices = (): void => {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech Synthesis API nie jest dostępne w tej przeglądarce.");
    return;
  }

  const voices = window.speechSynthesis.getVoices().map((voice) => ({
    name: voice.name,
    lang: voice.lang,
    default: voice.default
  }));

  console.log("Dostępne głosy syntezatora mowy:");
  console.table(voices);
};

if ("speechSynthesis" in window) {
  logAvailableVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    logAvailableVoices();
  };
}

window.addEventListener("beforeunload", () => {
  game.destroy(true);
});

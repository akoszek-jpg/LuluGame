import Phaser from "phaser";
import "./style.css";
import {
  GameScene,
  HudState,
  AbilityName,
  OverlayState,
  ControlMode
} from "./game/GameScene";

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
const touchControls = document.querySelector<HTMLDivElement>("#touchControls");
const touchButtons = document.querySelectorAll<HTMLButtonElement>(".touch-button");
const startOverlay = document.querySelector<HTMLDivElement>("#startOverlay");
const startAvatar = document.querySelector<HTMLImageElement>("#startAvatar");
const startButton = document.querySelector<HTMLButtonElement>("#startButton");
const eventOverlay = document.querySelector<HTMLDivElement>("#eventOverlay");
const pauseOverlay = document.querySelector<HTMLDivElement>("#pauseOverlay");
const eventAvatar = document.querySelector<HTMLImageElement>("#eventAvatar");
const eventEyebrow = document.querySelector<HTMLDivElement>("#eventEyebrow");
const eventTitle = document.querySelector<HTMLHeadingElement>("#eventTitle");
const eventQuote = document.querySelector<HTMLParagraphElement>("#eventQuote");
const eventButton = document.querySelector<HTMLButtonElement>("#eventButton");
const controlModeToggle =
  document.querySelector<HTMLInputElement>("#controlModeToggle");
const controlModeLabel =
  document.querySelector<HTMLSpanElement>("#controlModeLabel");
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
  !touchControls ||
  !startOverlay ||
  !startAvatar ||
  !startButton ||
  !eventOverlay ||
  !pauseOverlay ||
  !eventAvatar ||
  !eventEyebrow ||
  !eventTitle ||
  !eventQuote ||
  !eventButton ||
  !controlModeToggle ||
  !controlModeLabel ||
  !avatarVariantToggle ||
  !avatarVariantLabel ||
  !musicToggle ||
  !musicLabel
) {
  throw new Error("Nie znaleziono wymaganych elementów UI.");
}

let sceneRef: GameScene | null = null;
const assetBase = `${import.meta.env.BASE_URL}assets/`;
startAvatar.src = `${assetBase}luiza.png`;
startAvatar.alt = "Luiza";
const ABILITY_COOLDOWN_SECONDS = 15;

const repairMojibake = (value: string): string => {
  let repaired = value;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (!/[ÃÄÅĆÐÑÓÕØâ]/.test(repaired)) {
      break;
    }

    try {
      const next = decodeURIComponent(escape(repaired));
      if (!next || next === repaired) {
        break;
      }
      repaired = next;
    } catch {
      break;
    }
  }

  return repaired;
};

const updateHud = (state: HudState): void => {
  scoreValue.textContent = `${state.score}`;
  timeValue.textContent = `${state.timeLeft}`;
  levelValue.textContent = `${state.levelIndex} / ${state.levelCount}`;
  messageValue.textContent = repairMojibake(state.message);

  trashButton.disabled = !state.trashOutReady;
  fochButton.disabled = !state.fochReady;
  updateAbilityButton(
    trashButton,
    state.trashOutCooldown,
    state.trashOutReady,
    "Wynieś śmieci"
  );
  updateAbilityButton(fochButton, state.fochCooldown, state.fochReady, "Foch");
};

const updateAbilityButton = (
  button: HTMLButtonElement,
  cooldown: number,
  ready: boolean,
  title: string
): void => {
  const titleNode = button.querySelector<HTMLElement>(".ability-title");
  const statusNode = button.querySelector<HTMLElement>(".ability-status");
  if (!titleNode || !statusNode) {
    return;
  }

  titleNode.textContent = title;
  statusNode.textContent = ready ? "Gotowe" : `${Math.ceil(cooldown)} s`;

  const progress = ready
    ? 1
    : Math.max(0, Math.min(1, 1 - cooldown / ABILITY_COOLDOWN_SECONDS));
  button.style.setProperty("--cooldown-progress", `${progress}`);
  button.dataset.ready = ready ? "true" : "false";
};

const updateOverlay = (state: OverlayState): void => {
  if (!state.visible) {
    eventOverlay.classList.add("hidden");
    return;
  }

  eventOverlay.classList.remove("hidden");
  eventEyebrow.textContent = repairMojibake(state.eyebrow);
  eventTitle.textContent = repairMojibake(state.title);
  eventQuote.textContent = repairMojibake(state.quote);
  eventButton.textContent = repairMojibake(state.buttonLabel);
  eventAvatar.src =
    state.avatar === "arek" ? `${assetBase}arek.jpg` : `${assetBase}luiza.png`;
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
  pauseOverlay.classList.add("hidden");
  sceneRef?.startGame();
};

const continueOverlay = (): void => {
  eventOverlay.classList.add("hidden");
  pauseOverlay.classList.add("hidden");
  sceneRef?.continueAfterOverlay();
};

const updatePauseOverlay = (paused: boolean): void => {
  pauseOverlay.classList.toggle("hidden", !paused);
};

const updateAvatarVariantUi = (): void => {
  avatarVariantLabel.textContent = avatarVariantToggle.checked ? "Wersja 2" : "Wersja 1";
  sceneRef?.setAvatarVariant(avatarVariantToggle.checked ? 2 : 1);
};

const updateMusicUi = (): void => {
  musicLabel.textContent = musicToggle.checked ? "Włączona" : "Wyłączona";
  sceneRef?.setAudioEnabled(musicToggle.checked);
};

const resetDirectionalInput = (): void => {
  inputState.up = false;
  inputState.down = false;
  inputState.left = false;
  inputState.right = false;
};

const updateControlModeUi = (): void => {
  const mode: ControlMode = controlModeToggle.checked ? "mouse" : "classic";
  controlModeLabel.textContent = mode === "mouse" ? "Myszka" : "Klasyczne";
  touchControls.classList.toggle("hidden", mode === "mouse");
  resetDirectionalInput();
  sceneRef?.setControlMode(mode);
};

trashButton.addEventListener("click", () => activateAbility("trashOut"));
fochButton.addEventListener("click", () => activateAbility("foch"));
startButton.addEventListener("click", startGame);
eventButton.addEventListener("click", continueOverlay);
avatarVariantToggle.addEventListener("change", updateAvatarVariantUi);
musicToggle.addEventListener("change", updateMusicUi);
controlModeToggle.addEventListener("change", updateControlModeUi);
startOverlay.addEventListener("click", (event) => {
  if (event.target === startOverlay) {
    startGame();
  }
});
updateAvatarVariantUi();
updateMusicUi();
updateControlModeUi();

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
  resetDirectionalInput();
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    updatePauseOverlay(sceneRef?.togglePause() ?? false);
    return;
  }

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

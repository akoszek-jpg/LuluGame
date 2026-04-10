import Phaser from "phaser";
import "./style.css";
import { GameScene } from "./game/GameScene";
const inputState = {
    up: false,
    down: false,
    left: false,
    right: false
};
const scoreValue = document.querySelector("#scoreValue");
const timeValue = document.querySelector("#timeValue");
const levelValue = document.querySelector("#levelValue");
const messageValue = document.querySelector("#messageValue");
const trashButton = document.querySelector("#trashAbility");
const fochButton = document.querySelector("#fochAbility");
const trashCooldown = document.querySelector("#trashCooldown");
const fochCooldown = document.querySelector("#fochCooldown");
const touchControls = document.querySelector("#touchControls");
const touchButtons = document.querySelectorAll(".touch-button");
const startOverlay = document.querySelector("#startOverlay");
const startAvatar = document.querySelector("#startAvatar");
const startButton = document.querySelector("#startButton");
const eventOverlay = document.querySelector("#eventOverlay");
const eventAvatar = document.querySelector("#eventAvatar");
const eventEyebrow = document.querySelector("#eventEyebrow");
const eventTitle = document.querySelector("#eventTitle");
const eventQuote = document.querySelector("#eventQuote");
const eventButton = document.querySelector("#eventButton");
const controlModeToggle = document.querySelector("#controlModeToggle");
const controlModeLabel = document.querySelector("#controlModeLabel");
const avatarVariantToggle = document.querySelector("#avatarVariantToggle");
const avatarVariantLabel = document.querySelector("#avatarVariantLabel");
const musicToggle = document.querySelector("#musicToggle");
const musicLabel = document.querySelector("#musicLabel");
if (!scoreValue ||
    !timeValue ||
    !levelValue ||
    !messageValue ||
    !trashButton ||
    !fochButton ||
    !trashCooldown ||
    !fochCooldown ||
    !touchControls ||
    !startOverlay ||
    !startAvatar ||
    !startButton ||
    !eventOverlay ||
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
    !musicLabel) {
    throw new Error("Nie znaleziono wymaganych elementów UI.");
}
let sceneRef = null;
const assetBase = `${import.meta.env.BASE_URL}assets/`;
startAvatar.src = `${assetBase}luiza.png`;
startAvatar.alt = "Luiza";
const repairMojibake = (value) => {
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
        }
        catch {
            break;
        }
    }
    return repaired;
};
const updateHud = (state) => {
    scoreValue.textContent = `${state.score}`;
    timeValue.textContent = `${state.timeLeft}`;
    levelValue.textContent = `${state.levelIndex} / ${state.levelCount}`;
    messageValue.textContent = repairMojibake(state.message);
    trashButton.disabled = !state.trashOutReady;
    fochButton.disabled = !state.fochReady;
    trashCooldown.textContent =
        state.trashOutCooldown > 0
            ? `Gotowe za ${Math.ceil(state.trashOutCooldown)} s`
            : "Gotowe";
    fochCooldown.textContent =
        state.fochCooldown > 0 ? `Gotowe za ${Math.ceil(state.fochCooldown)} s` : "Gotowe";
};
const updateOverlay = (state) => {
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
const activateAbility = (name) => {
    sceneRef?.useAbility(name);
};
const startGame = () => {
    startOverlay.classList.add("hidden");
    eventOverlay.classList.add("hidden");
    sceneRef?.startGame();
};
const continueOverlay = () => {
    eventOverlay.classList.add("hidden");
    sceneRef?.continueAfterOverlay();
};
const updateAvatarVariantUi = () => {
    avatarVariantLabel.textContent = avatarVariantToggle.checked ? "Wersja 2" : "Wersja 1";
    sceneRef?.setAvatarVariant(avatarVariantToggle.checked ? 2 : 1);
};
const updateMusicUi = () => {
    musicLabel.textContent = musicToggle.checked ? "Włączona" : "Wyłączona";
    sceneRef?.setAudioEnabled(musicToggle.checked);
};
const resetDirectionalInput = () => {
    inputState.up = false;
    inputState.down = false;
    inputState.left = false;
    inputState.right = false;
};
const updateControlModeUi = () => {
    const mode = controlModeToggle.checked ? "mouse" : "classic";
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
const setDirection = (dir, active) => {
    inputState[dir] = active;
};
const directionMap = {
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
    const activate = () => setDirection(key, true);
    const deactivate = () => setDirection(key, false);
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
    if (event.code === "Digit1") {
        activateAbility("trashOut");
    }
    if (event.code === "Digit2") {
        activateAbility("foch");
    }
});
const logAvailableVoices = () => {
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

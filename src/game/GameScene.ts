import Phaser from "phaser";
import { LEVELS, LevelData, FurnitureData, RoomData } from "./levelData";

export type AbilityName = "trashOut" | "foch";

export type HudState = {
  score: number;
  timeLeft: number;
  levelIndex: number;
  levelCount: number;
  trashOutReady: boolean;
  fochReady: boolean;
  trashOutCooldown: number;
  fochCooldown: number;
  message: string;
};

export type OverlayState = {
  visible: boolean;
  eyebrow: string;
  title: string;
  quote: string;
  buttonLabel: string;
  avatar: "luiza" | "arek";
};

type InputState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

type FurnitureSpriteKey =
  | "shoe"
  | "bench"
  | "fridge"
  | "table"
  | "stove"
  | "bathtub"
  | "sink"
  | "bed"
  | "closet"
  | "sofa"
  | "coffee"
  | "tv"
  | "diningTable"
  | "washing"
  | "basket"
  | "counter"
  | "desk"
  | "shelf"
  | "toybox"
  | "chair"
  | "lamp"
  | "wardrobe";

type FurnitureState = {
  data: FurnitureData;
  spriteKey: FurnitureSpriteKey;
  state: "dirty" | "clean";
  shadow: Phaser.GameObjects.Ellipse;
  aura: Phaser.GameObjects.Ellipse;
  image: Phaser.GameObjects.Image;
  dirt: Phaser.GameObjects.Image;
  sparkle: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
};

type ActiveAbility =
  | {
      name: AbilityName;
      remaining: number;
    }
  | null;

type CharacterView = {
  kind: "luiza" | "arek";
  shadow: Phaser.GameObjects.Ellipse;
  aura: Phaser.GameObjects.Ellipse;
  sprite: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
};

const LEVEL_TIME = 60;
const CLEAN_DURATION = 1000;
const AREK_DIRTY_DURATION = 2250;
const PLAYER_SPEED = 250;
const CLEAN_RANGE = 74;
const ABILITY_COOLDOWN = 30;
const ABILITY_DURATION = 3;
const BONUS_ALL_CLEAN = 100;
const CLEAN_VOICE_LINES = ["Nareszcie czysto!"];
const CLEAN_VOICE_CONFIG = {
  rate: 0.95,
  pitch: 2.0,
  volume: 0.95
};
const SPECIAL_VOICE_LINES: Record<AbilityName, string> = {
  trashOut: "Wynieś śmieci!",
  foch: "Fohc!"
};
const SPECIAL_VOICE_CONFIG: Record<
  AbilityName,
  { rate: number; pitch: number; volume: number }
> = {
  trashOut: { rate: 0.72, pitch: 2.0, volume: 0.95 },
  foch: { rate: 0.72, pitch: 2.0, volume: 0.95 }
};
const AREK_VOICE_LINES = ["Coś tu położę!", "Oj tam!"];
const AREK_VOICE_CONFIG = {
  rate: 0.82,
  pitch: 0.86,
  volume: 0.95
};
const CLEAN_STATUS_LINES = [
  "Ekstra! {label} ląduje w stanie porządek.",
  "Super! {label} błyszczy jak nowe.",
  "Brawo! {label} wygląda jak z katalogu."
];
const AREK_MESS_LINES = [
  "AREK znów nabroił przy: {label}.",
  "AREK zostawił chaos przy: {label}.",
  "AREK mruczy i psuje: {label}."
];
const LEVEL_COMPLETE_QUOTES = [
  "Posprzątane, ale co ja widzę, Arek znowu idzie do kuchni!",
  "Posprzątane, a Arek już kombinuje, gdzie tu zrobić nowy bałagan!",
  "Porządek gotowy, tylko patrzeć jak Arek znów coś napsoci!"
];
const TIMEOUT_QUOTES = [
  "Posprzątane, ale co ja widzę, Arek znowu idzie do kuchni!",
  "Posprzątane, a Arek już kombinuje, gdzie tu zrobić nowy bałagan!",
  "Porządek gotowy, tylko patrzeć jak Arek znów coś napsoci!"
];
const MUSIC_NOTES = [659.25, 783.99, 880.0, 783.99, 987.77, 880.0, 783.99, 659.25];

export class GameScene extends Phaser.Scene {
  private readonly hudUpdater: (state: HudState) => void;
  private readonly overlayUpdater: (state: OverlayState) => void;
  private readonly inputState: InputState;

  private levelIndex = 0;
  private currentLevel!: LevelData;
  private score = 0;
  private timeLeft = LEVEL_TIME;
  private message = "Sprzątaj szybciej, niż AREK bałagani.";

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<string, Phaser.Input.Keyboard.Key>;

  private roomLayer?: Phaser.GameObjects.Graphics;
  private roomTexts: Phaser.GameObjects.Text[] = [];
  private furnitureStates: FurnitureState[] = [];
  private playerView?: CharacterView;
  private arekView?: CharacterView;
  private playerPosition = new Phaser.Math.Vector2();
  private arekPosition = new Phaser.Math.Vector2();
  private arekTarget = new Phaser.Math.Vector2();

  private cleaningFurniture?: FurnitureState;
  private cleaningRemaining = 0;
  private arekDirtyFurniture?: FurnitureState;
  private arekDirtyRemaining = 0;

  private activeAbility: ActiveAbility = null;
  private abilityCooldowns: Record<AbilityName, number> = {
    trashOut: 0,
    foch: 0
  };

  private arekHidden = false;
  private nextLevelTimer = 0;
  private fullCleanPending = false;
  private lastAllCleanState = false;
  private gameEnded = false;
  private gameStarted = false;
  private lastVoiceAt = 0;
  private overlayVisible = false;
  private pendingLevelIndex: number | null = null;
  private pendingRestart = false;
  private avatarVariant: 1 | 2 = 1;
  private audioEnabled = true;
  private musicStep = 0;
  private musicTimer?: Phaser.Time.TimerEvent;
  private audioQueue: Promise<void> = Promise.resolve();
  private audioQueueToken = 0;

  constructor(
    hudUpdater: (state: HudState) => void,
    overlayUpdater: (state: OverlayState) => void,
    inputState: InputState
  ) {
    super("game-scene");
    this.hudUpdater = hudUpdater;
    this.overlayUpdater = overlayUpdater;
    this.inputState = inputState;
  }

  preload(): void {
    this.load.image("character-luiza-photo", "/assets/luiza.png");
    this.load.image("character-arek-photo", "/assets/arek.jpg");
  }

  create(): void {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasd = this.input.keyboard?.addKeys("W,A,S,D") as Record<
      string,
      Phaser.Input.Keyboard.Key
    >;

    this.cameras.main.setBackgroundColor(0xf7eee2);
    try {
      this.createProceduralTextures();
    } catch (error) {
      console.error("Nie udało się wygenerować głównych assetów, włączam fallback.", error);
      this.createFallbackTextures();
    }
    this.loadLevel(0, true);
    this.musicTimer = this.time.addEvent({
      delay: 210,
      loop: true,
      callback: () => {
        this.tickMusic();
      }
    });
  }

  update(_: number, deltaMs: number): void {
    const delta = deltaMs / 1000;
    if (this.gameEnded) {
      return;
    }

    if (!this.gameStarted || this.overlayVisible) {
      this.updateCharacterViews();
      this.syncHud();
      return;
    }

    if (this.nextLevelTimer > 0) {
      this.nextLevelTimer -= delta;
      if (this.nextLevelTimer <= 0) {
        this.advanceLevel();
      }
      this.syncHud();
      return;
    }

    this.timeLeft = Math.max(0, this.timeLeft - delta);
    if (this.timeLeft === 0) {
      this.handleLevelTimeout();
      return;
    }

    this.updateCooldowns(delta);
    this.updateActiveAbility(delta);

    this.updatePlayer(delta);
    this.updateArek(delta);
    this.checkFullClean();
    this.syncHud();
  }

  useAbility(name: AbilityName): void {
    if (
      !this.gameStarted ||
      this.gameEnded ||
      this.nextLevelTimer > 0 ||
      this.activeAbility !== null
    ) {
      return;
    }

    if (this.abilityCooldowns[name] > 0) {
      return;
    }

    this.activeAbility = { name, remaining: ABILITY_DURATION };
    this.abilityCooldowns[name] = ABILITY_COOLDOWN;

    if (name === "trashOut") {
      this.message = "Wynieś śmieci! AREK maszeruje do drzwi.";
      this.arekTarget.set(this.currentLevel.door.x, this.currentLevel.door.y);
    } else {
      this.message = "Foch! AREK stoi i obraża się przez chwilę.";
    }

    this.playSpecialAbilityVoice(name);
    this.syncHud();
  }

  private loadLevel(index: number, resetScore: boolean): void {
    this.levelIndex = index;
    this.currentLevel = LEVELS[index];
    this.timeLeft = LEVEL_TIME;
    this.message =
      index === 0 && !this.gameStarted
        ? "Kliknij, aby Luiza ruszyła do sprzątania."
        : index === 0
          ? "Start! LUIZA wkracza do akcji."
          : `Poziom ${index + 1}. Mieszkanie robi się coraz większe.`;
    this.fullCleanPending = false;
    this.lastAllCleanState = false;
    this.cleaningFurniture = undefined;
    this.cleaningRemaining = 0;
    this.arekDirtyFurniture = undefined;
    this.arekDirtyRemaining = 0;
    this.activeAbility = null;
    this.abilityCooldowns.trashOut = 0;
    this.abilityCooldowns.foch = 0;
    this.arekHidden = false;
    this.gameEnded = false;
    this.overlayVisible = false;
    this.pendingLevelIndex = null;
    this.pendingRestart = false;
    this.hideOverlay();

    if (resetScore) {
      this.score = 0;
    }

    this.playerPosition.set(
      this.currentLevel.playerSpawn.x,
      this.currentLevel.playerSpawn.y
    );
    this.arekPosition.set(
      this.currentLevel.arekSpawn.x,
      this.currentLevel.arekSpawn.y
    );
    this.arekTarget.set(this.arekPosition.x, this.arekPosition.y);

    this.roomLayer?.destroy();
    this.roomTexts.forEach((text) => text.destroy());
    this.roomTexts = [];
    this.furnitureStates.forEach((item) => {
      item.shadow.destroy();
      item.aura.destroy();
      item.image.destroy();
      item.dirt.destroy();
      item.sparkle.destroy();
      item.label.destroy();
    });
    this.furnitureStates = [];
    this.playerView?.shadow.destroy();
    this.playerView?.aura.destroy();
    this.playerView?.sprite.destroy();
    this.playerView?.label.destroy();
    this.arekView?.shadow.destroy();
    this.arekView?.aura.destroy();
    this.arekView?.sprite.destroy();
    this.arekView?.label.destroy();

    this.drawLevel();
    this.syncHud();
  }

  startGame(): void {
    if (this.gameStarted) {
      return;
    }

    this.gameStarted = true;
    this.message = "Start! LUIZA wkracza do akcji.";
    void this.resumeAudioContext();
    this.syncHud();
  }

  setAvatarVariant(variant: 1 | 2): void {
    this.avatarVariant = variant;
    this.applyAvatarVariant();
  }

  setAudioEnabled(enabled: boolean): void {
    this.audioEnabled = enabled;
    if (enabled) {
      void this.resumeAudioContext();
    } else {
      this.clearAudioQueue();
    }
  }

  continueAfterOverlay(): void {
    if (this.pendingRestart) {
      this.pendingRestart = false;
      this.score = 0;
      this.hideOverlay();
      this.loadLevel(0, true);
      this.gameStarted = true;
      this.message = "Nowa runda! Luiza wraca do akcji.";
      this.syncHud();
      return;
    }

    if (this.pendingLevelIndex !== null) {
      const nextLevel = this.pendingLevelIndex;
      this.pendingLevelIndex = null;
      this.hideOverlay();
      this.loadLevel(nextLevel, false);
    }
  }

  private drawLevel(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xe8b89f, 1);
    graphics.fillRoundedRect(0, 0, this.currentLevel.width, this.currentLevel.height, 36);

    graphics.lineStyle(14, 0x714434, 1);
    graphics.strokeRoundedRect(
      8,
      8,
      this.currentLevel.width - 16,
      this.currentLevel.height - 16,
      32
    );

    this.currentLevel.rooms.forEach((room) => {
      graphics.fillStyle(room.color, 1);
      graphics.fillRoundedRect(room.x, room.y, room.width, room.height, 28);
      graphics.lineStyle(8, 0xffffff, 0.85);
      graphics.strokeRoundedRect(room.x, room.y, room.width, room.height, 28);
      this.drawRoomDecor(graphics, room);

      const roomText = this.add.text(room.x + 18, room.y + 14, room.name, {
        fontFamily: "Trebuchet MS",
        fontSize: "24px",
        color: "#6a3b27",
        fontStyle: "bold"
      });
      this.roomTexts.push(roomText);
    });

    graphics.fillStyle(0x5e3f2e, 1);
    graphics.fillRoundedRect(
      this.currentLevel.door.x - 26,
      this.currentLevel.door.y - 12,
      54,
      24,
      8
    );

    this.roomLayer = graphics;

    this.currentLevel.furniture.forEach((item) => {
      const spriteKey = this.resolveFurnitureSprite(item.id);
      const shadow = this.add.ellipse(
        item.x,
        item.y + item.height * 0.22,
        item.width * 0.78,
        18,
        0x6e4939,
        0.22
      );
      const aura = this.add.ellipse(
        item.x,
        item.y + item.height * 0.06,
        item.width * 0.94,
        Math.max(24, item.height * 0.58),
        0xc56a4a,
        0.18
      );
      const image = this.add.image(item.x, item.y, `furniture-${spriteKey}`);
      image.setDisplaySize(item.width, item.height);
      image.setTint(0xa97767);

      const dirt = this.add.image(
        item.x + item.width * 0.18,
        item.y + item.height * 0.14,
        "fx-dirt"
      );
      dirt.setScale(Math.max(0.55, Math.min(item.width, item.height) / 68));
      dirt.setAlpha(0.98);

      const sparkle = this.add.image(
        item.x + item.width * 0.28,
        item.y - item.height * 0.28,
        "fx-sparkle"
      );
      sparkle.setScale(Math.max(0.55, Math.min(item.width, item.height) / 70));
      sparkle.setAlpha(0);

      const label = this.add.text(item.x, item.y + item.height * 0.5 + 8, item.label, {
        fontFamily: "Trebuchet MS",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#553220"
      });
      label.setOrigin(0.5, 0);

      this.furnitureStates.push({
        data: item,
        spriteKey,
        state: "dirty",
        shadow,
        aura,
        image,
        dirt,
        sparkle,
        label
      });
    });

    this.playerView = this.createCharacter("luiza", "LUIZA", "#5d2e46");
    this.arekView = this.createCharacter("arek", "AREK", "#27497f");
    this.fitCameraToLevel();
    this.updateCharacterViews();
  }

  private createCharacter(
    texture: "luiza" | "arek",
    labelText: string,
    labelColor: string
  ): CharacterView {
    const position = texture === "luiza" ? this.playerPosition : this.arekPosition;
    const shadow = this.add.ellipse(position.x, position.y + 18, 24, 11, 0x5d3f33, 0.24);
    const aura = this.add.ellipse(
      position.x,
      position.y + 2,
      texture === "luiza" ? 40 : 38,
      texture === "luiza" ? 54 : 50,
      texture === "luiza" ? 0xff7fb2 : 0x64b8ff,
      0.22
    );
    const textureKey = this.resolveCharacterTexture(texture);
    const sprite = this.add.image(position.x, position.y, textureKey);
    const size = this.getCharacterDisplaySize(texture);
    sprite.setDisplaySize(size.width, size.height);
    const label = this.add.text(position.x, position.y + 32, labelText, {
      fontFamily: "Trebuchet MS",
      fontSize: "16px",
      fontStyle: "bold",
      color: labelColor
    });
    label.setOrigin(0.5, 0);

    return { kind: texture, shadow, aura, sprite, label };
  }

  private updatePlayer(delta: number): void {
    if (!this.playerView) {
      return;
    }

    if (this.cleaningRemaining > 0) {
      this.cleaningRemaining -= delta * 1000;
      this.animateCleaning();

      if (this.cleaningRemaining <= 0 && this.cleaningFurniture) {
        this.finishCleaning(this.cleaningFurniture);
      }

      this.updateCharacterViews();
      return;
    }

    const move = this.readMovementInput();
    if (move.lengthSq() > 0) {
      move.normalize();
      this.playerPosition.x += move.x * PLAYER_SPEED * delta;
      this.playerPosition.y += move.y * PLAYER_SPEED * delta;
      this.clampPosition(this.playerPosition, 30);
    }

    const dirtyTarget = this.findNearbyDirtyFurniture();
    if (dirtyTarget) {
      this.startCleaning(dirtyTarget);
    }

    this.updateCharacterViews();
  }

  private readMovementInput(): Phaser.Math.Vector2 {
    const move = new Phaser.Math.Vector2(0, 0);

    if (this.cursors?.left.isDown || this.wasd?.A?.isDown || this.inputState.left) {
      move.x -= 1;
    }
    if (this.cursors?.right.isDown || this.wasd?.D?.isDown || this.inputState.right) {
      move.x += 1;
    }
    if (this.cursors?.up.isDown || this.wasd?.W?.isDown || this.inputState.up) {
      move.y -= 1;
    }
    if (this.cursors?.down.isDown || this.wasd?.S?.isDown || this.inputState.down) {
      move.y += 1;
    }

    return move;
  }

  private updateArek(delta: number): void {
    if (!this.arekView) {
      return;
    }

    if (this.arekDirtyRemaining > 0 && this.arekDirtyFurniture) {
      this.arekDirtyRemaining -= delta * 1000;
      this.animateArekDirtying();

      if (this.arekDirtyRemaining <= 0) {
        this.finishArekDirtying(this.arekDirtyFurniture);
      }

      this.updateCharacterViews();
      return;
    }

    if (this.activeAbility?.name === "foch") {
      this.updateCharacterViews();
      return;
    }

    if (this.activeAbility?.name === "trashOut") {
      if (!this.arekHidden) {
        const distanceToDoor = Phaser.Math.Distance.Between(
          this.arekPosition.x,
          this.arekPosition.y,
          this.currentLevel.door.x,
          this.currentLevel.door.y
        );

        if (distanceToDoor < 18) {
          this.arekHidden = true;
          this.setArekVisibility(false);
          this.message = "AREK wyniósł śmieci i na chwilę zniknął.";
          this.updateCharacterViews();
          return;
        }

        this.moveArekTowards(this.currentLevel.door.x, this.currentLevel.door.y, delta);
      }

      this.updateCharacterViews();
      return;
    }

    if (this.arekHidden) {
      this.arekHidden = false;
      this.arekPosition.set(this.currentLevel.door.x, this.currentLevel.door.y);
      this.setArekVisibility(true);
      this.message = "AREK wrócił i znów szuka czystych rzeczy.";
    }

    const cleanFurniture = this.furnitureStates.filter((item) => item.state === "clean");
    if (cleanFurniture.length > 0) {
      const nearest = this.chooseArekTarget(cleanFurniture);

      this.arekTarget.set(nearest.data.x, nearest.data.y);
      this.moveArekTowards(this.arekTarget.x, this.arekTarget.y, delta);

      if (
        Phaser.Math.Distance.Between(
          this.arekPosition.x,
          this.arekPosition.y,
          nearest.data.x,
          nearest.data.y
        ) < 36
      ) {
        this.startArekDirtying(nearest);
      }
    } else {
      if (
        Phaser.Math.Distance.Between(
          this.arekPosition.x,
          this.arekPosition.y,
          this.arekTarget.x,
          this.arekTarget.y
        ) < 20
      ) {
        const randomRoom = Phaser.Utils.Array.GetRandom(this.currentLevel.rooms);
        this.arekTarget.set(
          Phaser.Math.Between(randomRoom.x + 60, randomRoom.x + randomRoom.width - 60),
          Phaser.Math.Between(randomRoom.y + 60, randomRoom.y + randomRoom.height - 60)
        );
      }

      this.moveArekTowards(this.arekTarget.x, this.arekTarget.y, delta);
    }

    this.updateCharacterViews();
  }

  private moveArekTowards(x: number, y: number, delta: number): void {
    const direction = new Phaser.Math.Vector2(x - this.arekPosition.x, y - this.arekPosition.y);
    if (direction.lengthSq() <= 1) {
      return;
    }

    direction.normalize();
    const speed = this.getArekMoveSpeed();
    this.arekPosition.x += direction.x * speed * delta;
    this.arekPosition.y += direction.y * speed * delta;
    this.clampPosition(this.arekPosition, 30);
  }

  private clampPosition(position: Phaser.Math.Vector2, margin: number): void {
    position.x = Phaser.Math.Clamp(position.x, margin, this.currentLevel.width - margin);
    position.y = Phaser.Math.Clamp(position.y, margin, this.currentLevel.height - margin);
  }

  private findNearbyDirtyFurniture(): FurnitureState | undefined {
    return this.furnitureStates.find((item) => {
      if (item.state !== "dirty") {
        return false;
      }

      return (
        Phaser.Math.Distance.Between(
          this.playerPosition.x,
          this.playerPosition.y,
          item.data.x,
          item.data.y
        ) <= CLEAN_RANGE
      );
    });
  }

  private startCleaning(target: FurnitureState): void {
    this.cleaningFurniture = target;
    this.cleaningRemaining = CLEAN_DURATION;
    this.message = `LUIZA ogarnia: ${target.data.label}.`;
  }

  private finishCleaning(target: FurnitureState): void {
    this.cleaningFurniture = undefined;
    this.cleaningRemaining = 0;
    target.state = "clean";
    target.image.clearTint();
    target.aura.setFillStyle(0xa2f0bf, 0.26);
    target.dirt.setAlpha(0);
    target.sparkle.setAlpha(1);
    this.tweens.add({
      targets: [target.image, target.sparkle, target.aura],
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 180,
      yoyo: true
    });
    this.tweens.add({
      targets: target.aura,
      alpha: { from: 0.28, to: 0.12 },
      duration: 420,
      yoyo: true
    });
    this.score += 10;
    this.message = Phaser.Utils.Array.GetRandom(CLEAN_STATUS_LINES).replace(
      "{label}",
      target.data.label
    );
    this.playCleanVoiceLine();
  }

  private makeFurnitureDirty(target: FurnitureState): void {
    if (target.state !== "clean") {
      return;
    }

    target.state = "dirty";
    target.image.setTint(0xb78c7a);
    target.aura.setFillStyle(0xc56a4a, 0.2);
    target.dirt.setAlpha(0.95);
    target.sparkle.setAlpha(0);
    this.tweens.add({
      targets: [target.image, target.dirt],
      angle: { from: -3, to: 3 },
      duration: 90,
      yoyo: true,
      repeat: 1
    });
    this.score = Math.max(0, this.score - 5);
    this.message = Phaser.Utils.Array.GetRandom(AREK_MESS_LINES).replace(
      "{label}",
      target.data.label
    );
    this.playArekVoiceLine();
  }

  private startArekDirtying(target: FurnitureState): void {
    if (target.state !== "clean") {
      return;
    }

    this.arekDirtyFurniture = target;
    this.arekDirtyRemaining = this.getArekDirtyDuration();
    this.message = `AREK bałagani przy: ${target.data.label}.`;
  }

  private finishArekDirtying(target: FurnitureState): void {
    this.arekDirtyFurniture = undefined;
    this.arekDirtyRemaining = 0;
    this.makeFurnitureDirty(target);
  }

  private chooseArekTarget(cleanFurniture: FurnitureState[]): FurnitureState {
    const byArek = [...cleanFurniture].sort((a, b) => {
      const distanceA = Phaser.Math.Distance.Between(
        this.arekPosition.x,
        this.arekPosition.y,
        a.data.x,
        a.data.y
      );
      const distanceB = Phaser.Math.Distance.Between(
        this.arekPosition.x,
        this.arekPosition.y,
        b.data.x,
        b.data.y
      );

      return distanceA - distanceB;
    });

    if (this.levelIndex === 0) {
      return byArek[0];
    }

    const byLuiza = [...cleanFurniture].sort((a, b) => {
      const distanceA = Phaser.Math.Distance.Between(
        this.playerPosition.x,
        this.playerPosition.y,
        a.data.x,
        a.data.y
      );
      const distanceB = Phaser.Math.Distance.Between(
        this.playerPosition.x,
        this.playerPosition.y,
        b.data.x,
        b.data.y
      );

      return distanceA - distanceB;
    });

    if (this.levelIndex === 1) {
      return Math.random() < 0.45 ? byLuiza[0] : byArek[0];
    }

    return Math.random() < 0.7 ? byLuiza[0] : byArek[0];
  }

  private getArekMoveSpeed(): number {
    const cleanCount = this.furnitureStates.filter((item) => item.state === "clean").length;
    const levelBonus = [1, 1.08, 1.18][this.levelIndex] ?? 1.2;
    const pressureBonus = cleanCount >= 4 ? 1.08 : 1;
    return this.currentLevel.arekSpeed * levelBonus * pressureBonus;
  }

  private getArekDirtyDuration(): number {
    const multiplier = [1, 0.86, 0.72][this.levelIndex] ?? 0.68;
    return AREK_DIRTY_DURATION * multiplier;
  }

  private updateCharacterViews(): void {
    if (this.playerView) {
      const bob =
        this.cleaningRemaining > 0
          ? Math.sin(this.time.now / 70) * 6
          : Math.sin(this.time.now / 180) * 2;
      this.playerView.shadow.setPosition(this.playerPosition.x, this.playerPosition.y + 18);
      this.playerView.aura.setPosition(this.playerPosition.x, this.playerPosition.y + 2 + bob);
      this.playerView.sprite.setPosition(this.playerPosition.x, this.playerPosition.y + bob);
      this.playerView.label.setPosition(this.playerPosition.x, this.playerPosition.y + 34 + bob);
      if (this.cleaningRemaining <= 0) {
        this.playerView.sprite.setRotation(0);
      }
    }

    if (this.arekView) {
      const bob =
        this.arekDirtyRemaining > 0
          ? Math.sin((this.time.now + 60) / 80) * 4
          : Math.sin((this.time.now + 120) / 220) *
            (this.activeAbility?.name === "foch" ? 0.5 : 2.5);
      this.arekView.shadow.setPosition(this.arekPosition.x, this.arekPosition.y + 18);
      this.arekView.aura.setPosition(this.arekPosition.x, this.arekPosition.y + 2 + bob);
      this.arekView.sprite.setPosition(this.arekPosition.x, this.arekPosition.y + bob);
      this.arekView.label.setPosition(this.arekPosition.x, this.arekPosition.y + 32 + bob);
      this.arekView.sprite.setRotation(
        this.arekDirtyRemaining > 0
          ? Math.sin(this.time.now / 55) * 0.1
          : this.activeAbility?.name === "foch"
            ? -0.06
            : 0
      );
    }

    this.cameras.main.centerOn(
      this.currentLevel.width / 2,
      this.currentLevel.height / 2
    );
  }

  private animateCleaning(): void {
    if (!this.playerView) {
      return;
    }

    const swing = Math.sin(this.time.now / 45) * 0.16;
    this.playerView.sprite.setRotation(swing);
  }

  private animateArekDirtying(): void {
    if (!this.arekView) {
      return;
    }

    this.arekView.sprite.setRotation(Math.sin(this.time.now / 55) * 0.1);
  }

  private updateCooldowns(delta: number): void {
    this.abilityCooldowns.trashOut = Math.max(0, this.abilityCooldowns.trashOut - delta);
    this.abilityCooldowns.foch = Math.max(0, this.abilityCooldowns.foch - delta);
  }

  private updateActiveAbility(delta: number): void {
    if (!this.activeAbility) {
      return;
    }

    this.activeAbility.remaining -= delta;
    if (this.activeAbility.remaining <= 0) {
      const endedAbility = this.activeAbility.name;
      this.activeAbility = null;
      if (endedAbility === "trashOut") {
        this.message = "AREK wraca po wyniesieniu śmieci.";
      } else {
        this.message = "Foch minął. AREK znów chodzi po mieszkaniu.";
      }
    }
  }

  private checkFullClean(): void {
    const allClean = this.furnitureStates.every((item) => item.state === "clean");

    if (allClean && !this.lastAllCleanState) {
      this.score += BONUS_ALL_CLEAN;
      this.message = `Pełny porządek! Bonus +${BONUS_ALL_CLEAN}.`;
      this.fullCleanPending = true;
      this.showLevelCompleteOverlay();
    }

    this.lastAllCleanState = allClean;
  }

  private advanceLevel(): void {
    if (!this.fullCleanPending) {
      return;
    }

    this.fullCleanPending = false;
    if (this.levelIndex >= LEVELS.length - 1) {
      this.finishGame(true);
      return;
    }

    this.pendingLevelIndex = this.levelIndex + 1;
  }

  private showLevelCompleteOverlay(): void {
    this.overlayVisible = true;
    this.advanceLevel();

    if (this.gameEnded) {
      return;
    }

    this.overlayUpdater({
      visible: true,
      eyebrow: "POZIOM UKOŃCZONY",
      title: `Poziom ${this.levelIndex + 1} ogarnięty!`,
      quote: Phaser.Utils.Array.GetRandom(LEVEL_COMPLETE_QUOTES),
      buttonLabel:
        this.pendingLevelIndex === null ? "Zobacz wynik" : `Wejdź na poziom ${this.levelIndex + 2}`,
      avatar: "luiza"
    });
  }

  private finishGame(victory: boolean): void {
    this.gameEnded = true;
    this.clearAudioQueue();
    this.message = victory
      ? `Brawo! LUIZA ogarnęła wszystkie poziomy z wynikiem ${this.score}.`
      : `Czas minął. Końcowy wynik LUIZY: ${this.score}.`;
    this.pendingRestart = true;
    this.overlayVisible = true;
    this.overlayUpdater({
      visible: true,
      eyebrow: victory ? "WIELKI FINAŁ" : "KONIEC GRY",
      title: victory ? "Luiza wygrywa!" : "Czas minął!",
      quote: victory
        ? `Końcowy wynik: ${this.score}. Nawet Arek przyznaje, że to mieszkanie lśni.`
        : `Końcowy wynik: ${this.score}. Luiza bierze oddech i zaraz rusza od nowa.`,
      buttonLabel: "Zagraj od nowa",
      avatar: victory ? "luiza" : "arek"
    });
    this.syncHud();
  }

  private handleLevelTimeout(): void {
    if (this.levelIndex >= LEVELS.length - 1) {
      this.finishGame(false);
      return;
    }

    this.message = `Koniec czasu. Przechodzisz do poziomu ${this.levelIndex + 2}.`;
    this.pendingLevelIndex = this.levelIndex + 1;
    this.overlayVisible = true;
    this.overlayUpdater({
      visible: true,
      eyebrow: "KONIEC CZASU",
      title: `Poziom ${this.levelIndex + 1} zamknięty`,
      quote: Phaser.Utils.Array.GetRandom(TIMEOUT_QUOTES),
      buttonLabel: "Do kolejnego poziomu",
      avatar: "luiza"
    });
  }

  private syncHud(): void {
    this.hudUpdater({
      score: this.score,
      timeLeft: Math.ceil(this.timeLeft),
      levelIndex: this.levelIndex + 1,
      levelCount: LEVELS.length,
      trashOutReady:
        this.gameStarted &&
        !this.gameEnded &&
        !this.overlayVisible &&
        this.abilityCooldowns.trashOut <= 0 &&
        this.activeAbility === null,
      fochReady:
        this.gameStarted &&
        !this.gameEnded &&
        !this.overlayVisible &&
        this.abilityCooldowns.foch <= 0 &&
        this.activeAbility === null,
      trashOutCooldown: this.abilityCooldowns.trashOut,
      fochCooldown: this.abilityCooldowns.foch,
      message: this.message
    });
  }

  private hideOverlay(): void {
    this.overlayVisible = false;
    this.overlayUpdater({
      visible: false,
      eyebrow: "",
      title: "",
      quote: "",
      buttonLabel: "",
      avatar: "luiza"
    });
  }

  private async resumeAudioContext(): Promise<void> {
    const context = this.sound.context;
    if (!context || context.state !== "suspended") {
      return;
    }

    try {
      await context.resume();
    } catch (error) {
      console.warn("Nie udało się wznowić kontekstu audio.", error);
    }
  }

  private tickMusic(): void {
    if (!this.audioEnabled || !this.gameStarted || this.gameEnded || this.overlayVisible) {
      return;
    }

    const context = this.sound.context;
    if (!context || context.state !== "running") {
      return;
    }

    const frequency = MUSIC_NOTES[this.musicStep % MUSIC_NOTES.length];
    const startAt = context.currentTime;
    const noteLength = 0.12;

    const lead = context.createOscillator();
    const leadGain = context.createGain();
    lead.type = "triangle";
    lead.frequency.setValueAtTime(frequency, startAt);
    lead.connect(leadGain);
    leadGain.connect(context.destination);
    leadGain.gain.setValueAtTime(0.0001, startAt);
    leadGain.gain.exponentialRampToValueAtTime(0.024, startAt + 0.016);
    leadGain.gain.exponentialRampToValueAtTime(0.0001, startAt + noteLength);
    lead.start(startAt);
    lead.stop(startAt + noteLength + 0.02);

    if (this.musicStep % 2 === 0) {
      const bass = context.createOscillator();
      const bassGain = context.createGain();
      bass.type = "sine";
      bass.frequency.setValueAtTime(frequency / 2, startAt);
      bass.connect(bassGain);
      bassGain.connect(context.destination);
      bassGain.gain.setValueAtTime(0.0001, startAt);
      bassGain.gain.exponentialRampToValueAtTime(0.013, startAt + 0.016);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, startAt + noteLength + 0.03);
      bass.start(startAt);
      bass.stop(startAt + noteLength + 0.05);
    }

    this.musicStep += 1;
  }

  private clearAudioQueue(): void {
    this.audioQueueToken += 1;
    this.audioQueue = Promise.resolve();
    this.stopVoiceLine();
  }

  private enqueueAudioAction(
    action: (token: number) => Promise<void>
  ): void {
    if (!this.audioEnabled) {
      return;
    }

    const token = this.audioQueueToken;
    this.audioQueue = this.audioQueue
      .then(() => {
        if (!this.audioEnabled || token !== this.audioQueueToken) {
          return;
        }

        return action(token);
      })
      .catch(() => undefined);
  }

  private speakQueuedLine(
    text: string,
    voiceKind: "female" | "male",
    options: { rate: number; pitch: number; volume: number },
    token: number
  ): Promise<void> {
    if (
      !this.audioEnabled ||
      token !== this.audioQueueToken ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pl-PL";
      utterance.rate = options.rate;
      utterance.pitch = options.pitch;
      utterance.volume = options.volume;

      const voice =
        voiceKind === "female"
          ? this.getPreferredFemaleVoice()
          : this.getPreferredMaleVoice();

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  private getPreferredFemaleVoice(): SpeechSynthesisVoice | undefined {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return undefined;
    }

    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(
        (voice) => voice.name.toLowerCase() === "microsoft paulina - polish (poland)"
      ) ??
      voices.find((voice) => voice.name.toLowerCase().includes("paulina")) ??
      voices.find((voice) => voice.name.toLowerCase().includes("google polski")) ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith("pl"))
    );
  }

  private getPreferredMaleVoice(): SpeechSynthesisVoice | undefined {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return undefined;
    }

    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(
        (voice) => voice.name.toLowerCase() === "microsoft adam - polish (poland)"
      ) ??
      voices.find((voice) => voice.name.toLowerCase().includes("adam")) ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith("pl"))
    );
  }

  private playPingQueued(token: number): Promise<void> {
    if (!this.audioEnabled || token !== this.audioQueueToken) {
      return Promise.resolve();
    }

    return this.playToneQueued(
      token,
      (context, startAt) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(1174.66, startAt);
        oscillator.frequency.linearRampToValueAtTime(1567.98, startAt + 0.11);
        oscillator.connect(gain);
        gain.connect(context.destination);
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.28);
        oscillator.start(startAt);
        oscillator.stop(startAt + 0.3);
      },
      320
    );
  }

  private playAccentQueued(token: number): Promise<void> {
    if (!this.audioEnabled || token !== this.audioQueueToken) {
      return Promise.resolve();
    }

    return this.playToneQueued(
      token,
      (context, startAt) => {
        const lead = context.createOscillator();
        const leadGain = context.createGain();
        lead.type = "square";
        lead.frequency.setValueAtTime(987.77, startAt);
        lead.frequency.linearRampToValueAtTime(1318.51, startAt + 0.11);
        lead.connect(leadGain);
        leadGain.connect(context.destination);
        leadGain.gain.setValueAtTime(0.0001, startAt);
        leadGain.gain.exponentialRampToValueAtTime(0.045, startAt + 0.012);
        leadGain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.2);
        lead.start(startAt);
        lead.stop(startAt + 0.22);

        const bass = context.createOscillator();
        const bassGain = context.createGain();
        bass.type = "triangle";
        bass.frequency.setValueAtTime(493.88, startAt);
        bass.connect(bassGain);
        bassGain.connect(context.destination);
        bassGain.gain.setValueAtTime(0.0001, startAt);
        bassGain.gain.exponentialRampToValueAtTime(0.03, startAt + 0.015);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.18);
        bass.start(startAt);
        bass.stop(startAt + 0.2);
      },
      240
    );
  }

  private playToneQueued(
    token: number,
    play: (context: AudioContext, startAt: number) => void,
    durationMs: number
  ): Promise<void> {
    const context = this.sound.context;
    if (!context || context.state !== "running" || token !== this.audioQueueToken) {
      return Promise.resolve();
    }

    play(context, context.currentTime);
    return new Promise((resolve) => {
      window.setTimeout(resolve, durationMs);
    });
  }

  private drawRoomDecor(graphics: Phaser.GameObjects.Graphics, room: RoomData): void {
    graphics.lineStyle(2, 0xffffff, 0.2);

    if (room.id === "kitchen" || room.id === "bath" || room.id === "laundry") {
      for (let x = room.x + 24; x < room.x + room.width - 16; x += 34) {
        for (let y = room.y + 48; y < room.y + room.height - 16; y += 34) {
          graphics.strokeRoundedRect(x, y, 18, 18, 5);
        }
      }
      return;
    }

    if (room.id === "living" || room.id === "bedroom" || room.id === "kids") {
      for (let x = room.x + 18; x < room.x + room.width - 18; x += 24) {
        graphics.strokeLineShape(
          new Phaser.Geom.Line(x, room.y + 52, x + 10, room.y + room.height - 18)
        );
      }
      graphics.fillStyle(0xffffff, 0.13);
      graphics.fillRoundedRect(
        room.x + room.width * 0.22,
        room.y + room.height * 0.55,
        room.width * 0.36,
        room.height * 0.18,
        18
      );
      return;
    }

    if (room.id === "hall" || room.id === "study" || room.id === "office") {
      for (let y = room.y + 54; y < room.y + room.height - 16; y += 20) {
        graphics.strokeLineShape(
          new Phaser.Geom.Line(room.x + 18, y, room.x + room.width - 18, y)
        );
      }
      return;
    }

    if (room.id === "dining" || room.id === "closet") {
      graphics.fillStyle(0xffffff, 0.1);
      graphics.fillRoundedRect(
        room.x + room.width * 0.18,
        room.y + room.height * 0.22,
        room.width * 0.52,
        room.height * 0.24,
        20
      );
      for (let y = room.y + 54; y < room.y + room.height - 20; y += 24) {
        graphics.strokeLineShape(
          new Phaser.Geom.Line(room.x + 18, y, room.x + room.width - 18, y)
        );
      }
    }
  }

  private fitCameraToLevel(): void {
    const viewportWidth = this.scale.width;
    const viewportHeight = this.scale.height;
    const zoom = Math.min(
      viewportWidth / this.currentLevel.width,
      viewportHeight / this.currentLevel.height
    );

    this.cameras.main.setZoom(zoom);
    this.cameras.main.centerOn(
      this.currentLevel.width / 2,
      this.currentLevel.height / 2
    );
  }

  private startCleaningSound(): void {
    const context = this.sound.context;
    if (!context || this.cleaningOscillator) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(480, context.currentTime);
    oscillator.frequency.linearRampToValueAtTime(720, context.currentTime + 0.15);
    oscillator.frequency.linearRampToValueAtTime(560, context.currentTime + 0.3);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.04, context.currentTime + 0.05);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();

    this.cleaningOscillator = oscillator;
    this.cleaningGain = gain;
  }

  private stopCleaningSound(): void {
    const context = this.sound.context;
    if (!context || !this.cleaningOscillator || !this.cleaningGain) {
      return;
    }

    const stopAt = context.currentTime + 0.04;
    this.cleaningGain.gain.cancelScheduledValues(context.currentTime);
    this.cleaningGain.gain.setValueAtTime(
      Math.max(0.0001, this.cleaningGain.gain.value),
      context.currentTime
    );
    this.cleaningGain.gain.exponentialRampToValueAtTime(0.0001, stopAt);
    this.cleaningOscillator.stop(stopAt + 0.01);
    this.cleaningOscillator.disconnect();
    this.cleaningGain.disconnect();
    this.cleaningOscillator = undefined;
    this.cleaningGain = undefined;
  }

  private playCleanVoiceLine(): void {
    if (!this.audioEnabled) {
      return;
    }

    const now = window.performance.now();
    if (now - this.lastVoiceAt < 1400) {
      return;
    }
    this.lastVoiceAt = now;

    this.enqueueAudioAction((token) =>
      this.speakQueuedLine(
        Phaser.Utils.Array.GetRandom(CLEAN_VOICE_LINES),
        "female",
        CLEAN_VOICE_CONFIG,
        token
      )
    );
  }

  private playSpecialAbilityVoice(name: AbilityName): void {
    if (!this.audioEnabled) {
      return;
    }

    this.enqueueAudioAction((token) => this.playPingQueued(token));
    this.enqueueAudioAction((token) =>
      this.speakQueuedLine(
        SPECIAL_VOICE_LINES[name],
        "female",
        SPECIAL_VOICE_CONFIG[name],
        token
      )
    );
    this.enqueueAudioAction((token) => this.playAccentQueued(token));
  }

  private playArekVoiceLine(): void {
    if (!this.audioEnabled) {
      return;
    }

    this.enqueueAudioAction((token) =>
      this.speakQueuedLine(
        Phaser.Utils.Array.GetRandom(AREK_VOICE_LINES),
        "male",
        AREK_VOICE_CONFIG,
        token
      )
    );
  }

  private stopVoiceLine(): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
  }

  private setArekVisibility(visible: boolean): void {
    this.arekView?.shadow.setVisible(visible);
    this.arekView?.aura.setVisible(visible);
    this.arekView?.sprite.setVisible(visible);
    this.arekView?.label.setVisible(visible);
  }

  private applyAvatarVariant(): void {
    if (this.playerView) {
      const size = this.getCharacterDisplaySize("luiza");
      this.playerView.sprite.setTexture(this.resolveCharacterTexture("luiza"));
      this.playerView.sprite.setDisplaySize(size.width, size.height);
    }

    if (this.arekView) {
      const size = this.getCharacterDisplaySize("arek");
      this.arekView.sprite.setTexture(this.resolveCharacterTexture("arek"));
      this.arekView.sprite.setDisplaySize(size.width, size.height);
    }
  }

  private resolveCharacterTexture(kind: "luiza" | "arek"): string {
    if (this.avatarVariant === 2) {
      return `character-${kind}-alt`;
    }

    if (kind === "luiza" && this.textures.exists("character-luiza-photo")) {
      return "character-luiza-photo";
    }

    if (kind === "arek" && this.textures.exists("character-arek-photo")) {
      return "character-arek-photo";
    }

    return `character-${kind}`;
  }

  private getCharacterDisplaySize(
    kind: "luiza" | "arek"
  ): { width: number; height: number } {
    if (this.avatarVariant === 2) {
      return kind === "luiza"
        ? { width: 42, height: 72 }
        : { width: 40, height: 68 };
    }

    return kind === "luiza"
      ? { width: 48, height: 74 }
      : { width: 44, height: 66 };
  }

  private resolveFurnitureSprite(id: string): FurnitureSpriteKey {
    if (id.includes("shoe")) return "shoe";
    if (id.includes("bench")) return "bench";
    if (id.includes("fridge")) return "fridge";
    if (id.includes("dining")) return "diningTable";
    if (id.includes("table")) return "table";
    if (id.includes("stove")) return "stove";
    if (id.includes("bathtub")) return "bathtub";
    if (id.includes("sink")) return "sink";
    if (id.includes("bed")) return "bed";
    if (id.includes("closet")) return "closet";
    if (id.includes("sofa")) return "sofa";
    if (id.includes("coffee")) return "coffee";
    if (id.includes("tv")) return "tv";
    if (id.includes("washing")) return "washing";
    if (id.includes("basket")) return "basket";
    if (id.includes("counter")) return "counter";
    if (id.includes("desk")) return "desk";
    if (id.includes("shelf")) return "shelf";
    if (id.includes("toybox")) return "toybox";
    if (id.includes("chair")) return "chair";
    if (id.includes("lamp")) return "lamp";
    if (id.includes("wardrobe")) return "wardrobe";
    return "table";
  }

  private createProceduralTextures(): void {
    if (this.textures.exists("character-luiza")) {
      return;
    }

    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    const generate = (key: string, width: number, height: number, draw: () => void): void => {
      graphics.clear();
      draw();
      graphics.generateTexture(key, width, height);
    };

    generate("fx-dirt", 48, 48, () => {
      graphics.fillStyle(0x7e5546, 0.95);
      graphics.fillCircle(16, 16, 8);
      graphics.fillCircle(24, 26, 11);
      graphics.fillCircle(34, 18, 7);
      graphics.fillCircle(18, 32, 7);
    });

    generate("fx-sparkle", 40, 40, () => {
      graphics.fillStyle(0xfff3a0, 1);
      graphics.fillTriangle(20, 3, 25, 20, 15, 20);
      graphics.fillTriangle(37, 20, 20, 25, 20, 15);
      graphics.fillTriangle(20, 37, 25, 20, 15, 20);
      graphics.fillTriangle(3, 20, 20, 25, 20, 15);
      graphics.fillStyle(0xffffff, 0.95);
      graphics.fillCircle(20, 20, 4);
    });

    generate("character-luiza", 64, 92, () => {
      graphics.fillStyle(0xefd0a6, 1);
      graphics.fillCircle(32, 20, 14);
      graphics.fillStyle(0xf1cf58, 1);
      graphics.fillRoundedRect(14, 4, 36, 28, 14);
      graphics.fillRoundedRect(16, 16, 12, 26, 6);
      graphics.fillRoundedRect(36, 16, 12, 26, 6);
      graphics.fillStyle(0xff75a3, 1);
      graphics.fillRoundedRect(18, 34, 28, 28, 10);
      graphics.fillStyle(0xf4fff9, 1);
      graphics.fillRoundedRect(24, 38, 16, 18, 6);
      graphics.fillStyle(0xefd0a6, 1);
      graphics.fillRoundedRect(10, 38, 8, 20, 4);
      graphics.fillRoundedRect(46, 38, 8, 20, 4);
      graphics.fillRoundedRect(22, 60, 8, 22, 4);
      graphics.fillRoundedRect(34, 60, 8, 22, 4);
      graphics.fillStyle(0xf36b8f, 1);
      graphics.fillRoundedRect(20, 78, 10, 8, 4);
      graphics.fillRoundedRect(34, 78, 10, 8, 4);
    });

    generate("character-arek", 64, 88, () => {
      graphics.fillStyle(0xedcea6, 1);
      graphics.fillCircle(32, 20, 14);
      graphics.fillStyle(0xf0d05b, 1);
      graphics.fillRoundedRect(18, 6, 28, 18, 8);
      graphics.fillStyle(0x69a6ff, 1);
      graphics.fillRoundedRect(18, 34, 28, 26, 8);
      graphics.fillStyle(0xedcea6, 1);
      graphics.fillRoundedRect(11, 38, 8, 18, 4);
      graphics.fillRoundedRect(45, 38, 8, 18, 4);
      graphics.fillRoundedRect(22, 60, 8, 22, 4);
      graphics.fillRoundedRect(34, 60, 8, 22, 4);
      graphics.fillStyle(0x2f5ba5, 1);
      graphics.fillRoundedRect(20, 78, 10, 8, 4);
      graphics.fillRoundedRect(34, 78, 10, 8, 4);
    });

    generate("character-luiza-alt", 96, 128, () => {
      graphics.fillStyle(0xf1d3b2, 1);
      graphics.fillCircle(48, 24, 16);
      graphics.fillStyle(0xf3d14b, 1);
      graphics.fillCircle(48, 18, 20);
      graphics.fillRoundedRect(22, 12, 20, 24, 10);
      graphics.fillRoundedRect(54, 12, 20, 24, 10);
      graphics.fillRoundedRect(24, 10, 48, 12, 8);
      graphics.fillStyle(0xf8e46b, 1);
      graphics.fillRoundedRect(30, 20, 36, 12, 6);
      graphics.fillStyle(0x2b211e, 0.72);
      graphics.fillCircle(42, 24, 2);
      graphics.fillCircle(54, 24, 2);
      graphics.fillStyle(0xff9ab8, 1);
      graphics.fillCircle(38, 30, 3);
      graphics.fillCircle(58, 30, 3);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRoundedRect(36, 40, 24, 18, 8);
      graphics.fillStyle(0xff86ab, 1);
      graphics.fillRoundedRect(32, 54, 32, 20, 10);
      graphics.fillStyle(0xffbfd3, 1);
      graphics.fillTriangle(24, 66, 48, 102, 72, 66);
      graphics.fillStyle(0xf8fff9, 1);
      graphics.fillTriangle(33, 68, 48, 93, 63, 68);
      graphics.fillStyle(0xf1d3b2, 1);
      graphics.fillRoundedRect(20, 48, 8, 24, 4);
      graphics.fillRoundedRect(68, 48, 8, 24, 4);
      graphics.fillRoundedRect(41, 100, 7, 18, 4);
      graphics.fillRoundedRect(49, 100, 7, 18, 4);
      graphics.fillStyle(0xf05c8f, 1);
      graphics.fillRoundedRect(38, 116, 12, 6, 4);
      graphics.fillRoundedRect(50, 116, 12, 6, 4);
    });

    generate("character-arek-alt", 96, 128, () => {
      graphics.fillStyle(0xedcea6, 1);
      graphics.fillCircle(48, 22, 16);
      graphics.fillStyle(0xf0d05b, 1);
      graphics.fillRoundedRect(28, 6, 40, 18, 10);
      graphics.fillTriangle(22, 18, 48, 4, 70, 18);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRoundedRect(36, 40, 24, 30, 8);
      graphics.fillStyle(0x1490a6, 1);
      graphics.fillRoundedRect(24, 36, 14, 42, 8);
      graphics.fillRoundedRect(58, 36, 14, 42, 8);
      graphics.fillRoundedRect(34, 34, 28, 14, 8);
      graphics.fillStyle(0xedcea6, 1);
      graphics.fillRoundedRect(20, 44, 8, 30, 4);
      graphics.fillRoundedRect(68, 44, 8, 30, 4);
      graphics.fillRoundedRect(40, 84, 8, 28, 4);
      graphics.fillRoundedRect(50, 84, 8, 28, 4);
      graphics.fillStyle(0x304f86, 1);
      graphics.fillRoundedRect(38, 112, 12, 8, 4);
      graphics.fillRoundedRect(50, 112, 12, 8, 4);
      graphics.fillStyle(0x6d4b3e, 0.95);
      graphics.fillRoundedRect(35, 30, 26, 10, 5);
    });

    this.generateFurnitureTexture(generate, "furniture-shoe", 96, 64, () => {
      graphics.fillStyle(0xb7805f, 1);
      graphics.fillRoundedRect(14, 22, 68, 28, 8);
      graphics.fillStyle(0xe8c8a7, 1);
      graphics.fillRoundedRect(18, 14, 60, 14, 6);
      graphics.lineStyle(3, 0x85553d, 1);
      graphics.strokeLineShape(new Phaser.Geom.Line(28, 36, 68, 36));
    });
    this.generateFurnitureTexture(generate, "furniture-bench", 96, 64, () => {
      graphics.fillStyle(0xb27959, 1);
      graphics.fillRoundedRect(14, 20, 68, 14, 6);
      graphics.fillRoundedRect(20, 36, 12, 18, 4);
      graphics.fillRoundedRect(64, 36, 12, 18, 4);
    });
    this.generateFurnitureTexture(generate, "furniture-fridge", 72, 108, () => {
      graphics.fillStyle(0xe5f9ff, 1);
      graphics.fillRoundedRect(12, 10, 48, 88, 12);
      graphics.fillStyle(0xc6edf8, 1);
      graphics.fillRoundedRect(16, 14, 40, 38, 10);
      graphics.lineStyle(3, 0x8bb7c4, 1);
      graphics.strokeLineShape(new Phaser.Geom.Line(24, 58, 24, 84));
      graphics.strokeLineShape(new Phaser.Geom.Line(48, 24, 48, 44));
    });
    this.generateFurnitureTexture(generate, "furniture-table", 112, 86, () => {
      graphics.fillStyle(0xd39a6f, 1);
      graphics.fillRoundedRect(12, 14, 88, 26, 10);
      graphics.fillRoundedRect(22, 40, 10, 28, 4);
      graphics.fillRoundedRect(80, 40, 10, 28, 4);
    });
    this.generateFurnitureTexture(generate, "furniture-stove", 96, 72, () => {
      graphics.fillStyle(0x8c9298, 1);
      graphics.fillRoundedRect(14, 18, 68, 42, 10);
      graphics.fillStyle(0xffd489, 1);
      graphics.fillCircle(30, 34, 8);
      graphics.fillCircle(66, 34, 8);
      graphics.fillCircle(30, 50, 8);
      graphics.fillCircle(66, 50, 8);
    });
    this.generateFurnitureTexture(generate, "furniture-bathtub", 112, 74, () => {
      graphics.fillStyle(0xe9fbff, 1);
      graphics.fillRoundedRect(14, 18, 84, 34, 16);
      graphics.lineStyle(4, 0xb7dde8, 1);
      graphics.strokeRoundedRect(14, 18, 84, 34, 16);
      graphics.fillStyle(0xc6e5ef, 1);
      graphics.fillCircle(28, 54, 6);
      graphics.fillCircle(84, 54, 6);
    });
    this.generateFurnitureTexture(generate, "furniture-sink", 84, 68, () => {
      graphics.fillStyle(0xf1fdff, 1);
      graphics.fillRoundedRect(20, 18, 44, 28, 10);
      graphics.lineStyle(4, 0x9fc8d4, 1);
      graphics.strokeRoundedRect(20, 18, 44, 28, 10);
      graphics.fillStyle(0xa8b3bb, 1);
      graphics.fillRoundedRect(36, 8, 8, 16, 4);
      graphics.fillRoundedRect(32, 46, 16, 14, 4);
    });
    this.generateFurnitureTexture(generate, "furniture-bed", 128, 86, () => {
      graphics.fillStyle(0xf7d7eb, 1);
      graphics.fillRoundedRect(20, 16, 88, 50, 16);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRoundedRect(24, 20, 28, 20, 8);
      graphics.fillStyle(0xe0b3cb, 1);
      graphics.fillRoundedRect(20, 58, 88, 10, 4);
      graphics.fillStyle(0xa57861, 1);
      graphics.fillRoundedRect(26, 66, 10, 12, 4);
      graphics.fillRoundedRect(92, 66, 10, 12, 4);
    });
    this.generateFurnitureTexture(generate, "furniture-closet", 96, 84, () => {
      graphics.fillStyle(0xcc9966, 1);
      graphics.fillRoundedRect(18, 12, 60, 58, 8);
      graphics.lineStyle(3, 0x936842, 1);
      graphics.strokeLineShape(new Phaser.Geom.Line(48, 14, 48, 68));
      graphics.fillStyle(0xf7e18f, 1);
      graphics.fillCircle(42, 40, 3);
      graphics.fillCircle(54, 40, 3);
    });
    this.generateFurnitureTexture(generate, "furniture-sofa", 126, 82, () => {
      graphics.fillStyle(0x8fc3f4, 1);
      graphics.fillRoundedRect(18, 28, 90, 30, 12);
      graphics.fillRoundedRect(10, 22, 20, 36, 10);
      graphics.fillRoundedRect(96, 22, 20, 36, 10);
      graphics.fillRoundedRect(24, 12, 78, 22, 10);
    });
    this.generateFurnitureTexture(generate, "furniture-coffee", 88, 62, () => {
      graphics.fillStyle(0xc98c61, 1);
      graphics.fillRoundedRect(16, 16, 56, 20, 8);
      graphics.fillRoundedRect(24, 36, 8, 14, 3);
      graphics.fillRoundedRect(56, 36, 8, 14, 3);
    });
    this.generateFurnitureTexture(generate, "furniture-tv", 98, 64, () => {
      graphics.fillStyle(0x2c3137, 1);
      graphics.fillRoundedRect(14, 10, 70, 38, 8);
      graphics.fillStyle(0x8bb6ff, 1);
      graphics.fillRoundedRect(20, 16, 58, 26, 6);
      graphics.fillStyle(0x6d4e3c, 1);
      graphics.fillRoundedRect(42, 48, 14, 10, 4);
    });
    this.generateFurnitureTexture(generate, "furniture-diningTable", 120, 90, () => {
      graphics.fillStyle(0xd5a06e, 1);
      graphics.fillRoundedRect(18, 18, 84, 26, 10);
      graphics.fillRoundedRect(28, 44, 10, 24, 4);
      graphics.fillRoundedRect(82, 44, 10, 24, 4);
      graphics.fillStyle(0x8ac594, 1);
      graphics.fillRoundedRect(4, 28, 16, 22, 6);
      graphics.fillRoundedRect(100, 28, 16, 22, 6);
    });
    this.generateFurnitureTexture(generate, "furniture-washing", 84, 84, () => {
      graphics.fillStyle(0xe3f9ff, 1);
      graphics.fillRoundedRect(14, 10, 56, 58, 12);
      graphics.fillStyle(0x7ec7f7, 1);
      graphics.fillCircle(42, 40, 16);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(42, 40, 7);
      graphics.fillStyle(0xc1d7de, 1);
      graphics.fillCircle(28, 22, 4);
      graphics.fillCircle(42, 22, 4);
    });
    this.generateFurnitureTexture(generate, "furniture-basket", 84, 68, () => {
      graphics.fillStyle(0xdca56e, 1);
      graphics.fillRoundedRect(18, 18, 48, 34, 12);
      graphics.lineStyle(3, 0xb47b44, 1);
      graphics.strokeRoundedRect(18, 18, 48, 34, 12);
      graphics.strokeLineShape(new Phaser.Geom.Line(30, 18, 54, 18));
      graphics.strokeLineShape(new Phaser.Geom.Line(30, 18, 26, 28));
      graphics.strokeLineShape(new Phaser.Geom.Line(54, 18, 58, 28));
    });
    this.generateFurnitureTexture(generate, "furniture-counter", 112, 72, () => {
      graphics.fillStyle(0xe9d6b8, 1);
      graphics.fillRoundedRect(14, 16, 84, 18, 8);
      graphics.fillStyle(0xcaa27c, 1);
      graphics.fillRoundedRect(14, 34, 84, 24, 8);
      graphics.lineStyle(3, 0xa37b54, 1);
      graphics.strokeLineShape(new Phaser.Geom.Line(42, 34, 42, 58));
      graphics.strokeLineShape(new Phaser.Geom.Line(70, 34, 70, 58));
    });
    this.generateFurnitureTexture(generate, "furniture-desk", 112, 76, () => {
      graphics.fillStyle(0xc99568, 1);
      graphics.fillRoundedRect(14, 16, 82, 20, 8);
      graphics.fillRoundedRect(22, 36, 10, 24, 4);
      graphics.fillRoundedRect(78, 36, 10, 24, 4);
      graphics.fillStyle(0xf4da9f, 1);
      graphics.fillRoundedRect(64, 24, 26, 12, 4);
    });
    this.generateFurnitureTexture(generate, "furniture-shelf", 84, 108, () => {
      graphics.fillStyle(0xbd8b60, 1);
      graphics.fillRoundedRect(18, 10, 48, 82, 8);
      graphics.lineStyle(3, 0x8c623f, 1);
      graphics.strokeLineShape(new Phaser.Geom.Line(22, 34, 62, 34));
      graphics.strokeLineShape(new Phaser.Geom.Line(22, 58, 62, 58));
      graphics.strokeLineShape(new Phaser.Geom.Line(22, 80, 62, 80));
    });
    this.generateFurnitureTexture(generate, "furniture-toybox", 92, 72, () => {
      graphics.fillStyle(0xf5ba4c, 1);
      graphics.fillRoundedRect(16, 20, 60, 30, 10);
      graphics.fillStyle(0xffd978, 1);
      graphics.fillRoundedRect(20, 14, 52, 12, 8);
      graphics.fillStyle(0x8fd6ff, 1);
      graphics.fillCircle(34, 34, 6);
      graphics.fillStyle(0xff7da4, 1);
      graphics.fillCircle(50, 38, 6);
      graphics.fillStyle(0x95d797, 1);
      graphics.fillCircle(62, 32, 5);
    });
    this.generateFurnitureTexture(generate, "furniture-chair", 72, 82, () => {
      graphics.fillStyle(0xb77d59, 1);
      graphics.fillRoundedRect(18, 18, 36, 12, 6);
      graphics.fillRoundedRect(20, 30, 8, 32, 4);
      graphics.fillRoundedRect(44, 30, 8, 32, 4);
      graphics.fillRoundedRect(18, 10, 36, 10, 5);
    });
    this.generateFurnitureTexture(generate, "furniture-lamp", 72, 88, () => {
      graphics.fillStyle(0xffe28e, 1);
      graphics.fillTriangle(36, 10, 18, 36, 54, 36);
      graphics.fillStyle(0xc28a62, 1);
      graphics.fillRoundedRect(32, 36, 8, 26, 4);
      graphics.fillRoundedRect(24, 62, 24, 10, 5);
    });
    this.generateFurnitureTexture(generate, "furniture-wardrobe", 104, 92, () => {
      graphics.fillStyle(0xc89663, 1);
      graphics.fillRoundedRect(18, 12, 68, 64, 8);
      graphics.lineStyle(3, 0x956740, 1);
      graphics.strokeLineShape(new Phaser.Geom.Line(52, 14, 52, 74));
      graphics.fillStyle(0xf6e09a, 1);
      graphics.fillCircle(46, 42, 3);
      graphics.fillCircle(58, 42, 3);
    });

    graphics.destroy();
  }

  private generateFurnitureTexture(
    generate: (key: string, width: number, height: number, draw: () => void) => void,
    key: string,
    width: number,
    height: number,
    draw: () => void
  ): void {
    generate(key, width, height, draw);
  }

  private createFallbackTextures(): void {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    const fallback = (key: string, width: number, height: number, color: number): void => {
      if (this.textures.exists(key)) {
        return;
      }

      graphics.clear();
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, 0, width, height);
      graphics.generateTexture(key, width, height);
    };

    fallback("fx-dirt", 24, 24, 0x7e5546);
    fallback("fx-sparkle", 24, 24, 0xfff3a0);
    fallback("character-luiza", 32, 48, 0xff75a3);
    fallback("character-arek", 32, 48, 0x69a6ff);
    fallback("character-luiza-alt", 32, 48, 0xff75a3);
    fallback("character-arek-alt", 32, 48, 0x69a6ff);

    const furnitureKeys: FurnitureSpriteKey[] = [
      "shoe",
      "bench",
      "fridge",
      "table",
      "stove",
      "bathtub",
      "sink",
      "bed",
      "closet",
      "sofa",
      "coffee",
      "tv",
      "diningTable",
      "washing",
      "basket",
      "counter",
      "desk",
      "shelf",
      "toybox",
      "chair",
      "lamp",
      "wardrobe"
    ];

    furnitureKeys.forEach((key, index) => {
      fallback(`furniture-${key}`, 48, 48, 0xc99568 + index * 997);
    });

    graphics.destroy();
  }
}

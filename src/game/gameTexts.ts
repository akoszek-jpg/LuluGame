/**
 * PL: Etykiety i nazwy wyświetlane dla głównych postaci gry.
 * EN: Labels and names displayed for the main game characters.
 */
export const CHARACTER_DISPLAY_TEXT = {
  luizaName: "LUIZA",
  luizaAlt: "Luiza",
  arekName: "AREK",
  arekAlt: "Arek"
};

/**
 * PL: Teksty przycisków, przełączników i komunikatów interfejsu użytkownika.
 * EN: Text used by UI buttons, toggles, and interface messages.
 */
export const UI_TEXT = {
  requiredElementsError: "Nie znaleziono wymaganych elementów UI.",
  abilityTitles: {
    trashOut: "Wynieś śmieci",
    foch: "Foch"
  },
  abilityReady: "Gotowe",
  avatarVariantLabels: {
    first: "Wersja 1",
    second: "Wersja 2"
  },
  musicLabels: {
    enabled: "Włączona",
    disabled: "Wyłączona"
  },
  controlModeLabels: {
    mouse: "Myszka",
    classic: "Klasyczne"
  }
};

/**
 * PL: Teksty techniczne i logi diagnostyczne pokazywane w konsoli lub błędach.
 * EN: Technical messages and diagnostic logs shown in the console or errors.
 */
export const SYSTEM_LOG_TEXT = {
  textureFallbackError:
    "Nie udało się wygenerować głównych assetów, włączam fallback.",
  resumeAudioWarning: "Nie udało się wznowić kontekstu audio.",
  speechSynthesisUnavailable:
    "Speech Synthesis API nie jest dostępne w tej przeglądarce.",
  speechVoicesHeader: "Dostępne głosy syntezatora mowy:"
};

/**
 * PL: Teksty komunikatów HUD i krótkich statusów pokazywanych podczas rozgrywki.
 * EN: HUD messages and short status updates shown during gameplay.
 */
export const GAMEPLAY_TEXT = {
  defaultMessage: "Sprzątaj szybciej, niż AREK bałagani.",
  abilityMessages: {
    trashOut: "Wynieś śmieci! AREK maszeruje do drzwi.",
    foch: "Foch! AREK stoi i obraża się przez chwilę."
  },
  levelIntroPrompt: "Kliknij, aby Luiza ruszyła do sprzątania.",
  levelStart: "Start! LUIZA wkracza do akcji.",
  nextRoundStart: "Nowa runda! Luiza wraca do akcji.",
  trashOutHidden: "AREK wyniósł śmieci i na chwilę zniknął.",
  trashOutReturn: "AREK wrócił i znów szuka czystych rzeczy.",
  trashOutReturnAfterAbility:
    "AREK wrócił po wyniesieniu śmieci i znów rozgląda się za bałaganem.",
  fochFinished: "Foch minął. AREK znów chodzi po mieszkaniu.",
  cleaningInProgress: "LUIZA ogarnia: {label}.",
  arekDirtyingInProgress: "AREK bałagani przy: {label}.",
  fullCleanBonus: "Pełny porządek! Bonus +{bonus}.",
  levelTimeoutAdvance: "Koniec czasu. Przechodzisz do poziomu {level}.",
  levelFailureRestart:
    "AREK wygrał rundę bałaganu. Wracacie na poziom 1 z wynikiem {score}.",
  victoryScore:
    "Brawo! LUIZA ogarnęła wszystkie poziomy z wynikiem {score}.",
  defeatScore: "Czas minął. Końcowy wynik LUIZY: {score}.",
  levelLoaded: "Poziom {level}. Mieszkanie robi się coraz większe."
};

/**
 * PL: Cytaty i opisy sukcesu używane po zakończeniu czyszczenia lub gdy AREK robi bałagan.
 * EN: Success quotes and descriptions used after cleaning or when Arek makes a mess.
 */
export const GAMEPLAY_QUOTE_TEXT = {
  cleanStatusLines: [
    "Ekstra! {label} ląduje w stanie porządek.",
    "Super! {label} błyszczy jak nowe.",
    "Brawo! {label} wygląda jak z katalogu."
  ],
  arekMessLines: [
    "AREK znów nabroił przy: {label}.",
    "AREK zostawił chaos przy: {label}.",
    "AREK mruczy i psuje: {label}."
  ]
};

/**
 * PL: Teksty nakładek ekranowych pojawiających się po sukcesie, porażce lub końcu czasu.
 * EN: Overlay text shown after success, failure, or time running out.
 */
export const OVERLAY_TEXT = {
  levelComplete: {
    eyebrow: "POZIOM UKOŃCZONY",
    title: "Poziom {level} ogarnięty!",
    quoteOptions: [
      "Posprzątane, ale co ja widzę, Arek znowu idzie do kuchni!",
      "Posprzątane, a Arek już kombinuje, gdzie tu zrobić nowy bałagan!",
      "Porządek gotowy, tylko patrzeć jak Arek znów coś napsoci!"
    ],
    nextLevelButton: "Wejdź na poziom {level}",
    finalScoreButton: "Zobacz wynik"
  },
  finishGame: {
    victoryEyebrow: "WIELKI FINAŁ",
    defeatEyebrow: "KONIEC GRY",
    victoryTitle: "Luiza wygrywa!",
    defeatTitle: "Czas minął!",
    victoryQuote:
      "Końcowy wynik: {score}. Nawet Arek przyznaje, że to mieszkanie lśni.",
    defeatQuote:
      "Końcowy wynik: {score}. Luiza bierze oddech i zaraz rusza od nowa.",
    restartButton: "Zagraj od nowa"
  },
  timeoutAdvance: {
    eyebrow: "KONIEC CZASU",
    title: "Poziom {level} zamknięty",
    quoteOptions: [
      "Posprzątane, ale co ja widzę, Arek znowu idzie do kuchni!",
      "Posprzątane, a Arek już kombinuje, gdzie tu zrobić nowy bałagan!",
      "Porządek gotowy, tylko patrzeć jak Arek znów coś napsoci!"
    ],
    button: "Do kolejnego poziomu"
  },
  timeoutRestart: {
    eyebrow: "AREK MA UBaw",
    title: "Oops, bałagan wygrywa!",
    quoteOptions: [
      "AREK rozsiadł się na kanapie i ogłasza: misja sprzątanie zakończona spektakularnym bałaganem.",
      "Luiza była blisko, ale AREK twierdzi, że ten chaos to teraz nowy styl wnętrzarski.",
      "Zegar się zatrzymał, a AREK tylko wzrusza ramionami, jakby ten bałagan był od początku częścią planu.",
      "Luiza była o krok od sukcesu, ale AREK już patrzy dumnie na chaos, który właśnie ogłosił swoim dziełem."
    ],
    button: "Wróć na poziom 1"
  },
  hidden: {
    eyebrow: "",
    title: "",
    quote: "",
    buttonLabel: ""
  }
};

/**
 * PL: Krótkie kwestie głosowe wypowiadane przez postacie podczas interakcji.
 * EN: Short spoken voice lines used by characters during gameplay interactions.
 */
export const VOICE_LINE_TEXT = {
  clean: ["Czysto!", "Super!"],
  specialAbility: {
    trashOut: "Wynieś śmieci!",
    foch: "Foch!"
  },
  arek: ["Coś tu położę!", "Oj tam!"]
};

/**
 * PL: Parametry syntezy mowy dopasowane do konkretnych grup wypowiedzi.
 * EN: Speech synthesis parameters tailored for specific groups of voice lines.
 */
export const VOICE_AUDIO_CONFIG = {
  clean: {
    rate: 0.95,
    pitch: 2.0,
    volume: 0.95
  },
  specialAbility: {
    trashOut: { rate: 0.72, pitch: 2.0, volume: 0.95 },
    foch: { rate: 0.72, pitch: 2.0, volume: 0.95 }
  },
  arek: {
    rate: 0.82,
    pitch: 0.86,
    volume: 0.95
  }
};

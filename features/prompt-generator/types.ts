export interface IdentityManual {
    styleBase: string;
    characterId: string;
    settingId: string;
    voiceId: string;
    toneOfVoice: string;
}

export interface GeneratorInput {
    mode: "auto" | "manual";
    identity: IdentityManual;
    sujetGeneral: string;
    anecdote: string;
    ambiance: string;
}

// Étape 1 — structure narrative
export interface SceneOutline {
    numero: number;
    titre: string;
    description: string;
    dureeEstimee: number;
}

export interface Outline {
    identity: IdentityManual;
    noteMusicaleGlobale: string;
    dureeTotale: number;
    scenes: SceneOutline[];
    research: string; // faits Tavily — réutilisés dans generate-scenes
}

// Étape 2 — prompts générés
export interface Scene {
    numero: number;
    duree: number;
    conditions: string;
    planCamera: string;       // ex. "Gros plan sur le visage"
    actionSpecifique: string; // ce que fait le personnage précisément pendant qu'il parle
    promptGemini: string;     // PROMPT_VISUEL assemblé — prêt pour Gemini
    script: string;           // SCRIPT audio
    instructionSync: string;  // rythme, pauses, accentuation
    sujet: string;            // message principal de la scène
}

export interface Draft {
    id: string;
    createdAt: string;
    input: GeneratorInput;
    outline: Outline;
}

export interface GeneratedVideo {
    id: string;
    createdAt: string;
    input: GeneratorInput;
    identity: IdentityManual;
    scenes: Scene[];
    noteMusicaleGlobale: string;
    dureeTotale: number;
}

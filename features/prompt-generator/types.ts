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
}

// Étape 2 — prompts générés
export interface Scene {
    numero: number;
    duree: number;
    conditions: string;
    promptGemini: string;
    script: string;
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

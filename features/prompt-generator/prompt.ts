export const STYLE_BASE_DEFAULT =
    "Ultra-realistic, 4K resolution, cinematic film production, shot on 35mm lens, high-end photography, sharp focus, natural skin textures, professional color grading, detailed environment lighting";

// ─── Étape 1 : générer la structure narrative ────────────────────────────────

export function buildOutlineSystemPrompt(): string {
    return `Tu es un réalisateur et scénariste expert en vidéos courtes virales.
Ta mission : concevoir la structure narrative d'une vidéo de 55 à 70 secondes à partir de faits vérifiés.

RÈGLE ABSOLUE — ZÉRO HALLUCINATION :
- Tu dois utiliser UNIQUEMENT les faits fournis dans la section RECHERCHE ci-dessous.
- Tu ne dois JAMAIS inventer de dates, noms, chiffres ou événements.
- Si une information n'est pas dans la recherche, tu ne l'utilises pas.
- Les scripts doivent refléter fidèlement les faits sourcés.

CONTRAINTES :
- Durée totale : entre 55 et 70 secondes.
- Chaque scène dure entre 5 et 10 secondes.
- Tu choisis librement le nombre de scènes (7 à 12 selon le sujet).
- Le narrateur est le personnage à l'écran, il parle directement à la caméra.
- Tout est en français.

FORMAT DE SORTIE : uniquement un objet JSON valide, sans texte avant ni après.

{
  "identity": {
    "styleBase": "string",
    "characterId": "string",
    "settingId": "string",
    "voiceId": "string",
    "toneOfVoice": "string"
  },
  "noteMusicaleGlobale": "string",
  "dureeTotale": number,
  "scenes": [
    {
      "numero": number,
      "titre": "string",
      "description": "string (ce qui se passe visuellement et narrativement)",
      "dureeEstimee": number
    }
  ]
}

En mode AUTO : invente un personnage cohérent avec le sujet, un décor adapté, et choisis les conditions atmosphériques scène par scène.
En mode MANUEL : utilise exactement les valeurs d'identité fournies.`;
}

export function buildOutlineUserPrompt(params: {
    mode: "auto" | "manual";
    identity?: {
        styleBase: string;
        characterId: string;
        settingId: string;
        voiceId: string;
        toneOfVoice: string;
    };
    sujetGeneral: string;
    anecdote?: string;
    ambiance?: string;
    research?: string;
}): string {
    const lines: string[] = [];

    lines.push(`MODE : ${params.mode === "auto" ? "AUTO" : "MANUEL"}`);
    lines.push(`SUJET GÉNÉRAL : ${params.sujetGeneral}`);

    if (params.anecdote) {
        lines.push(`ANECDOTE : ${params.anecdote}`);
    } else {
        lines.push("ANECDOTE : Choisis la plus captivante sur ce sujet.");
    }

    if (params.ambiance) {
        lines.push(`AMBIANCE : ${params.ambiance}`);
    }

    if (params.mode === "manual" && params.identity) {
        lines.push("\nIDENTITÉ FOURNIE :");
        lines.push(`STYLE_BASE : ${params.identity.styleBase}`);
        lines.push(`CHARACTER_ID : ${params.identity.characterId}`);
        lines.push(`SETTING_ID : ${params.identity.settingId}`);
        lines.push(`VOICE_ID : ${params.identity.voiceId}`);
        lines.push(`TONE_OF_VOICE : ${params.identity.toneOfVoice}`);
    }

    if (params.research) {
        lines.push("\n--- RECHERCHE (faits vérifiés — utilise uniquement ceci) ---");
        lines.push(params.research);
        lines.push("--- FIN RECHERCHE ---");
    }

    lines.push("\nGénère la structure narrative en te basant exclusivement sur les faits ci-dessus.");
    return lines.join("\n");
}

// ─── Étape 2 : générer un prompt pour une scène ───────────────────────────────

export function buildSceneSystemPrompt(): string {
    return `Tu es un ingénieur de prompt spécialisé dans la production vidéo IA pour Gemini.
Tu reçois la structure narrative complète d'une vidéo et les scènes déjà générées.
Tu dois générer le prompt Gemini et le script audio pour UNE scène précise.

RÈGLE ABSOLUE — ZÉRO HALLUCINATION :
- Utilise UNIQUEMENT les faits fournis dans la section RECHERCHE.
- Ne complète jamais avec des informations inventées ou supposées.
- Si tu n'as pas l'information, formule différemment sans inventer.

RÈGLES :
- Le prompt Gemini suit ce format EXACT :
  "Applique le style [styleBase]. Le personnage [characterId] est dans [settingId]. [conditions]. [actionDesc]. Mouvement de caméra : [cameraMove]."
- Le script est en français, calibré pour la durée de la scène (≈ 2,5 mots/seconde).
- Le personnage est identique visuellement à toutes les autres scènes (CHARACTER_ID immuable).
- Les conditions météo/lumière servent la narration.
- Le script est à la première personne, le personnage parle directement à la caméra.

FORMAT DE SORTIE : uniquement un objet JSON valide, sans texte avant ni après.

{
  "numero": number,
  "duree": number,
  "conditions": "string",
  "actionDesc": "string",
  "cameraMove": "string",
  "promptGemini": "string",
  "script": "string"
}`;
}

export function buildSceneUserPrompt(params: {
    identity: {
        styleBase: string;
        characterId: string;
        settingId: string;
        toneOfVoice: string;
    };
    allSceneOutlines: { numero: number; titre: string; description: string; dureeEstimee: number }[];
    previousScenes: { numero: number; promptGemini: string; script: string }[];
    currentScene: { numero: number; titre: string; description: string; dureeEstimee: number };
    research?: string;
}): string {
    const lines: string[] = [];

    lines.push("IDENTITÉ TECHNIQUE :");
    lines.push(`STYLE_BASE : ${params.identity.styleBase}`);
    lines.push(`CHARACTER_ID : ${params.identity.characterId}`);
    lines.push(`SETTING_ID : ${params.identity.settingId}`);
    lines.push(`TONE_OF_VOICE : ${params.identity.toneOfVoice}`);

    lines.push("\nSTRUCTURE NARRATIVE COMPLÈTE :");
    params.allSceneOutlines.forEach((s) => {
        lines.push(`  Scène ${s.numero} (${s.dureeEstimee}s) — ${s.titre} : ${s.description}`);
    });

    if (params.previousScenes.length > 0) {
        lines.push("\nSCÈNES DÉJÀ GÉNÉRÉES (contexte de continuité) :");
        params.previousScenes.forEach((s) => {
            lines.push(`  Scène ${s.numero} :`);
            lines.push(`    Prompt : ${s.promptGemini}`);
            lines.push(`    Script : "${s.script}"`);
        });
    }

    if (params.research) {
        lines.push("\n--- RECHERCHE (faits vérifiés — base-toi exclusivement sur ceci) ---");
        lines.push(params.research);
        lines.push("--- FIN RECHERCHE ---");
    }

    lines.push(`\nGÉNÈRE MAINTENANT : Scène ${params.currentScene.numero} — "${params.currentScene.titre}"`);
    lines.push(`Description : ${params.currentScene.description}`);
    lines.push(`Durée cible : ${params.currentScene.dureeEstimee}s`);

    return lines.join("\n");
}

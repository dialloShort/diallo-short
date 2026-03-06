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
- Le personnage est à l'écran, il parle DIRECTEMENT à la caméra pendant TOUTE la vidéo.
- Il raconte une histoire avec un début, un développement et une chute/révélation finale.
- Chaque scène = une étape narrative précise de cette histoire. Le personnage parle à chaque scène.
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
      "description": "string (ce que le personnage raconte dans cette scène + la posture/geste pendant qu'il parle)",
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
- conditions : ambiance atmosphérique de la scène (lumière, météo, heure).
- planCamera : type de plan et mouvement caméra (ex. "Gros plan sur le visage, léger zoom avant").
- actionSpecifique : ce que fait précisément le personnage pendant qu'il parle face caméra (geste, posture, regard — toujours en train de parler).
- promptGemini = PROMPT_VISUEL assemblé : "[styleBase], [characterId], [settingId], [conditions]. [actionSpecifique]. [planCamera]." — phrase dense prête à coller dans Gemini.
- Le script est en français, calibré pour la durée de la scène (≈ 2,5 mots/seconde).
- Le script raconte une HISTOIRE avec une progression narrative — c'est la voix du personnage qui entraîne le spectateur, pas un commentaire visuel.
- Le personnage est identique visuellement à toutes les autres scènes (CHARACTER_ID immuable).
- instructionSync : instructions de rythme pour le clonage vocal (pauses, accentuation, débit).
- sujet : résumé du message principal de cette scène en une phrase.
- Le script est à la première personne, le personnage parle directement à la caméra.

FORMAT DE SORTIE : uniquement un objet JSON valide, sans texte avant ni après.

{
  "numero": number,
  "duree": number,
  "conditions": "string (ambiance atmosphérique)",
  "planCamera": "string (type de plan + mouvement caméra)",
  "actionSpecifique": "string (ce que fait précisément le personnage en parlant)",
  "promptGemini": "string (PROMPT_VISUEL assemblé — prêt pour Gemini)",
  "script": "string (texte audio à la 1ère personne)",
  "instructionSync": "string (rythme, pauses, accentuation pour le clonage vocal)",
  "sujet": "string (message principal de la scène)"
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

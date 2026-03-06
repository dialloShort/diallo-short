import { NextRequest, NextResponse } from "next/server";
import { GeneratedVideo, GeneratorInput } from "@/features/prompt-generator/types";

// TODO: remplacer par l'appel réel à l'API Claude
function mockGenerate(input: GeneratorInput): GeneratedVideo {
    const styleBase = input.identity.styleBase;
    const characterId = input.mode === "manual"
        ? input.identity.characterId
        : "Homme 45 ans, regard perçant, cheveux grisonnants courts, veste sombre, parle avec assurance et gravité";
    const settingId = input.mode === "manual"
        ? input.identity.settingId
        : "Bibliothèque ancienne, étagères de livres en arrière-plan, lumière chaude d'une lampe de bureau";
    const voiceId = input.identity.voiceId || "ID_VOIX_01";
    const toneOfVoice = input.mode === "manual"
        ? input.identity.toneOfVoice
        : "Grave et posé, rythme lent, chaque mot pèse";

    function buildPrompt(conditions: string, action: string, plan: string) {
        return `${styleBase}, ${characterId}, ${settingId}, ${conditions}. ${action}. ${plan}.`;
    }

    const scenes = [
        {
            numero: 1,
            duree: 8,
            conditions: "nuit, lumière chaude et contrastée de la lampe de bureau",
            planCamera: "plan fixe, légère mise au point progressive",
            actionSpecifique: "le personnage parle face caméra, regard direct, prend une inspiration avant de commencer",
            get promptGemini() { return buildPrompt(this.conditions, this.actionSpecifique, this.planCamera); },
            script: "Ce que je vais vous raconter, la plupart des gens ne le savent pas.",
            instructionSync: "Rythme lent, pause après 'raconter', insistance sur 'ne savent pas'",
            sujet: "Accroche mystérieuse pour capter l'attention",
        },
        {
            numero: 2,
            duree: 9,
            conditions: "même scène, légère fumée atmosphérique en arrière-plan",
            planCamera: "lent zoom avant sur le visage",
            actionSpecifique: "il se penche légèrement vers l'avant, pose les mains sur le bureau, parle avec gravité",
            get promptGemini() { return buildPrompt(this.conditions, this.actionSpecifique, this.planCamera); },
            script: "Il y a une nuit qui a tout changé. Une nuit que personne n'a voulu raconter.",
            instructionSync: "Débit posé, accent sur 'tout changé', légère montée en fin de phrase",
            sujet: "Introduction du fait historique central",
        },
        {
            numero: 3,
            duree: 7,
            conditions: "lumière qui vacille légèrement, ambiance plus sombre",
            planCamera: "plan américain, caméra légèrement en contre-plongée",
            actionSpecifique: "il se redresse, croise les bras, regard direct et soutenu à la caméra",
            get promptGemini() { return buildPrompt(this.conditions, this.actionSpecifique, this.planCamera); },
            script: "Les hommes de pouvoir pensaient avoir tout prévu. Ils avaient tort.",
            instructionSync: "Ton ferme, pause marquée après 'prévu', 'Ils avaient tort' dit avec conviction",
            sujet: "Révélation de l'échec des élites",
        },
    ];

    return {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        input,
        identity: { styleBase, characterId, settingId, voiceId, toneOfVoice },
        scenes,
        noteMusicaleGlobale: "Orchestral épique, cordes graves, 70 BPM, montée progressive en tension",
        dureeTotale: scenes.reduce((acc, s) => acc + s.duree, 0),
    };
}

export async function POST(req: NextRequest) {
    const input: GeneratorInput = await req.json();

    if (!input.sujetGeneral) {
        return NextResponse.json({ error: "Sujet général requis" }, { status: 400 });
    }

    const video = mockGenerate(input);
    return NextResponse.json(video);
}

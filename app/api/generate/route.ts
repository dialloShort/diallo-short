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

    const scenes = [
        {
            numero: 1,
            duree: 8,
            conditions: "Nuit, lumière chaude et contrastée de la lampe de bureau",
            actionDesc: "Le personnage regarde la caméra, immobile, puis prend une longue inspiration avant de parler",
            cameraMove: "Plan fixe, légère mise au point progressive",
            promptGemini: `Applique le style ${styleBase}. Le personnage ${characterId} est dans ${settingId}. Nuit, lumière chaude et contrastée de la lampe de bureau. Le personnage regarde la caméra, immobile, puis prend une longue inspiration avant de parler. Mouvement de caméra : Plan fixe, légère mise au point progressive.`,
            script: "Ce que je vais vous raconter, la plupart des gens ne le savent pas.",
            instructionSync: "Rythme lent, pause après 'raconter', insistance sur 'ne savent pas'",
            sujet: "Accroche mystérieuse pour capter l'attention",
        },
        {
            numero: 2,
            duree: 9,
            conditions: "Même scène, légère fumée atmosphérique en arrière-plan",
            actionDesc: "Il pose les deux mains à plat sur le bureau et se penche légèrement vers l'avant",
            cameraMove: "Lent zoom avant sur le visage",
            promptGemini: `Applique le style ${styleBase}. Le personnage ${characterId} est dans ${settingId}. Même scène, légère fumée atmosphérique en arrière-plan. Il pose les deux mains à plat sur le bureau et se penche légèrement vers l'avant. Mouvement de caméra : Lent zoom avant sur le visage.`,
            script: "En ${new Date().getFullYear() - 2000} ans d'histoire, il y a une nuit qui a tout changé.",
            instructionSync: "Débit posé, accent sur 'tout changé', légère montée en fin de phrase",
            sujet: "Introduction du fait historique central",
        },
        {
            numero: 3,
            duree: 7,
            conditions: "Lumière qui vacille légèrement, ambiance plus sombre",
            actionDesc: "Il se redresse, croise les bras, regard direct à la caméra",
            cameraMove: "Plan américain, caméra légèrement en contre-plongée",
            promptGemini: `Applique le style ${styleBase}. Le personnage ${characterId} est dans ${settingId}. Lumière qui vacille légèrement, ambiance plus sombre. Il se redresse, croise les bras, regard direct à la caméra. Mouvement de caméra : Plan américain, caméra légèrement en contre-plongée.`,
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

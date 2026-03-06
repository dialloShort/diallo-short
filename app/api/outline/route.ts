import { NextRequest, NextResponse } from "next/server";
import { GeneratorInput, Outline } from "@/features/prompt-generator/types";
import { STYLE_BASE_DEFAULT } from "@/features/prompt-generator/prompt";

// TODO: remplacer par l'appel réel à Claude
function mockOutline(input: GeneratorInput): Outline {
    const identity = input.mode === "manual"
        ? input.identity
        : {
            styleBase: STYLE_BASE_DEFAULT,
            characterId: "Homme 45 ans, regard perçant, cheveux grisonnants courts, mâchoire carrée, veste sombre structurée — ton grave et direct, chaque mot pèse",
            settingId: "Bibliothèque ancienne aux murs de pierre, éclairage chaud d'une lampe de bureau, rangées de livres en arrière-plan",
            voiceId: "ID_VOIX_01",
            toneOfVoice: "Grave, posé, rythme lent et percutant",
        };

    return {
        identity,
        noteMusicaleGlobale: "Orchestral épique, cordes graves et cuivres, 68 BPM, montée progressive en tension",
        dureeTotale: 63,
        scenes: [
            {
                numero: 1,
                titre: "L'accroche",
                description: "Le personnage fixe la caméra en silence avant de lâcher une phrase qui accroche. Mise en place de l'intrigue.",
                dureeEstimee: 7,
            },
            {
                numero: 2,
                titre: "Le contexte",
                description: "Il pose le cadre historique. Ton calme mais chargé. Il commence à rentrer dans le vif du sujet.",
                dureeEstimee: 8,
            },
            {
                numero: 3,
                titre: "La montée",
                description: "Les événements s'accélèrent dans le récit. Le personnage se penche légèrement, geste discret de la main.",
                dureeEstimee: 7,
            },
            {
                numero: 4,
                titre: "Le tournant",
                description: "Le moment clé de l'histoire. Révélation ou basculement. Le ton change, devient plus intense.",
                dureeEstimee: 8,
            },
            {
                numero: 5,
                titre: "Les conséquences",
                description: "Ce que cet événement a changé. Le personnage marque une pause, laisse le silence résonner.",
                dureeEstimee: 7,
            },
            {
                numero: 6,
                titre: "La leçon",
                description: "La morale ou le fait surprenant que peu de gens connaissent. Regard direct, ton affirmé.",
                dureeEstimee: 8,
            },
            {
                numero: 7,
                titre: "La chute",
                description: "Une dernière phrase percutante qui laisse le spectateur avec quelque chose. Fondu au noir.",
                dureeEstimee: 8,
            },
        ],
    };
}

export async function POST(req: NextRequest) {
    const input: GeneratorInput = await req.json();

    if (!input.sujetGeneral) {
        return NextResponse.json({ error: "Sujet général requis" }, { status: 400 });
    }

    const outline = mockOutline(input);
    return NextResponse.json(outline);
}

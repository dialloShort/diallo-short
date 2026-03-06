import { NextRequest } from "next/server";
import { Outline, Scene } from "@/features/prompt-generator/types";

interface GenerateScenesRequest {
    outline: Outline;
}

// TODO: remplacer par l'appel réel à Claude (appel séquentiel scène par scène)
function mockGenerateScene(
    outline: Outline,
    sceneIndex: number,
    previousScenes: Scene[]
): Scene {
    const sceneOutline = outline.scenes[sceneIndex];
    const { identity } = outline;

    const conditions = [
        "Nuit tombante, lumière chaude de la lampe, ombres marquées sur le visage",
        "Même ambiance, légère fumée atmosphérique en fond",
        "Lumière qui se fait plus froide, tension palpable",
        "Éclairage dramatique, contraste fort entre lumière et ombre",
        "Retour à la lumière chaude, atmosphère plus intime",
        "Lumière rasante depuis la gauche, relief du visage accentué",
        "Fondu progressif vers une lumière plus sombre, fin de séquence",
    ][sceneIndex % 7];

    const cameraMoves = [
        "Plan fixe, légère mise au point progressive",
        "Lent zoom avant sur le visage",
        "Plan américain, caméra légèrement en contre-plongée",
        "Très gros plan sur les yeux, puis recul lent",
        "Plan fixe, épaules et visage",
        "Léger travelling latéral de gauche à droite",
        "Zoom arrière très lent, personnage de plus en plus petit dans le cadre",
    ][sceneIndex % 7];

    const scripts = [
        "Ce que je vais vous raconter, la plupart des gens l'ignorent complètement.",
        "Il faut remonter plusieurs siècles en arrière pour comprendre ce qui s'est passé.",
        "Tout s'est enchaîné en quelques heures. Personne ne l'avait vu venir.",
        "C'est à ce moment précis que tout a basculé. Sans retour possible.",
        "Les conséquences ont été immédiates. Et elles durent encore aujourd'hui.",
        "Ce que l'histoire officielle ne vous dit pas, c'est que cela aurait pu être évité.",
        "Voilà pourquoi cette histoire mérite d'être racontée. N'oubliez pas.",
    ][sceneIndex % 7];

    const actionDesc = sceneOutline.description;
    const promptGemini = `Applique le style ${identity.styleBase}. Le personnage ${identity.characterId} est dans ${identity.settingId}. ${conditions}. ${actionDesc}. Mouvement de caméra : ${cameraMoves}.`;

    void previousScenes;

    return {
        numero: sceneOutline.numero,
        duree: sceneOutline.dureeEstimee,
        conditions,
        promptGemini,
        script: scripts,
    };
}

export async function POST(req: NextRequest) {
    const { outline }: GenerateScenesRequest = await req.json();

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const generatedScenes: Scene[] = [];

            for (let i = 0; i < outline.scenes.length; i++) {
                // Simule le temps de génération par Claude (à remplacer par l'appel API réel)
                await new Promise((resolve) => setTimeout(resolve, 1200));

                const scene = mockGenerateScene(outline, i, generatedScenes);
                generatedScenes.push(scene);

                const chunk = JSON.stringify({ type: "scene", data: scene }) + "\n";
                controller.enqueue(encoder.encode(chunk));
            }

            controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
        },
    });
}

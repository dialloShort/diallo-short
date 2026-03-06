export const runtime = "edge";

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Outline, Scene } from "@/features/prompt-generator/types";
import { buildSceneSystemPrompt, buildSceneUserPrompt } from "@/features/prompt-generator/prompt";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface GenerateScenesRequest {
    outline: Outline;
}

async function generateScene(
    outline: Outline,
    sceneIndex: number,
    previousScenes: Scene[],
    research: string
): Promise<Scene> {
    const sceneOutline = outline.scenes[sceneIndex];

    const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: buildSceneSystemPrompt(),
        messages: [
            {
                role: "user",
                content: buildSceneUserPrompt({
                    identity: {
                        styleBase: outline.identity.styleBase,
                        characterId: outline.identity.characterId,
                        settingId: outline.identity.settingId,
                        toneOfVoice: outline.identity.toneOfVoice,
                    },
                    allSceneOutlines: outline.scenes,
                    previousScenes: previousScenes.map((s) => ({
                        numero: s.numero,
                        promptGemini: s.promptGemini,
                        script: s.script,
                    })),
                    currentScene: sceneOutline,
                    research,
                }),
            },
        ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    let parsed: Partial<Scene>;
    try {
        parsed = JSON.parse(raw);
    } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error(`Parsing failed for scene ${sceneOutline.numero}`);
        parsed = JSON.parse(match[0]);
    }

    return {
        numero: parsed.numero ?? sceneOutline.numero,
        duree: parsed.duree ?? sceneOutline.dureeEstimee,
        conditions: parsed.conditions ?? "",
        planCamera: parsed.planCamera ?? "",
        actionSpecifique: parsed.actionSpecifique ?? "",
        promptGemini: parsed.promptGemini ?? "",
        script: parsed.script ?? "",
        instructionSync: parsed.instructionSync ?? "",
        sujet: parsed.sujet ?? "",
    };
}

export async function POST(req: NextRequest) {
    const { outline }: GenerateScenesRequest = await req.json();

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const generatedScenes: Scene[] = [];

                for (let i = 0; i < outline.scenes.length; i++) {
                    const scene = await generateScene(outline, i, generatedScenes, outline.research);
                    generatedScenes.push(scene);

                    const chunk = JSON.stringify({ type: "scene", data: scene }) + "\n";
                    controller.enqueue(encoder.encode(chunk));
                }

                controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Erreur inconnue";
                controller.enqueue(
                    encoder.encode(JSON.stringify({ type: "error", message: msg }) + "\n")
                );
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
        },
    });
}

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GeneratorInput, Outline } from "@/features/prompt-generator/types";
import { buildOutlineSystemPrompt, buildOutlineUserPrompt } from "@/features/prompt-generator/prompt";
import { researchTopic } from "@/features/prompt-generator/research";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
    const input: GeneratorInput = await req.json();

    if (!input.sujetGeneral) {
        return NextResponse.json({ error: "Sujet général requis" }, { status: 400 });
    }

    // Étape 1 : recherche des faits via Tavily
    const { facts, sources } = await researchTopic({
        sujetGeneral: input.sujetGeneral,
        anecdote: input.anecdote || undefined,
    });

    // Étape 2 : Claude génère la structure narrative basée sur les faits
    const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: buildOutlineSystemPrompt(),
        messages: [
            {
                role: "user",
                content: buildOutlineUserPrompt({
                    mode: input.mode,
                    identity: input.mode === "manual" ? input.identity : undefined,
                    sujetGeneral: input.sujetGeneral,
                    anecdote: input.anecdote || undefined,
                    ambiance: input.ambiance || undefined,
                    research: facts,
                }),
            },
        ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    let outline: Outline;
    try {
        outline = JSON.parse(raw);
    } catch {
        // Claude a parfois du texte avant/après le JSON — on extrait le bloc JSON
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) {
            return NextResponse.json({ error: "Erreur de parsing de la réponse Claude" }, { status: 500 });
        }
        outline = JSON.parse(match[0]);
    }

    // On attache les faits pour éviter un double appel Tavily dans generate-scenes
    return NextResponse.json({ ...outline, research: facts });
}

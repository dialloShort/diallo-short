import { tavily } from "@tavily/core";

export interface ResearchResult {
    facts: string;
    sources: { title: string; url: string }[];
}

export async function researchTopic(params: {
    sujetGeneral: string;
    anecdote?: string;
}): Promise<ResearchResult> {
    const client = tavily({ apiKey: process.env.TAVILY_API_KEY! });

    const query = params.anecdote
        ? `${params.sujetGeneral} : ${params.anecdote} — faits historiques vérifiés`
        : `${params.sujetGeneral} — faits historiques et anecdotes vérifiées`;

    const response = await client.search(query, {
        searchDepth: "advanced",
        maxResults: 8,
        includeAnswer: true,
    });

    const sources = response.results.map((r) => ({
        title: r.title,
        url: r.url,
    }));

    const facts = [
        response.answer ? `RÉSUMÉ : ${response.answer}\n` : "",
        "SOURCES :",
        ...response.results.map(
            (r, i) => `[${i + 1}] ${r.title}\n${r.content}`
        ),
    ]
        .filter(Boolean)
        .join("\n\n");

    return { facts, sources };
}

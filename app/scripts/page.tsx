"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GeneratedVideo } from "@/features/prompt-generator/types";
import { getAllScripts } from "@/shared/hooks/useLocalScripts";

export default function ScriptsPortal() {
    const router = useRouter();
    const [scripts, setScripts] = useState<GeneratedVideo[]>([]);

    useEffect(() => {
        setScripts(getAllScripts());
    }, []);

    return (
        <main className="min-h-screen bg-[#0c0c0e]">
            <header className="border-b border-[#2a2a32] px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#e8b84b]" />
                        <span className="text-sm font-medium tracking-widest uppercase text-[#7a7880]">
                            Diallo Short
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="bg-[#e8b84b] hover:bg-[#d4a43a] text-black text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
                    >
                        + Nouveau script
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Tous les scripts</h1>
                    <p className="text-[#7a7880] text-sm">{scripts.length} script{scripts.length !== 1 ? "s" : ""} généré{scripts.length !== 1 ? "s" : ""}</p>
                </div>

                {scripts.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-[#2a2a32] rounded-xl">
                        <p className="text-[#7a7880] mb-4">Aucun script pour l&apos;instant.</p>
                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className="bg-[#e8b84b] hover:bg-[#d4a43a] text-black text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
                        >
                            Créer mon premier script
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {scripts.map((script) => (
                            <button
                                key={script.id}
                                type="button"
                                onClick={() => router.push(`/scripts/${script.id}`)}
                                className="w-full bg-[#141417] hover:bg-[#1c1c21] border border-[#2a2a32] hover:border-[#4a4850] rounded-xl p-5 text-left transition-colors group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h2 className="text-[#f0eee8] font-semibold text-sm truncate group-hover:text-[#e8b84b] transition-colors">
                                            {script.input.sujetGeneral}
                                        </h2>
                                        {script.input.anecdote && (
                                            <p className="text-[#7a7880] text-xs mt-0.5 truncate">
                                                {script.input.anecdote}
                                            </p>
                                        )}
                                        <p className="text-xs text-[#4a4850] mt-2">
                                            {script.identity.characterId.split(",")[0]}
                                        </p>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-3 text-xs text-[#7a7880]">
                                        <span>{script.scenes.length} scènes</span>
                                        <span>·</span>
                                        <span>{script.dureeTotale}s</span>
                                        <span>·</span>
                                        <span>{new Date(script.createdAt).toLocaleDateString("fr-FR")}</span>
                                        <span className="text-[#4a4850] group-hover:text-[#7a7880] transition-colors">→</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

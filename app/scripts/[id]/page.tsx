"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GeneratedVideo, Scene } from "@/features/prompt-generator/types";
import { getScript } from "@/shared/hooks/useLocalScripts";

function SceneAccordion({ scene }: { scene: Scene }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    async function copy() {
        await navigator.clipboard.writeText(scene.promptGemini);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="border border-[#2a2a32] rounded-xl overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1c1c21] transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-[#2a2a32] text-[#7a7880] rounded px-2 py-0.5">
                        {String(scene.numero).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium text-[#f0eee8]">
                        Scène {scene.numero}
                    </span>
                    <span className="text-xs text-[#4a4850]">{scene.duree}s</span>
                    <span className="text-xs text-[#7a7880] hidden sm:block">— {scene.conditions}</span>
                </div>
                <span className={`text-[#7a7880] text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
                    ▼
                </span>
            </button>

            {open && (
                <div className="px-5 pb-5 space-y-4 border-t border-[#2a2a32]">
                    <div className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium uppercase tracking-widest text-[#7a7880]">
                                Prompt Gemini
                            </span>
                            <button
                                type="button"
                                onClick={copy}
                                className={`text-xs font-medium px-3 py-1 rounded transition-colors border ${
                                    copied
                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                        : "bg-[#1c1c21] text-[#7a7880] border-[#2a2a32] hover:border-[#4a4850] hover:text-[#f0eee8]"
                                }`}
                            >
                                {copied ? "Copié !" : "Copier"}
                            </button>
                        </div>
                        <p className="text-sm text-[#c0beb8] bg-[#0c0c0e] rounded-lg px-4 py-3 leading-relaxed">
                            {scene.promptGemini}
                        </p>
                    </div>

                    <div>
                        <span className="text-xs font-medium uppercase tracking-widest text-[#7a7880] block mb-2">
                            Script
                        </span>
                        <p className="text-sm text-[#f0eee8] italic leading-relaxed border-l-2 border-[#e8b84b]/40 pl-3">
                            &ldquo;{scene.script}&rdquo;
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ScriptPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [video, setVideo] = useState<GeneratedVideo | null>(null);

    useEffect(() => {
        const found = getScript(id);
        if (!found) {
            router.push("/");
        } else {
            setVideo(found);
        }
    }, [id, router]);

    if (!video) {
        return (
            <main className="min-h-screen bg-[#0c0c0e] flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#2a2a32] border-t-[#e8b84b] rounded-full animate-spin" />
            </main>
        );
    }

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
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.push("/scripts")}
                            className="text-sm text-[#7a7880] hover:text-[#f0eee8] transition-colors"
                        >
                            Tous les scripts
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className="bg-[#e8b84b] hover:bg-[#d4a43a] text-black text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
                        >
                            + Nouveau
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">
                        {video.input.sujetGeneral}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-[#7a7880]">
                        <span>{video.scenes.length} scènes</span>
                        <span>·</span>
                        <span>{video.dureeTotale}s</span>
                        <span>·</span>
                        <span>{new Date(video.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                </div>

                {/* Identité */}
                <div className="bg-[#141417] border border-[#2a2a32] rounded-xl p-5">
                    <h2 className="text-xs font-medium uppercase tracking-widest text-[#7a7880] mb-4">
                        Identité technique
                    </h2>
                    <dl className="space-y-2">
                        {[
                            { label: "Personnage", value: video.identity.characterId },
                            { label: "Décor", value: video.identity.settingId },
                            { label: "Ton", value: video.identity.toneOfVoice },
                        ].map(({ label, value }) => (
                            <div key={label} className="grid grid-cols-[100px_1fr] gap-3 text-sm">
                                <dt className="text-[#7a7880]">{label}</dt>
                                <dd className="text-[#f0eee8]">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                {/* Musique */}
                <div className="bg-[#e8b84b]/5 border border-[#e8b84b]/20 rounded-xl px-5 py-4 flex items-start gap-3">
                    <span className="text-[#e8b84b] text-lg">♪</span>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-widest text-[#e8b84b] mb-1">
                            Musique
                        </p>
                        <p className="text-sm text-[#f0eee8]">{video.noteMusicaleGlobale}</p>
                    </div>
                </div>

                {/* Scènes accordion */}
                <div className="space-y-2">
                    <h2 className="text-xs font-medium uppercase tracking-widest text-[#7a7880] mb-4">
                        Séquences — cliquer pour ouvrir
                    </h2>
                    {video.scenes.map((scene) => (
                        <SceneAccordion key={scene.numero} scene={scene} />
                    ))}
                </div>
            </div>
        </main>
    );
}

"use client";

import { useState } from "react";
import { GeneratedVideo } from "@/features/prompt-generator/types";

interface Props {
    video: GeneratedVideo;
    onReset: () => void;
}

export default function PromptResult({ video, onReset }: Props) {
    const [copied, setCopied] = useState<number | null>(null);

    async function copyToClipboard(text: string, index: number) {
        await navigator.clipboard.writeText(text);
        setCopied(index);
        setTimeout(() => setCopied(null), 2000);
    }

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Script généré</h1>
                    <div className="flex items-center gap-3 text-sm text-[#7a7880]">
                        <span>{video.scenes.length} scènes</span>
                        <span>·</span>
                        <span>{video.dureeTotale}s</span>
                        <span>·</span>
                        <span className="capitalize">{video.input.mode}</span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onReset}
                    className="shrink-0 bg-[#141417] hover:bg-[#1c1c21] border border-[#2a2a32] text-[#f0eee8] text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
                >
                    Nouvelle vidéo
                </button>
            </div>

            {/* Identité technique */}
            <div className="bg-[#141417] border border-[#2a2a32] rounded-xl p-5">
                <h2 className="text-xs font-medium uppercase tracking-widest text-[#7a7880] mb-4">
                    Identité technique
                </h2>
                <dl className="space-y-3">
                    {[
                        { label: "Personnage", value: video.identity.characterId },
                        { label: "Décor", value: video.identity.settingId },
                        { label: "Ton de voix", value: video.identity.toneOfVoice },
                        { label: "Style visuel", value: video.identity.styleBase },
                        ...(video.identity.voiceId ? [{ label: "Clone vocal", value: video.identity.voiceId }] : []),
                    ].map(({ label, value }) => (
                        <div key={label} className="grid grid-cols-[120px_1fr] gap-3 text-sm">
                            <dt className="text-[#7a7880] pt-0.5">{label}</dt>
                            <dd className="text-[#f0eee8]">{value}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            {/* Note musicale */}
            <div className="bg-[#e8b84b]/5 border border-[#e8b84b]/20 rounded-xl px-5 py-4 flex items-start gap-3">
                <span className="text-[#e8b84b] text-lg mt-0.5">♪</span>
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-[#e8b84b] mb-1">
                        Note musicale
                    </p>
                    <p className="text-sm text-[#f0eee8]">{video.noteMusicaleGlobale}</p>
                </div>
            </div>

            {/* Scènes */}
            <div className="space-y-4">
                <h2 className="text-xs font-medium uppercase tracking-widest text-[#7a7880]">
                    Séquences
                </h2>

                {video.scenes.map((scene) => (
                    <div
                        key={scene.numero}
                        className="bg-[#141417] border border-[#2a2a32] rounded-xl overflow-hidden"
                    >
                        {/* Scene header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a32]">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold bg-[#2a2a32] text-[#7a7880] rounded px-2 py-0.5">
                                    {String(scene.numero).padStart(2, "0")}
                                </span>
                                <span className="text-sm text-[#7a7880]">{scene.duree}s</span>
                                <span className="text-sm text-[#4a4850]">·</span>
                                <span className="text-sm text-[#7a7880]">{scene.conditions}</span>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Prompt Gemini */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium uppercase tracking-widest text-[#7a7880]">
                                        Prompt Gemini
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(scene.promptGemini, scene.numero)}
                                        className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                                            copied === scene.numero
                                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                : "bg-[#1c1c21] text-[#7a7880] border border-[#2a2a32] hover:border-[#4a4850] hover:text-[#f0eee8]"
                                        }`}
                                    >
                                        {copied === scene.numero ? "Copié !" : "Copier"}
                                    </button>
                                </div>
                                <p className="text-sm text-[#c0beb8] bg-[#0c0c0e] rounded-lg px-4 py-3 leading-relaxed">
                                    {scene.promptGemini}
                                </p>
                            </div>

                            {/* Script */}
                            <div>
                                <span className="text-xs font-medium uppercase tracking-widest text-[#7a7880] block mb-2">
                                    Script
                                </span>
                                <p className="text-sm text-[#f0eee8] italic leading-relaxed border-l-2 border-[#e8b84b]/40 pl-3">
                                    &ldquo;{scene.script}&rdquo;
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

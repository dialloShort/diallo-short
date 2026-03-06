"use client";

import { useState, useEffect, useRef } from "react";
import { Outline, Scene } from "@/features/prompt-generator/types";

interface Props {
    outline: Outline;
    onConfirm: (outline: Outline, scenes: Scene[]) => void;
    onBack: () => void;
    onDraftSave?: (outline: Outline) => void;
}

export default function OutlineReview({ outline, onConfirm, onBack, onDraftSave }: Props) {
    const [scenes, setScenes] = useState(outline.scenes);
    const [identity, setIdentity] = useState(outline.identity);
    const [noteMusicaleGlobale, setNoteMusicaleGlobale] = useState(outline.noteMusicaleGlobale);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        if (!onDraftSave) return;
        const timer = setTimeout(() => {
            onDraftSave({ ...outline, scenes, identity, noteMusicaleGlobale });
        }, 800);
        return () => clearTimeout(timer);
    }, [scenes, identity, noteMusicaleGlobale]); // eslint-disable-line react-hooks/exhaustive-deps

    function updateScene(index: number, field: "titre" | "description" | "dureeEstimee", value: string) {
        setScenes((prev) =>
            prev.map((s, i) => (i === index ? { ...s, [field]: field === "dureeEstimee" ? Number(value) : value } : s))
        );
    }

    async function handleConfirm() {
        setLoading(true);
        setProgress(0);
        try {
            const updatedOutline = { ...outline, scenes, identity, noteMusicaleGlobale };

            const res = await fetch("/api/generate-scenes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ outline: updatedOutline }),
            });

            if (!res.body) return;

            const generatedScenes: Scene[] = [];
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    if (!line.trim()) continue;
                    const msg = JSON.parse(line);
                    if (msg.type === "scene") {
                        generatedScenes.push(msg.data);
                        setProgress(generatedScenes.length);
                    } else if (msg.type === "done") {
                        onConfirm(updatedOutline, generatedScenes);
                        return;
                    } else if (msg.type === "error") {
                        throw new Error(msg.message);
                    }
                }
            }

            // Flush le buffer restant
            if (buffer.trim()) {
                const msg = JSON.parse(buffer);
                if (msg.type === "done") {
                    onConfirm(updatedOutline, generatedScenes);
                }
            }
        } catch (err) {
            console.error("Erreur génération:", err);
            setLoading(false);
        }
    }

    const dureeTotale = scenes.reduce((acc, s) => acc + s.dureeEstimee, 0);

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Structure narrative</h1>
                    <p className="text-[#7a7880] text-sm">
                        Vérifie et ajuste les scènes avant de générer les prompts.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onBack}
                    disabled={loading}
                    className="shrink-0 bg-[#141417] hover:bg-[#1c1c21] border border-[#2a2a32] text-[#7a7880] hover:text-[#f0eee8] text-sm font-medium rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ← Retour
                </button>
            </div>

            {/* Identité */}
            <div className="bg-[#141417] border border-[#2a2a32] rounded-xl p-5">
                <h2 className="text-xs font-medium uppercase tracking-widest text-[#7a7880] mb-4">
                    Identité technique
                </h2>
                <dl className="space-y-2">
                    {([
                        { label: "Style base", field: "styleBase" },
                        { label: "Personnage", field: "characterId" },
                        { label: "Décor", field: "settingId" },
                        { label: "Voix", field: "voiceId" },
                        { label: "Ton", field: "toneOfVoice" },
                    ] as { label: string; field: keyof typeof identity }[]).map(({ label, field }) => (
                        <div key={field} className="grid grid-cols-[100px_1fr] gap-3 text-sm items-center">
                            <dt className="text-[#7a7880]">{label}</dt>
                            <dd>
                                <input
                                    type="text"
                                    value={identity[field]}
                                    onChange={(e) => setIdentity((prev) => ({ ...prev, [field]: e.target.value }))}
                                    disabled={loading}
                                    className="w-full bg-transparent text-[#f0eee8] text-sm outline-none border-b border-transparent hover:border-[#2a2a32] focus:border-[#e8b84b] transition-colors pb-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
                <span className="text-[#7a7880]">
                    <span className="text-[#f0eee8] font-semibold">{scenes.length}</span> scènes
                </span>
                <span className="text-[#7a7880]">
                    <span className={`font-semibold ${dureeTotale >= 55 && dureeTotale <= 70 ? "text-green-400" : "text-red-400"}`}>
                        {dureeTotale}s
                    </span>{" "}
                    durée totale
                </span>
                <span className="text-[#7a7880] flex items-center gap-1">
                    ♪
                    <input
                        type="text"
                        value={noteMusicaleGlobale}
                        onChange={(e) => setNoteMusicaleGlobale(e.target.value)}
                        disabled={loading}
                        className="bg-transparent text-[#f0eee8] text-sm outline-none border-b border-transparent hover:border-[#2a2a32] focus:border-[#e8b84b] transition-colors pb-0.5 disabled:opacity-50 disabled:cursor-not-allowed min-w-0 w-48"
                    />
                </span>
            </div>

            {/* Scènes éditables */}
            <div className="space-y-3">
                {scenes.map((scene, i) => (
                    <div
                        key={scene.numero}
                        className="bg-[#141417] border border-[#2a2a32] rounded-xl p-5 space-y-3"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold bg-[#2a2a32] text-[#7a7880] rounded px-2 py-0.5">
                                {String(scene.numero).padStart(2, "0")}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-[#7a7880]">
                                <input
                                    type="number"
                                    value={scene.dureeEstimee}
                                    onChange={(e) => updateScene(i, "dureeEstimee", e.target.value)}
                                    disabled={loading}
                                    min={1}
                                    className="w-10 bg-transparent text-[#7a7880] text-xs outline-none border-b border-transparent hover:border-[#2a2a32] focus:border-[#e8b84b] transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                s
                            </span>
                        </div>

                        <input
                            type="text"
                            value={scene.titre}
                            onChange={(e) => updateScene(i, "titre", e.target.value)}
                            disabled={loading}
                            className="w-full bg-transparent text-[#f0eee8] font-semibold text-sm outline-none border-b border-transparent hover:border-[#2a2a32] focus:border-[#e8b84b] transition-colors pb-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        />

                        <textarea
                            value={scene.description}
                            onChange={(e) => updateScene(i, "description", e.target.value)}
                            rows={2}
                            disabled={loading}
                            className="w-full bg-[#0c0c0e] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-[#c0beb8] placeholder-[#3a3840] outline-none focus:border-[#e8b84b] transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                {loading && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-[#7a7880]">
                            <span>Génération des scènes…</span>
                            <span className="text-[#e8b84b] font-medium">{progress} / {scenes.length}</span>
                        </div>
                        <div className="w-full bg-[#2a2a32] rounded-full h-1.5 overflow-hidden">
                            <div
                                className="h-full bg-[#e8b84b] rounded-full transition-all duration-500"
                                style={{ width: `${(progress / scenes.length) * 100}%` }}
                            />
                        </div>
                        <div className="flex gap-1">
                            {scenes.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                                        i < progress ? "bg-[#e8b84b]" : "bg-[#2a2a32]"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full bg-[#e8b84b] hover:bg-[#d4a43a] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg px-6 py-3.5 transition-colors text-sm"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Scène {progress + 1} en cours…
                        </span>
                    ) : (
                        "Générer les prompts Gemini →"
                    )}
                </button>
            </div>
        </div>
    );
}

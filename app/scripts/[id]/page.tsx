"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GeneratedVideo, Scene } from "@/features/prompt-generator/types";
import { getScript, saveScript } from "@/shared/hooks/useLocalScripts";

function SceneAccordion({ scene, identity, onSave }: {
    scene: Scene;
    identity: { styleBase: string; characterId: string; settingId: string; voiceId: string; toneOfVoice: string };
    onSave: (updated: Scene) => void;
}) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<Scene>(scene);

    function buildFullTemplate(s: Scene = scene) {
        return [
            `1. IDENTITÉ TECHNIQUE`,
            `STYLE_BASE : ${identity.styleBase}`,
            `CHARACTER_ID : ${identity.characterId}`,
            `SETTING_ID : ${identity.settingId}`,
            `VOICE_ID : ${identity.voiceId}`,
            ``,
            `2. SÉQUENCE VIDÉO`,
            `PROMPT_VISUEL : ${s.promptGemini}`,
            ``,
            `3. SÉQUENCE AUDIO`,
            `TONE_OF_VOICE : ${identity.toneOfVoice}`,
            `SCRIPT : ${s.script}`,
            `INSTRUCTION_SYNC : ${s.instructionSync}`,
            ``,
            `4. SUJET TRAITÉ`,
            `SUJET : ${s.sujet}`,
        ].join("\n");
    }

    async function copy() {
        await navigator.clipboard.writeText(buildFullTemplate());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function handleSave() {
        onSave(draft);
        setEditing(false);
    }

    function handleCancel() {
        setDraft(scene);
        setEditing(false);
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
                    {editing ? (
                        <div className="pt-4 space-y-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium uppercase tracking-widest text-[#e8b84b]">Mode édition</span>
                                <div className="flex gap-2">
                                    <button type="button" onClick={handleCancel} className="text-xs text-[#4a4850] hover:text-[#7a7880] transition-colors px-2 py-1">
                                        Annuler
                                    </button>
                                    <button type="button" onClick={handleSave} className="text-xs font-semibold bg-[#e8b84b] hover:bg-[#d4a43a] text-black px-3 py-1 rounded transition-colors">
                                        Sauvegarder
                                    </button>
                                </div>
                            </div>
                            {([
                                { key: "promptGemini", label: "Prompt visuel" },
                                { key: "script", label: "Script audio" },
                                { key: "instructionSync", label: "Instruction sync" },
                                { key: "sujet", label: "Sujet" },
                                { key: "conditions", label: "Conditions" },
                            ] as { key: keyof Scene; label: string }[]).map(({ key, label }) => (
                                <div key={key}>
                                    <label className="text-xs text-[#7a7880] block mb-1">{label}</label>
                                    <textarea
                                        value={String(draft[key])}
                                        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                                        rows={key === "promptGemini" || key === "script" ? 4 : 2}
                                        className="w-full bg-[#0c0c0e] border border-[#2a2a32] focus:border-[#e8b84b]/50 rounded-lg px-3 py-2 text-xs text-[#f0eee8] font-mono resize-y outline-none transition-colors"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium uppercase tracking-widest text-[#7a7880]">Template Gemini</span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => { setEditing(true); setDraft(scene); }}
                                        className="text-xs font-medium px-3 py-1 rounded transition-colors border bg-[#1c1c21] text-[#7a7880] border-[#2a2a32] hover:border-[#4a4850] hover:text-[#f0eee8]"
                                    >
                                        Modifier
                                    </button>
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
                            </div>
                            <pre className="text-xs text-[#c0beb8] bg-[#0c0c0e] rounded-lg px-4 py-4 leading-relaxed whitespace-pre-wrap font-mono">
                                {buildFullTemplate()}
                            </pre>
                        </div>
                    )}
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

    function handleSaveScene(updated: Scene) {
        if (!video) return;
        const newVideo = {
            ...video,
            scenes: video.scenes.map((s) => s.numero === updated.numero ? updated : s),
        };
        saveScript(newVideo);
        setVideo(newVideo);
    }

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
                        <SceneAccordion key={scene.numero} scene={scene} identity={video.identity} onSave={handleSaveScene} />
                    ))}
                </div>
            </div>
        </main>
    );
}

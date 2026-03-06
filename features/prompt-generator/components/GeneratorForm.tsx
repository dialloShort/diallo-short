"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GeneratorInput, GeneratedVideo } from "@/features/prompt-generator/types";
import { STYLE_BASE_DEFAULT } from "@/features/prompt-generator/prompt";
import { getAllScripts } from "@/shared/hooks/useLocalScripts";

interface Props {
    onResult: (input: GeneratorInput) => void;
}

const EMPTY_IDENTITY = {
    styleBase: STYLE_BASE_DEFAULT,
    characterId: "",
    settingId: "",
    voiceId: "",
    toneOfVoice: "",
};

function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
    return (
        <label
            htmlFor={htmlFor}
            className="block text-xs font-medium uppercase tracking-widest text-[#7a7880] mb-2"
        >
            {children}
        </label>
    );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className="w-full bg-[#0c0c0e] border border-[#2a2a32] rounded-lg px-4 py-3 text-[#f0eee8] placeholder-[#3a3840] outline-none focus:border-[#e8b84b] transition-colors text-sm"
        />
    );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            className="w-full bg-[#0c0c0e] border border-[#2a2a32] rounded-lg px-4 py-3 text-[#f0eee8] placeholder-[#3a3840] outline-none focus:border-[#e8b84b] transition-colors text-sm resize-none"
        />
    );
}

export default function GeneratorForm({ onResult }: Props) {
    const router = useRouter();
    const [mode, setMode] = useState<"auto" | "manual">("auto");
    const [identity, setIdentity] = useState(EMPTY_IDENTITY);
    const [sujetGeneral, setSujetGeneral] = useState("");
    const [anecdote, setAnecdote] = useState("");
    const [ambiance, setAmbiance] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [duplicate, setDuplicate] = useState<GeneratedVideo | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const existing = getAllScripts().find(
            (s) => s.input.sujetGeneral.trim().toLowerCase() === sujetGeneral.trim().toLowerCase()
        );
        if (existing && !duplicate) {
            setDuplicate(existing);
            return;
        }

        setDuplicate(null);
        setLoading(true);
        const input: GeneratorInput = { mode, identity, sujetGeneral, anecdote, ambiance };
        await onResult(input);
        setLoading(false);
    }

    function updateIdentity(key: keyof typeof EMPTY_IDENTITY, value: string) {
        setIdentity((prev) => ({ ...prev, [key]: value }));
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">

            {/* Mode toggle */}
            <div>
                <Label>Mode de génération</Label>
                <div className="flex gap-2">
                    {(["auto", "manual"] as const).map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMode(m)}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors border ${
                                mode === m
                                    ? "bg-[#e8b84b] border-[#e8b84b] text-black"
                                    : "bg-transparent border-[#2a2a32] text-[#7a7880] hover:border-[#4a4850] hover:text-[#f0eee8]"
                            }`}
                        >
                            {m === "auto" ? "Auto — Claude choisit tout" : "Manuel — je définis le personnage"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Style visuel */}
            <div className="bg-[#141417] border border-[#2a2a32] rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-[#f0eee8]">Style visuel</h2>
                <div>
                    <Label htmlFor="styleBase">Style de base</Label>
                    <Textarea
                        id="styleBase"
                        value={identity.styleBase}
                        onChange={(e) => updateIdentity("styleBase", e.target.value)}
                        rows={3}
                    />
                </div>
            </div>

            {/* Identité manuelle */}
            {mode === "manual" && (
                <div className="bg-[#141417] border border-[#2a2a32] rounded-xl p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-[#f0eee8]">Identité du personnage</h2>

                    <div>
                        <Label htmlFor="characterId">Personnage</Label>
                        <Textarea
                            id="characterId"
                            value={identity.characterId}
                            onChange={(e) => updateIdentity("characterId", e.target.value)}
                            placeholder="Ex: Homme 40 ans, cicatrice sourcil droit, veste en jean, ton autoritaire et direct"
                            rows={3}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="settingId">Décor</Label>
                        <Textarea
                            id="settingId"
                            value={identity.settingId}
                            onChange={(e) => updateIdentity("settingId", e.target.value)}
                            placeholder="Ex: Bureau minimaliste, éclairage néon bleu, mur béton"
                            rows={2}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="toneOfVoice">Ton de voix</Label>
                            <Input
                                id="toneOfVoice"
                                type="text"
                                value={identity.toneOfVoice}
                                onChange={(e) => updateIdentity("toneOfVoice", e.target.value)}
                                placeholder="Ex: Grave et posé"
                            />
                        </div>
                        <div>
                            <Label htmlFor="voiceId">Clone vocal (ID)</Label>
                            <Input
                                id="voiceId"
                                type="text"
                                value={identity.voiceId}
                                onChange={(e) => updateIdentity("voiceId", e.target.value)}
                                placeholder="Ex: ID_VOIX_01"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Sujet */}
            <div className="bg-[#141417] border border-[#2a2a32] rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-[#f0eee8]">Contenu</h2>

                <div>
                    <Label htmlFor="sujetGeneral">Sujet général *</Label>
                    <Textarea
                        id="sujetGeneral"
                        value={sujetGeneral}
                        onChange={(e) => setSujetGeneral(e.target.value)}
                        placeholder="Ex: L'histoire de Rome"
                        rows={2}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="anecdote">
                        Anecdote spécifique{" "}
                        <span className="normal-case font-normal text-[#4a4850]">— optionnel</span>
                    </Label>
                    <Textarea
                        id="anecdote"
                        value={anecdote}
                        onChange={(e) => setAnecdote(e.target.value)}
                        placeholder="Laisse vide pour que Claude choisisse la meilleure anecdote"
                        rows={2}
                    />
                </div>

                <div>
                    <Label htmlFor="ambiance">
                        Ambiance{" "}
                        <span className="normal-case font-normal text-[#4a4850]">— optionnel</span>
                    </Label>
                    <Input
                        id="ambiance"
                        type="text"
                        value={ambiance}
                        onChange={(e) => setAmbiance(e.target.value)}
                        placeholder="Ex: Épique et dramatique, mélancolique, nerveux..."
                    />
                </div>
            </div>

            {error && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                    {error}
                </p>
            )}

            {duplicate && (
                <div className="bg-[#1c1a10] border border-[#e8b84b]/30 rounded-xl px-4 py-4 space-y-3">
                    <p className="text-sm text-[#e8b84b] font-medium">
                        Ce sujet a déjà été généré le {new Date(duplicate.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => router.push(`/scripts/${duplicate.id}`)}
                            className="flex-1 bg-[#e8b84b] hover:bg-[#d4a43a] text-black text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
                        >
                            Voir le script existant
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-transparent border border-[#2a2a32] hover:border-[#4a4850] text-[#7a7880] hover:text-[#f0eee8] text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
                        >
                            Générer quand même
                        </button>
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e8b84b] hover:bg-[#d4a43a] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg px-6 py-3.5 transition-colors text-sm"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Génération en cours...
                    </span>
                ) : (
                    "Générer le script"
                )}
            </button>
        </form>
    );
}

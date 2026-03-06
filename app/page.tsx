"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GeneratorForm from "@/features/prompt-generator/components/GeneratorForm";
import OutlineReview from "@/features/prompt-generator/components/OutlineReview";
import { GeneratorInput, Outline, Scene, GeneratedVideo } from "@/features/prompt-generator/types";
import { saveScript } from "@/shared/hooks/useLocalScripts";

type Step = "form" | "outline";

export default function Home() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("form");
    const [input, setInput] = useState<GeneratorInput | null>(null);
    const [outline, setOutline] = useState<Outline | null>(null);

    async function handleFormSubmit(formInput: GeneratorInput) {
        setInput(formInput);
        const res = await fetch("/api/outline", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formInput),
        });
        const outlineData: Outline = await res.json();
        setOutline(outlineData);
        setStep("outline");
    }

    function handleConfirm(finalOutline: Outline, scenes: Scene[]) {
        if (!input) return;
        const video: GeneratedVideo = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            input,
            identity: finalOutline.identity,
            scenes,
            noteMusicaleGlobale: finalOutline.noteMusicaleGlobale,
            dureeTotale: scenes.reduce((acc, s) => acc + s.duree, 0),
        };
        saveScript(video);
        router.push(`/scripts/${video.id}`);
    }

    function reset() {
        setStep("form");
        setInput(null);
        setOutline(null);
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

                    <div className="flex items-center gap-6">
                        <button
                            type="button"
                            onClick={() => router.push("/scripts")}
                            className="text-sm text-[#7a7880] hover:text-[#f0eee8] transition-colors"
                        >
                            Mes scripts
                        </button>

                        {/* Stepper */}
                    <div className="flex items-center gap-2 text-xs text-[#7a7880]">
                        {[
                            { key: "form", label: "Sujet" },
                            { key: "outline", label: "Structure" },
                        ].map(({ key, label }, i, arr) => (
                            <div key={key} className="flex items-center gap-2">
                                <span className={step === key ? "text-[#e8b84b] font-medium" : ""}>
                                    {label}
                                </span>
                                {i < arr.length - 1 && (
                                    <span className="text-[#2a2a32]">→</span>
                                )}
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12">
                {step === "form" && (
                    <>
                        <div className="mb-10">
                            <h1 className="text-3xl font-bold tracking-tight mb-2">
                                Générateur de shorts
                            </h1>
                            <p className="text-[#7a7880]">
                                Décris ton sujet — Claude structure le récit, tu valides, puis les prompts Gemini sont générés scène par scène.
                            </p>
                        </div>
                        <GeneratorForm onResult={handleFormSubmit} />
                    </>
                )}

                {step === "outline" && outline && (
                    <OutlineReview
                        outline={outline}
                        onConfirm={handleConfirm}
                        onBack={() => setStep("form")}
                    />
                )}

            </div>
        </main>
    );
}

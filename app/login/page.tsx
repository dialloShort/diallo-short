"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        if (res.ok) {
            router.push("/");
        } else {
            setError("Mot de passe incorrect");
        }

        setLoading(false);
    }

    return (
        <main className="min-h-screen bg-[#0c0c0e] flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#e8b84b]/10 mb-4">
                        <div className="w-2 h-2 rounded-full bg-[#e8b84b]" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Diallo Short</h1>
                    <p className="text-[#7a7880] text-sm mt-1">Accès restreint</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mot de passe"
                            autoFocus
                            className="w-full bg-[#141417] border border-[#2a2a32] rounded-lg px-4 py-3 text-[#f0eee8] placeholder-[#7a7880] outline-none focus:border-[#e8b84b] transition-colors"
                        />
                        {error && (
                            <p className="text-red-400 text-sm mt-2">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#e8b84b] hover:bg-[#b8902e] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg px-4 py-3 transition-colors"
                    >
                        {loading ? "Connexion..." : "Accéder"}
                    </button>
                </form>
            </div>
        </main>
    );
}

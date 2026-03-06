"use client";

import { GeneratedVideo } from "@/features/prompt-generator/types";

const KEY = "diallo_scripts";

export function saveScript(video: GeneratedVideo): void {
    const existing = getAllScripts();
    const updated = [video, ...existing.filter((v) => v.id !== video.id)];
    localStorage.setItem(KEY, JSON.stringify(updated));
}

export function getScript(id: string): GeneratedVideo | null {
    return getAllScripts().find((v) => v.id === id) ?? null;
}

export function getAllScripts(): GeneratedVideo[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
        return [];
    }
}

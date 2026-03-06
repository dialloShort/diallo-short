"use client";

import { GeneratedVideo, Draft } from "@/features/prompt-generator/types";

const KEY = "diallo_scripts";
const DRAFT_KEY = "diallo_drafts";

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

export function saveDraft(draft: Draft): void {
    const existing = getAllDrafts();
    const updated = [draft, ...existing.filter((d) => d.id !== draft.id)];
    localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
}

export function getDraft(id: string): Draft | null {
    return getAllDrafts().find((d) => d.id === id) ?? null;
}

export function deleteDraft(id: string): void {
    const updated = getAllDrafts().filter((d) => d.id !== id);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
}

export function getAllDrafts(): Draft[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "[]");
    } catch {
        return [];
    }
}

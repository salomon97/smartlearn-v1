"use client";

import { useState } from "react";

export default function RelanceButton({ userId }: { userId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function relancer() {
    setState("loading");
    try {
      const res = await fetch(`/api/retention/reengage/${userId}`, { method: "POST" });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  const label =
    state === "done" ? "Relancé ✓" : state === "loading" ? "..." : state === "error" ? "Réessayer" : "Relancer";

  return (
    <button
      onClick={relancer}
      disabled={state === "loading" || state === "done"}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        state === "done"
          ? "bg-emerald-100 text-emerald-700 cursor-default"
          : state === "error"
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-brand-orange text-white hover:opacity-90"
      }`}
    >
      {label}
    </button>
  );
}

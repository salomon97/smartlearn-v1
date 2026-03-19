"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
    return (
        <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full px-5 py-4 text-red-500 hover:bg-red-50 rounded-[2rem] font-black flex items-center gap-4 transition-all"
        >
            <span className="text-lg">🚪</span> Déconnexion
        </button>
    );
}

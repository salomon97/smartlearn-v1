import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            isPremium: boolean;
            grade_level: string;
            sessionId?: string;
            role: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        isPremium: boolean;
        grade_level: string;
        sessionId?: string;
        role: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        isPremium: boolean;
        grade_level: string;
        sessionId?: string;
        role: string;
        image?: string | null;
    }
}

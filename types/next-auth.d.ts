import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            isPremium: boolean;
            grade_level: string;
            sessionId?: string;
            role: string;
            welcomeTrialGrantedAt?: Date | null;
            isOnTrial?: boolean;
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
        welcomeTrialGrantedAt?: Date | null;
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
        welcomeTrialGrantedAt?: Date | null;
    }
}

import { Asset } from "./assets";

export interface Achievement {
    icon: Asset;
    title: string,
    description: string,
    score: number,
    uniqueId: string;
}

export interface QueryPayload {
    achievements: string[];
    name?: string;
    type: string;
}
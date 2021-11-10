import { Asset } from "./assets";

export interface Achievement {
    icon: Asset;
    title: string,
    description: string,
    score: number,
}
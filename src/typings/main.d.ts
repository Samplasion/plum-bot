import { LanguageCode } from "humanize-duration";

declare module 'plum-bot' {
    export interface Language {
        name: string;
        localizedName: string;
        flag: string;
    }
    export interface LanguageGroup {
        [code: LanguageCode]: Language
    }
}
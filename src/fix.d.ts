declare module 'compress-str' {
	export function gzip(string: string): Promise<string>;
	export function gzip(string: string, callback: (err:Error, result: string) => void): void;

	export function gunzip(string: string): Promise<string>;
	export function gunzip(string: string, callback: (err:Error, result: string) => void): void;
}

declare const DEV: boolean;
declare const VERSION: boolean;
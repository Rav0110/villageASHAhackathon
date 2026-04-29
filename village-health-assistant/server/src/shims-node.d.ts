// Minimal Node.js shims to keep TypeScript happy in this hackathon boilerplate.
// Install real `@types/node` in a full project.

declare const __dirname: string;

declare module "fs" {
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function readFileSync(path: string, encoding: string): string;
  export function writeFileSync(path: string, data: string, encoding: string): void;
}

declare module "path" {
  export function join(...parts: string[]): string;
  export function dirname(p: string): string;
}


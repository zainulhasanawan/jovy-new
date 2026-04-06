export type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

import type { ModuleMap } from "./types";

export const discoveredModules = import.meta.glob(
  "../../components/mockups/**/*.tsx",
) as ModuleMap;

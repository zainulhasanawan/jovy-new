import type { ComponentType } from "react";

import type { ModuleMap } from "./types";

export function resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const fns = Object.values(mod).filter(
    (value) => typeof value === "function",
  ) as ComponentType[];

  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    fns[fns.length - 1]
  );
}

export function findComponentLoader(
  modules: ModuleMap,
  componentPath: string,
): (() => Promise<Record<string, unknown>>) | undefined {
  const normalizedPath = componentPath
    .replace(/^\/+/, "")
    .replace(/\.tsx$/, "")
    .replace(/\/$/, "");

  const targetSuffix = `/components/mockups/${normalizedPath}.tsx`;
  const match = Object.entries(modules).find(([modulePath]) =>
    modulePath.endsWith(targetSuffix),
  );

  return match?.[1];
}

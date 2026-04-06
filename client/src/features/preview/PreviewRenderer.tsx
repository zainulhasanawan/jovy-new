import { useEffect, useState, type ComponentType } from "react";

import { findComponentLoader, resolveComponent } from "./previewUtils";
import type { ModuleMap } from "./types";

export default function PreviewRenderer({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedPath, setLoadedPath] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function loadComponent(): Promise<void> {
      const loader = findComponentLoader(modules, componentPath);
      if (!loader) {
        setError(`No component found at ${componentPath}.tsx`);
        setComponent(null);
        setLoadedPath(componentPath);
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) {
          return;
        }

        const name = componentPath.split("/").pop() ?? "Preview";
        const resolvedComponent = resolveComponent(mod, name);

        if (!resolvedComponent) {
          setError(
            `No exported React component found in ${componentPath}.tsx.\n\nMake sure the file has at least one exported function component.`,
          );
          setComponent(null);
          setLoadedPath(componentPath);
          return;
        }

        setError(null);
        setComponent(() => resolvedComponent);
        setLoadedPath(componentPath);
      } catch (caughtError) {
        if (cancelled) {
          return;
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : String(caughtError);
        setError(`Failed to load preview.\n${message}`);
        setComponent(null);
        setLoadedPath(componentPath);
      }
    }

    void loadComponent();

    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return <pre className="preview-error">{error}</pre>;
  }

  if (loadedPath !== componentPath) {
    return <div className="preview-loading">Loading preview...</div>;
  }

  if (!Component) {
    return <div className="preview-loading">Loading preview...</div>;
  }

  return <Component />;
}

import { useParams } from "react-router-dom";

import PreviewRenderer from "../features/preview/PreviewRenderer";
import { discoveredModules } from "../features/preview/discoveredModules";

export default function PreviewPage() {
  const params = useParams();
  const componentPath = params["*"];

  if (!componentPath) {
    return (
      <section className="page-card">
        <h2>Missing Component Path</h2>
        <p>Use /preview/folder/ComponentName to load a component preview.</p>
      </section>
    );
  }

  return (
    <section className="preview-page">
      <PreviewRenderer
        componentPath={componentPath}
        modules={discoveredModules}
      />
    </section>
  );
}

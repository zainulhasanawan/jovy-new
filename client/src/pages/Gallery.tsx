import { Link } from "react-router-dom";

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function getPreviewExamplePath(): string {
  const basePath = getBasePath();
  return `${basePath}/preview/examples/WelcomeCard`;
}

export default function Gallery() {
  return (
    <section className="gallery-screen">
      <div className="gallery-card">
        <h1>Component Preview Server</h1>
        <p>
          This workspace renders individual components for rapid UI iteration.
        </p>

        <p>
          Example preview path: <code>{getPreviewExamplePath()}</code>
        </p>

        <Link to="/preview/examples/WelcomeCard" className="button-link">
          Open Example Preview
        </Link>
      </div>
    </section>
  );
}

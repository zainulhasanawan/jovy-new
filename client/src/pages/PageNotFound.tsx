import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <section className="not-found-screen">
      <div className="not-found-card">
        <div className="not-found-title-wrap">
          <span className="not-found-icon" aria-hidden="true">
            !
          </span>
          <h1>404 Page Not Found</h1>
        </div>

        <p>
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="button-link button-link-secondary">
            Back to Home
          </Link>
          <Link to="/dashboard" className="button-link">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

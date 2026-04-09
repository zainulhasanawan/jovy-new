import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">
            404 Page Not Found
          </h1>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            to="/"
            className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Back to Home
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-md bg-[#2A2035] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#3b3150]"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

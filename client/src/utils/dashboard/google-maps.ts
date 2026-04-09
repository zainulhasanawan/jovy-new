let googleMapsPromise: Promise<void> | null = null;
let loadError: Error | null = null;

interface GoogleMapsWindow extends Window {
  google?: {
    maps?: unknown;
  };
}

function hasGoogleMapsLoaded(): boolean {
  const win = window as GoogleMapsWindow;
  return Boolean(win.google && win.google.maps);
}

export function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (hasGoogleMapsLoaded()) {
    loadError = null;
    return Promise.resolve();
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  // Check if API key is provided
  if (!apiKey || apiKey.trim() === "") {
    const error = new Error(
      "Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables. " +
        "Get your API key from https://console.cloud.google.com/google/maps-apis/credentials",
    );
    loadError = error;
    return Promise.reject(error);
  }

  const promise = new Promise<void>((resolve, reject) => {
    const scriptId = "google-maps-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => {
          loadError = null;
          resolve();
        },
        { once: true },
      );
      existingScript.addEventListener(
        "error",
        () => {
          const error = new Error("Failed to load Google Maps script.");
          loadError = error;
          reject(error);
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey.trim())}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      loadError = null;
      resolve();
    };

    script.onerror = () => {
      const error = new Error("Failed to load Google Maps script.");
      loadError = error;
      reject(error);
    };

    document.head.appendChild(script);
  });

  googleMapsPromise = promise
    .then(() => {
      loadError = null;
    })
    .catch((error: unknown) => {
      loadError = error instanceof Error ? error : new Error(String(error));
      googleMapsPromise = null; // Allow retry
      throw loadError;
    });

  return promise;
}

export function isGoogleMapsReady(): boolean {
  return hasGoogleMapsLoaded();
}

export function getGoogleMaps(): unknown | null {
  const win = window as GoogleMapsWindow;
  if (!hasGoogleMapsLoaded() || !win.google?.maps) {
    return null;
  }
  return win.google.maps;
}

export function getGoogleMapsError(): Error | null {
  return loadError;
}

export function hasGoogleMapsApiKey(): boolean {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return !!(apiKey && apiKey.trim() !== "");
}

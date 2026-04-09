let googleMapsPromise: Promise<boolean> | null = null;

interface GoogleMapsScriptWindow extends Window {
  google?: unknown;
}

function hasGoogleMaps(): boolean {
  const win = window as GoogleMapsScriptWindow;
  return Boolean(win.google);
}

export function isGoogleMapsReady(): boolean {
  return hasGoogleMaps();
}

export function loadGoogleMaps(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (hasGoogleMaps()) {
    return Promise.resolve(true);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  if (!apiKey) {
    return Promise.resolve(false);
  }

  googleMapsPromise = new Promise<boolean>((resolve) => {
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(hasGoogleMaps()));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve(hasGoogleMaps());
    script.onerror = () => resolve(false);

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

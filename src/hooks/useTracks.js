import { useEffect, useState } from "react";

export function useTracks(endpoint = "/api/pcloud-tracks-publiclink") {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(endpoint, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        setTracks(Array.isArray(data.tracks) ? data.tracks : []);
      } catch (e) {
        setError(e.message || "Failed to load tracks");
      } finally {
        setLoading(false);
      }
    })();
  }, [endpoint]);

  return { tracks, loading, error };
}

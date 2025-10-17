import { useRef, useState } from "react";
import { useTracks } from "./hooks/useTracks.js";
import TrackList from "./components/TrackList.jsx";

export default function App() {
  const { tracks, loading, error } = useTracks("/api/pcloud-tracks-publiclink");
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const active = tracks[current];

  const onPlay = (i) => {
    setCurrent(i);
    setPlaying(true);
    // Let React update the <audio src> before playing
    setTimeout(() => audioRef.current?.play().catch(() => {}), 0);
  };

  const toggle = () => {
    if (!active?.url) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      audioRef.current?.play().catch(() => {});
      setPlaying(true);
    }
  };

  const next = () => {
    if (!tracks.length) return;
    setCurrent((i) => (i + 1) % tracks.length);
    setPlaying(true);
    setTimeout(() => audioRef.current?.play().catch(() => {}), 0);
  };

  const prev = () => {
    if (!tracks.length) return;
    setCurrent((i) => (i - 1 + tracks.length) % tracks.length);
    setPlaying(true);
    setTimeout(() => audioRef.current?.play().catch(() => {}), 0);
  };

  return (
    <main
      style={{
        maxWidth: 1040,
        margin: "32px auto",
        padding: "0 16px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>PulseNexis Player</h1>
      <p style={{ marginTop: 0, opacity: 0.7, marginBottom: 24 }}>
        Powered by pCloud Public Link
      </p>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {!loading && !error && <TrackList tracks={tracks} onPlay={onPlay} />}

      {/* Sticky now-playing bar */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          borderTop: "1px solid #e5e5e5",
          background: "#fff",
          padding: 12,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 420,
            }}
          >
            {active?.title ?? "—"}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {active?.artist ?? "—"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
          <button onClick={prev} title="Previous">⟨⟨</button>
          <button onClick={toggle} title="Play/Pause">
            {playing ? "Pause" : "Play"}
          </button>
          <button onClick={next} title="Next">⟩⟩</button>
        </div>

        <audio
          ref={audioRef}
          src={active?.url || undefined}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={next}
          controls
          style={{ marginLeft: "auto" }}
        />
      </div>
    </main>
  );
}

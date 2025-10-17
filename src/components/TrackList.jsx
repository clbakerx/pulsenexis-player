export default function TrackList({ tracks = [], onPlay }) {
  if (!tracks.length) return <p>No tracks found.</p>;

  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
      }}
    >
      {tracks.map((t, i) => (
        <li
          key={t.id || t.url}
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            background: "#fff",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: 12,
              marginBottom: 8,
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg,#6366f1,#22c55e)",
              color: "white",
              fontWeight: 800,
              fontSize: 28,
            }}
            aria-hidden
          >
            {(t.title || "?")[0]?.toUpperCase?.() || "?"}
          </div>

          <div
            title={t.title}
            style={{
              fontWeight: 700,
              marginBottom: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {t.title}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
            {t.artist || "PulseNexis"}
          </div>

          <button
            onClick={() => onPlay(i)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e5e5e5",
              borderRadius: 10,
              cursor: "pointer",
              background: "#111827",
              color: "white",
              fontWeight: 700,
            }}
          >
            Play
          </button>
        </li>
      ))}
    </ul>
  );
}

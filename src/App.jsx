import AudioPlayer from "./components/AudioPlayer";

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>PulseNexis Player</h1>
      <AudioPlayer src="/sample.mp3" />
    </div>
  );
}

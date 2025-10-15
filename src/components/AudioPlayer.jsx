import { useEffect, useRef, useState } from "react";

export default function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    const onTime = () => setTime(a.currentTime || 0);
    const onLoaded = () => setDur(a.duration || 0);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    playing ? a.pause() : a.play();
    setPlaying(!playing);
  };

  const fmt = s => !isFinite(s) ? "0:00" :
    `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;

  return (
    <div style={{display:"grid",gap:8,maxWidth:360,padding:12,border:"1px solid #ddd",borderRadius:12}}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={toggle}>{playing ? "Pause" : "Play"}</button>
      <input type="range" min="0" max={dur||0} step="0.1" value={time}
        onChange={e => { const t=+e.target.value; audioRef.current.currentTime=t; setTime(t); }} />
      <div style={{fontSize:12,color:"#555"}}>{fmt(time)} / {fmt(dur)}</div>
    </div>
  );
}
``

// src/components/AudioPlayer.jsx
import { useEffect, useRef, useState } from "react";

export default function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(1);

  useEffect(() => {
    const a = audioRef.current;
    const onTime = () => setTime(a.currentTime);
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
    if (playing) a.pause(); else a.play();
    setPlaying(!playing);
  };

  const fmt = (s) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div style={{display:"grid",gap:8,maxWidth:360,padding:12,border:"1px solid #ddd",borderRadius:12}}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={toggle} style={{padding:"8px 12px",borderRadius:8}}>
        {playing ? "Pause" : "Play"}
      </button>
      <div>
        <input type="range" min="0" max={dur||0} step="0.1" value={time}
          onChange={(e)=>{const t=+e.target.value; audioRef.current.currentTime=t; setTime(t);}}/>
        <div style={{fontSize:12,color:"#555"}}>{fmt(time)} / {fmt(dur)}</div>
      </div>
      <label style={{fontSize:12,color:"#555"}}>
        Volume
        <input type="range" min="0" max="1" step="0.01" value={vol}
          onChange={(e)=>{const v=+e.target.value; audioRef.current.volume=v; setVol(v);}}
          style={{width:"100%"}}/>
      </label>
    </div>
  );
}


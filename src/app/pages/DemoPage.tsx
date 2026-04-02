// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { Home, Music, Settings, User, RotateCcw, ChevronRight } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// Nova Music OS — Proof-of-Workflow Prototype
// API Integration Points from Nova_Music_OS_API_Handoff.ipynb
// ═══════════════════════════════════════════════════════════════

const STEPS = [
  { key: "DRAFT", label: "แบบร่าง", n: 1 },
  { key: "BRIEFED", label: "บรีฟ", n: 2 },
  { key: "LYRICS_DONE", label: "เนื้อเพลง", n: 3 },
  { key: "REFERENCE_DONE", label: "Reference", n: 4 },
  { key: "ARRANGED", label: "เรียบเรียง", n: 5 },
  { key: "RECORDED", label: "บันทึกเสียง", n: 6 },
  { key: "MIXED", label: "Mix", n: 7 },
  { key: "MASTERED", label: "Master", n: 8 },
  { key: "RIGHTS_SIGNED", label: "ลิขสิทธิ์", n: 9 },
  { key: "RELEASED", label: "เผยแพร่", n: 10 },
];
const IDX = {}; STEPS.forEach((s, i) => (IDX[s.key] = i));

// Colors
const P = "#7C3AED"; const PL = "#F5F3FF"; const G = "#22C55E"; const GL = "#F0FDF4";
const Y = "#EAB308"; const YL = "#FEFCE8"; const R = "#EF4444";
const GR = "#9CA3AF"; const BD = "#E5E7EB"; const BG = "#fff";

const font = "'Noto Sans Thai', system-ui, sans-serif";

// ─── API Badge Component ───
function ApiBadge({ type, endpoint, cost }) {
  const styles = {
    mureka: { bg: "#EFF6FF", border: "#BFDBFE", color: "#2563EB", icon: "🤖", label: "Mureka API" },
    roex: { bg: "#F0FDF4", border: "#BBF7D0", color: "#16A34A", icon: "🎛", label: "Roex API" },
    landr: { bg: "#FFF7ED", border: "#FED7AA", color: "#EA580C", icon: "📦", label: "LANDR API" },
  };
  const s = styles[type];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px",
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, fontSize: 12, color: s.color,
      fontFamily: "monospace", fontWeight: 600, marginBottom: 8,
    }}>
      <span>{s.icon}</span>
      <span>{s.label}</span>
      {endpoint && <span style={{ opacity: 0.7 }}>{endpoint}</span>}
      {cost && <span style={{ background: s.color + "15", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>{cost}</span>}
    </div>
  );
}

// ─── Shared Components ───
function Btn({ children, onClick, color = P, outline, disabled, big, style: sx = {} }) {
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      padding: big ? "16px 32px" : "10px 20px", fontSize: big ? 17 : 14, fontWeight: 600,
      color: outline ? color : "#fff", background: outline ? BG : disabled ? "#D1D5DB" : color,
      border: outline ? `2px solid ${color}` : "none", borderRadius: 10,
      cursor: disabled ? "not-allowed" : "pointer", fontFamily: font, opacity: disabled ? 0.5 : 1, ...sx,
    }}>{children}</button>
  );
}

function Card({ children, active, style: sx = {} }) {
  return (
    <div style={{
      background: BG, borderRadius: 14, padding: 20,
      border: active ? `2px solid ${P}` : `1px solid ${BD}`, ...sx,
    }}>{children}</div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: GR, marginBottom: 6 }}>{children}</div>;
}

function Spinner({ text = "กำลังประมวลผล..." }) {
  const [d, setD] = useState("");
  useEffect(() => { const iv = setInterval(() => setD(x => x.length >= 3 ? "" : x + "."), 400); return () => clearInterval(iv); }, []);
  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${BD}`, borderTop: `3px solid ${P}`, borderRadius: "50%", animation: "sp .8s linear infinite", margin: "0 auto 14px" }} />
      <div style={{ fontSize: 15, color: P, fontWeight: 600 }}>{text}{d}</div>
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── Web Audio Synth Engine ───
// Generates real audio: chords + melody + bass + drums
const audioCtxRef = { current: null };
function getAudioCtx() {
  if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
  return audioCtxRef.current;
}

// Note frequencies (C minor scale for the demo song)
const NOTES = { C3: 130.81, Eb3: 155.56, G3: 196.00, Bb3: 233.08, C4: 261.63, Eb4: 311.13, F4: 349.23, G4: 392.00, Ab4: 415.30, Bb4: 466.16, C5: 523.25, Eb5: 622.25 };

function createSynthLoop(ctx, variant = "A") {
  const master = ctx.createGain();
  master.gain.value = 0.25;
  master.connect(ctx.destination);

  // Chord progression: Cm - Ab - Eb - Bb (pop ballad)
  const chordFreqs = variant === "A"
    ? [[NOTES.C3, NOTES.Eb3, NOTES.G3], [NOTES.Ab4 * 0.5, NOTES.C4 * 0.5, NOTES.Eb4 * 0.5], [NOTES.Eb3, NOTES.G3, NOTES.Bb3], [NOTES.Bb3 * 0.5, NOTES.Eb3, NOTES.F4 * 0.5]]
    : [[NOTES.Eb3, NOTES.G3, NOTES.Bb3], [NOTES.C3, NOTES.Eb3, NOTES.G3], [NOTES.Ab4 * 0.5, NOTES.C4 * 0.5, NOTES.Eb4 * 0.5], [NOTES.Bb3 * 0.5, NOTES.Eb3, NOTES.F4 * 0.5]];

  const melodyNotes = variant === "A"
    ? [NOTES.C5, NOTES.Eb5, NOTES.G4, NOTES.Ab4, NOTES.Bb4, NOTES.G4, NOTES.Eb4, NOTES.C4]
    : [NOTES.Eb5, NOTES.C5, NOTES.Bb4, NOTES.G4, NOTES.Ab4, NOTES.F4, NOTES.Eb4, NOTES.G4];

  const nodes = [];
  const now = ctx.currentTime;
  const bpm = 78;
  const beatDur = 60 / bpm;
  const barDur = beatDur * 4;
  const totalBars = 4;

  // Pad / Chords (warm sine + triangle)
  for (let bar = 0; bar < totalBars; bar++) {
    const chord = chordFreqs[bar % chordFreqs.length];
    chord.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + bar * barDur);
      gain.gain.linearRampToValueAtTime(0.12, now + bar * barDur + 0.3);
      gain.gain.linearRampToValueAtTime(0.08, now + (bar + 1) * barDur - 0.1);
      gain.gain.linearRampToValueAtTime(0, now + (bar + 1) * barDur);
      osc.connect(gain); gain.connect(master);
      osc.start(now + bar * barDur);
      osc.stop(now + (bar + 1) * barDur);
      nodes.push(osc);

      // Add triangle layer for warmth
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.value = freq * 2;
      gain2.gain.setValueAtTime(0, now + bar * barDur);
      gain2.gain.linearRampToValueAtTime(0.04, now + bar * barDur + 0.2);
      gain2.gain.linearRampToValueAtTime(0, now + (bar + 1) * barDur);
      osc2.connect(gain2); gain2.connect(master);
      osc2.start(now + bar * barDur);
      osc2.stop(now + (bar + 1) * barDur);
      nodes.push(osc2);
    });
  }

  // Melody (square wave, softer)
  melodyNotes.forEach((freq, i) => {
    const startTime = now + i * beatDur * 2;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.06, startTime + 0.05);
    gain.gain.linearRampToValueAtTime(0.04, startTime + beatDur * 1.5);
    gain.gain.linearRampToValueAtTime(0, startTime + beatDur * 2 - 0.05);
    osc.connect(gain); gain.connect(master);
    osc.start(startTime);
    osc.stop(startTime + beatDur * 2);
    nodes.push(osc);
  });

  // Bass (sine, low)
  for (let bar = 0; bar < totalBars; bar++) {
    const bassFreq = chordFreqs[bar % chordFreqs.length][0] * 0.5;
    for (let beat = 0; beat < 4; beat++) {
      const t = now + bar * barDur + beat * beatDur;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = bassFreq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(beat === 0 ? 0.15 : 0.08, t + 0.02);
      gain.gain.linearRampToValueAtTime(0, t + beatDur * 0.8);
      osc.connect(gain); gain.connect(master);
      osc.start(t);
      osc.stop(t + beatDur);
      nodes.push(osc);
    }
  }

  // Kick + Hi-hat (noise-based percussion)
  for (let bar = 0; bar < totalBars; bar++) {
    for (let beat = 0; beat < 4; beat++) {
      const t = now + bar * barDur + beat * beatDur;
      // Kick on 1 and 3
      if (beat === 0 || beat === 2) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain); gain.connect(master);
        osc.start(t); osc.stop(t + 0.25);
        nodes.push(osc);
      }
      // Hi-hat on every beat + offbeat
      for (let sub = 0; sub < 2; sub++) {
        const ht = t + sub * beatDur * 0.5;
        const bufSize = 1024;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let s = 0; s < bufSize; s++) data[s] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const hpf = ctx.createBiquadFilter();
        hpf.type = "highpass";
        hpf.frequency.value = 8000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(sub === 0 ? 0.06 : 0.03, ht);
        gain.gain.exponentialRampToValueAtTime(0.001, ht + 0.05);
        noise.connect(hpf); hpf.connect(gain); gain.connect(master);
        noise.start(ht); noise.stop(ht + 0.06);
        nodes.push(noise);
      }
    }
  }

  const duration = totalBars * barDur;
  return { master, nodes, duration };
}

// Waveform bars (animates when playing)
function Waveform({ playing, color = P, bars = 40, height = 32 }) {
  const [seed] = useState(() => Array.from({ length: bars }, (_, i) => 0.2 + Math.abs(Math.sin(i * 0.7)) * 0.6 + Math.random() * 0.2));
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => setTick(t => t + 1), 120);
    return () => clearInterval(iv);
  }, [playing]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 1.5, height }}>
      {seed.map((h, i) => {
        const active = playing ? (h * 0.6 + Math.sin((tick + i) * 0.4) * 0.3 + 0.1) : h;
        return <div key={i} style={{ width: 3, height: `${Math.max(10, active * 100)}%`, background: color, borderRadius: 1.5, opacity: playing ? 0.85 : 0.35, transition: "height .12s ease" }} />;
      })}
    </div>
  );
}

function Player({ label, color: c = P, small, showWave, variant = "A" }) {
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const timerRef = useRef(null);
  const synthRef = useRef(null);
  const loopRef = useRef(null);

  const startAudio = () => {
    try {
      const ctx = getAudioCtx();
      stopAudio();
      const synth = createSynthLoop(ctx, variant);
      synthRef.current = synth;
      // Loop the synth
      const loop = () => {
        if (!synthRef.current) return;
        const s = createSynthLoop(ctx, variant);
        synthRef.current = s;
        loopRef.current = setTimeout(loop, s.duration * 1000);
      };
      loopRef.current = setTimeout(loop, synth.duration * 1000);
    } catch (e) { /* Web Audio not available */ }
  };

  const stopAudio = () => {
    if (synthRef.current) {
      try { synthRef.current.master.gain.linearRampToValueAtTime(0, getAudioCtx().currentTime + 0.1); } catch (e) {}
      synthRef.current = null;
    }
    if (loopRef.current) { clearTimeout(loopRef.current); loopRef.current = null; }
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      stopAudio();
    } else {
      if (prog >= 100) setProg(0);
      setPlaying(true);
      startAudio();
    }
  };

  useEffect(() => {
    if (playing) timerRef.current = setInterval(() => setProg(p => { if (p >= 100) { setPlaying(false); stopAudio(); return 0; } return p + .5; }), 100);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [playing]);

  useEffect(() => { return () => stopAudio(); }, []);

  const totalSec = 210;
  const curSec = Math.floor(prog / 100 * totalSec);
  return (
    <div style={{ background: "#FAFAFA", borderRadius: 10, border: `1px solid ${BD}`, overflow: "hidden" }}>
      {showWave && (
        <div style={{ padding: "10px 16px 4px", cursor: "pointer" }} onClick={togglePlay}>
          <Waveform playing={playing} color={c} bars={showWave === "large" ? 60 : 40} height={showWave === "large" ? 48 : 32} />
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: small ? "8px 12px" : "10px 16px" }}>
        <button onClick={togglePlay} style={{
          width: small ? 32 : 40, height: small ? 32 : 40, borderRadius: "50%", border: "none",
          background: c, color: "#fff", fontSize: small ? 12 : 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          boxShadow: playing ? `0 0 0 4px ${c}30` : "none", transition: "box-shadow .2s",
        }}>{playing ? "⏸" : "▶"}</button>
        <div style={{ flex: 1 }}>
          {label && <div style={{ fontSize: 12, color: GR, marginBottom: 4 }}>{label}</div>}
          <div style={{ height: 4, background: BD, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${prog}%`, background: c, borderRadius: 2, transition: "width .1s linear" }} />
          </div>
        </div>
        <span style={{ fontSize: 11, color: GR, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
          {Math.floor(curSec / 60)}:{String(curSec % 60).padStart(2, "0")} / 3:30
        </span>
      </div>
    </div>
  );
}

function ABPlayer({ a = "Track A", b = "Track B", showWave }) {
  const [sel, setSel] = useState("A");
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {["A", "B"].map(t => (
          <button key={t} onClick={() => setSel(t)} style={{
            flex: 1, padding: "10px 0", borderRadius: 8, border: "none", fontFamily: font,
            background: sel === t ? P : "#F3F4F6", color: sel === t ? "#fff" : GR, fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>{t === "A" ? a : b}</button>
        ))}
      </div>
      {sel === "A" ? (
        <Player key="playerA" label={a} showWave={showWave} variant="A" />
      ) : (
        <Player key="playerB" label={b} showWave={showWave} variant="B" />
      )}
    </div>
  );
}

// ─── Pipeline Stepper ───
function Stepper({ status, instrumental }) {
  const ci = IDX[status] ?? 0;
  const steps = instrumental ? STEPS.filter(s => s.key !== "LYRICS_DONE") : STEPS;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", padding: "6px 0" }}>
      {steps.map((step, i) => {
        const ri = IDX[step.key]; const done = ri < ci; const cur = ri === ci;
        return (
          <div key={step.key} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 54 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700,
                background: done ? G : cur ? P : "#F3F4F6", color: done || cur ? "#fff" : GR,
              }}>{done ? "✓" : step.n}</div>
              <span style={{ fontSize: 9, color: done ? G : cur ? P : GR, marginTop: 2, fontWeight: cur ? 700 : 400, textAlign: "center" }}>{step.label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ width: 14, height: 2, background: done ? G : BD, marginBottom: 14 }} />}
          </div>
        );
      })}
    </div>
  );
}

function Badge({ status }) {
  const s = STEPS.find(x => x.key === status);
  const ci = IDX[status] ?? 0;
  const color = status === "RELEASED" ? G : ci >= IDX.MIXED ? G : ci >= IDX.BRIEFED ? P : GR;
  return <span style={{ padding: "3px 10px", borderRadius: 16, fontSize: 11, fontWeight: 600, background: color + "15", color }}>{s?.label || status}</span>;
}

function ProgressBar({ songs }) {
  const total = songs.length;
  const done = songs.filter(s => s.status === "RELEASED").length;
  const inProg = songs.filter(s => s.status !== "DRAFT" && s.status !== "RELEASED").length;
  const pct = total > 0 ? ((done + inProg * 0.5) / total * 100) : 0;
  return (
    <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${P}, ${G})`, borderRadius: 3, transition: "width .3s" }} />
    </div>
  );
}

// ─── Confetti ───
function Confetti() {
  const colors = [P, G, Y, "#3B82F6", "#EC4899", "#F97316"];
  const [particles] = useState(() => Array.from({ length: 60 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 2, dur: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)], size: 4 + Math.random() * 6,
    rotate: Math.random() * 360,
  })));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, top: -10,
          width: p.size, height: p.size * 1.5, background: p.color, borderRadius: 2,
          animation: `fall ${p.dur}s ease-in ${p.delay}s forwards`, transform: `rotate(${p.rotate}deg)`,
        }} />
      ))}
      <style>{`@keyframes fall{0%{top:-10px;opacity:1}100%{top:110vh;opacity:0}}`}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TAB COMPONENTS
// ════════════════════════════════════════════════════════════════

// ── BRIEF ──
function BriefTab({ song, onUpdate }) {
  const [title, setTitle] = useState(song.title);
  const [type, setType] = useState(song.songType || null);
  const [genre, setGenre] = useState(song.genre || "Pop Ballad");
  const [mood, setMood] = useState(song.mood || "");
  const [bpm, setBpm] = useState(song.bpm || "78");
  const [key_, setKey_] = useState(song.key_ || "C minor");

  const types = [
    { key: "instrumental", icon: "🎹", label: "เพลงบรรเลง", sub: "ไม่มีเนื้อร้อง" },
    { key: "lyrics_first", icon: "📝", label: "เนื้อร้องก่อน", sub: "เขียนเนื้อก่อน สร้างดนตรี" },
    { key: "melody_first", icon: "🎵", label: "ทำนองก่อน", sub: "สร้างทำนอง เพิ่มเนื้อทีหลัง" },
  ];

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 20 }}>
        <Label>ชื่อเพลง</Label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="ตั้งชื่อเพลง..."
          style={{ width: "100%", padding: "12px 14px", fontSize: 16, border: `1px solid ${BD}`, borderRadius: 10, fontFamily: font, outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <Label>ประเภทเพลง</Label>
        <div style={{ display: "flex", gap: 10 }}>
          {types.map(t => (
            <button key={t.key} onClick={() => setType(t.key)} style={{
              flex: 1, padding: 22, borderRadius: 14, cursor: "pointer", fontFamily: font,
              border: type === t.key ? `2px solid ${P}` : `1px solid ${BD}`, background: type === t.key ? PL : BG,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 36 }}>{t.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: type === t.key ? P : "#374151" }}>{t.label}</span>
              <span style={{ fontSize: 11, color: GR }}>{t.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        <div><Label>แนวเพลง</Label>
          <select value={genre} onChange={e => setGenre(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${BD}`, fontFamily: font, fontSize: 13 }}>
            {["Pop Ballad", "Pop", "Rock", "R&B", "Jazz", "EDM", "Hip-Hop", "ลูกทุ่ง", "สตริง", "Classical"].map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div><Label>Mood</Label>
          <select value={mood} onChange={e => setMood(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${BD}`, fontFamily: font, fontSize: 13 }}>
            {["", "เศร้า", "โรแมนติก", "สนุกสนาน", "มีพลัง", "ผ่อนคลาย"].map(m => <option key={m} value={m}>{m || "-- เลือก --"}</option>)}
          </select>
        </div>
        <div><Label>BPM</Label>
          <input value={bpm} onChange={e => setBpm(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${BD}`, fontFamily: font, fontSize: 13, boxSizing: "border-box" }} />
        </div>
        <div><Label>Key</Label>
          <input value={key_} onChange={e => setKey_(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${BD}`, fontFamily: font, fontSize: 13, boxSizing: "border-box" }} />
        </div>
      </div>

      <Btn big disabled={!title || !type} onClick={() => onUpdate({ ...song, title, songType: type, genre, mood, bpm, key_, status: "BRIEFED" })}>
        ยืนยันบรีฟเพลง
      </Btn>
    </div>
  );
}

// ── LYRICS ──
function LyricsTab({ song, onUpdate }) {
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vars, setVars] = useState(null);
  const [pick, setPick] = useState(null);
  const [lyrics, setLyrics] = useState(song.lyrics || "");
  const [prompt, setPrompt] = useState("เพลงรักเศร้า คิดถึงคนรักที่จากไป บรรยากาศฝนตก กรุงเทพ");

  const samples = [
    "[Verse 1]\nลมหายใจสุดท้ายที่เธอทิ้งไว้\nยังคงวนเวียนอยู่ในใจฉัน\nสายฝนที่โปรยปรายหน้าต่าง\nเหมือนน้ำตาที่ไหลไม่หยุด\n\n[Chorus]\nถ้าเธอยังอยู่ตรงนี้\nฉันจะบอกรักเธอทุกวัน\nแต่เวลาไม่เคยรอใคร\nเหลือแค่ความทรงจำที่จางหาย",
    "[Verse 1]\nคืนนี้ฝนตกหนักอีกแล้ว\nเสียงฝนกระทบหลังคา ดังเหมือนเสียงหัวใจ\nนึกถึงเธอทุกครั้งที่ลมพัดผ่าน\nกลิ่นดินหลังฝน ทำให้คิดถึงวันเก่าๆ\n\n[Chorus]\nลมหายใจสุดท้าย ยังเป็นชื่อเธอ\nแม้เธอไปไกลแค่ไหน\nหัวใจนี้ยังเรียกหาเธอ\nในทุกค่ำคืนที่ฝนพรำ",
  ];

  const gen = () => { setLoading(true); setTimeout(() => { setVars(samples); setLoading(false); }, 2000); };

  if (!mode) return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>เนื้อร้อง</div>
      <div style={{ display: "flex", gap: 10 }}>
        {[
          { k: "ai", icon: "✨", label: "AI สร้างให้", sub: "พิมพ์คำสั่ง แล้ว AI แต่งเนื้อเพลง" },
          { k: "manual", icon: "✍️", label: "เขียนเอง", sub: "พิมพ์เนื้อเพลงโดยตรง" },
        ].map(m => (
          <button key={m.k} onClick={() => setMode(m.k)} style={{
            flex: 1, padding: 28, borderRadius: 14, cursor: "pointer", fontFamily: font,
            border: `1px solid ${BD}`, background: BG, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 32 }}>{m.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>{m.label}</span>
            <span style={{ fontSize: 12, color: GR }}>{m.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 620 }}>
      <button onClick={() => { setMode(null); setVars(null); }} style={{ background: "none", border: "none", color: P, cursor: "pointer", fontSize: 13, fontFamily: font, marginBottom: 12 }}>← ย้อนกลับ</button>

      {mode === "ai" && !vars && !loading && (
        <div>
          <ApiBadge type="mureka" endpoint="POST /v1/lyrics/generate" cost="$0.009" />
          <div style={{ marginTop: 8 }}>
            <Label>Prompt สำหรับ AI</Label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} style={{
              width: "100%", height: 80, padding: 12, fontSize: 14, border: `1px solid ${BD}`,
              borderRadius: 10, fontFamily: font, resize: "vertical", boxSizing: "border-box",
            }} />
          </div>
          <div style={{ marginTop: 12 }}><Btn big onClick={gen}>✨ Gen เนื้อเพลง</Btn></div>
        </div>
      )}

      {loading && <Spinner text="Mureka กำลังแต่งเนื้อเพลง" />}

      {vars && (
        <div>
          <ApiBadge type="mureka" endpoint="POST /v1/lyrics/generate" cost="$0.009" />
          <div style={{ fontSize: 13, color: GR, margin: "8px 0 10px" }}>เลือกเวอร์ชันที่ชอบ แล้วแก้ไขได้:</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {vars.map((_, i) => (
              <button key={i} onClick={() => { setPick(i); setLyrics(vars[i]); }} style={{
                padding: "8px 22px", borderRadius: 8, fontFamily: font, cursor: "pointer", fontSize: 13,
                border: pick === i ? `2px solid ${P}` : `1px solid ${BD}`,
                background: pick === i ? PL : BG, color: pick === i ? P : GR, fontWeight: 700,
              }}>เวอร์ชัน {i + 1}</button>
            ))}
          </div>
          <textarea value={lyrics} onChange={e => setLyrics(e.target.value)} style={{
            width: "100%", height: 180, padding: 14, fontSize: 14, border: `1px solid ${BD}`,
            borderRadius: 10, fontFamily: font, lineHeight: 1.8, boxSizing: "border-box",
          }} />
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <Btn big onClick={() => onUpdate({ ...song, lyrics, status: "LYRICS_DONE" })}>ยืนยันเนื้อร้อง</Btn>
            <Btn outline onClick={gen}>Gen ใหม่</Btn>
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div>
          <textarea value={lyrics} onChange={e => setLyrics(e.target.value)}
            placeholder={"[Verse 1]\nพิมพ์เนื้อเพลงที่นี่...\n\n[Chorus]\n..."}
            style={{ width: "100%", height: 220, padding: 14, fontSize: 14, border: `1px solid ${BD}`, borderRadius: 10, fontFamily: font, lineHeight: 1.8, boxSizing: "border-box" }} />
          <div style={{ marginTop: 12 }}>
            <Btn big disabled={!lyrics} onClick={() => onUpdate({ ...song, lyrics, status: "LYRICS_DONE" })}>ยืนยันเนื้อร้อง</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── GENERATE ──
function GenerateTab({ song, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  const go = () => { setLoading(true); setTimeout(() => { setLoading(false); setDone(true); setCount(c => c + 1); }, 2500); };

  const isInst = song.songType === "instrumental";

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>สร้าง Reference Track</div>
      <div style={{ fontSize: 13, color: GR, marginBottom: 16, padding: "10px 14px", background: YL, borderRadius: 8, border: `1px solid #FDE68A` }}>
        ⚠️ นี่คือ <strong>Reference Track</strong> — เพลงตัวอย่างให้ทีมเข้าใจทิศทาง Arranger จะเรียบเรียงจากเพลงนี้
      </div>

      {!loading && !done && (
        <div>
          <ApiBadge type="mureka" endpoint={isInst ? "POST /v1/instrumental/generate" : "POST /v1/song/generate"} cost="$0.045" />
          <div style={{ marginTop: 8 }}>
            <Label>สไตล์เพลง</Label>
            <textarea defaultValue={`${song.genre || "Pop Ballad"}, ${song.mood || "เศร้า"}, ${song.key_ || "C minor"}, ${song.bpm || "78"} BPM`}
              style={{ width: "100%", height: 60, padding: 12, fontSize: 14, border: `1px solid ${BD}`, borderRadius: 10, fontFamily: font, boxSizing: "border-box" }} />
          </div>
          {song.lyrics && (
            <div style={{ margin: "12px 0", padding: 10, background: "#FAFAFA", borderRadius: 8, fontSize: 12, color: GR }}>
              📝 เนื้อร้องที่จะนำไปสร้างเพลง: {song.lyrics.substring(0, 100)}...
            </div>
          )}
          <Btn big onClick={go}>🎵 สร้าง Reference Track</Btn>
        </div>
      )}

      {loading && <Spinner text="Mureka กำลังสร้างเพลง (~45 วินาที)" />}

      {done && !loading && (
        <div>
          <div style={{ padding: "14px 18px", background: GL, borderRadius: 12, border: `1px solid #BBF7D0`, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>✅</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: G }}>สร้างเพลงสำเร็จ!</div>
              <div style={{ fontSize: 12, color: GR }}>Mureka ส่งกลับ 2 เวอร์ชัน — เลือกฟังแล้วกดยืนยัน</div>
            </div>
          </div>

          <ApiBadge type="mureka" endpoint={isInst ? "POST /v1/instrumental/generate" : "POST /v1/song/generate"} cost="$0.045" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0 12px" }}>
            <span style={{ fontSize: 12, color: GR }}>สร้างแล้ว {count} ครั้ง · model: auto · n=2 · ~3:30 นาที</span>
            <Btn outline onClick={go}>สร้างใหม่</Btn>
          </div>

          <Card active style={{ padding: 18 }}>
            <ABPlayer a="🎵 Track A" b="🎵 Track B" showWave="large" />
          </Card>

          <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
            <Btn big color={G} onClick={() => onUpdate({ ...song, status: "REFERENCE_DONE" })}>✓ ยืนยัน Reference Track</Btn>
            <span style={{ fontSize: 12, color: GR }}>เลือก track ที่ชอบ แล้วกดยืนยัน</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ARRANGE ──
function ArrangeTab({ song, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [stems, setStems] = useState(null);

  const allStems = [
    { id: "vocals", name: "Vocals", icon: "🎤" },
    { id: "drums", name: "Drums", icon: "🥁" },
    { id: "bass", name: "Bass", icon: "🎸" },
    { id: "guitar", name: "Guitar", icon: "🎸" },
    { id: "keyboard", name: "Keyboard", icon: "🎹" },
    { id: "strings", name: "Strings", icon: "🎻" },
  ];

  const separate = () => { setLoading(true); setTimeout(() => { setStems(allStems.map(s => ({ ...s, d: null }))); setLoading(false); }, 2500); };
  const setD = (id, d) => setStems(p => p.map(s => s.id === id ? { ...s, d } : s));
  const allDone = stems?.every(s => s.d);

  return (
    <div style={{ maxWidth: 660 }}>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>เรียบเรียงเพลง</div>
      <div style={{ fontSize: 13, color: GR, marginBottom: 16 }}>ฟัง Reference → แยก Stem → ตัดสินใจแต่ละ Stem</div>

      <Player label="Reference Track" showWave="large" />

      <div style={{ marginTop: 16 }}>
        {!stems && !loading && (
          <div>
            <ApiBadge type="mureka" endpoint="POST /v1/song/stem" cost="$0.06" />
            <div style={{ marginTop: 8 }}><Btn big onClick={separate}>🔀 แยก Stems</Btn></div>
          </div>
        )}
        {loading && <Spinner text="Mureka กำลังแยก Stem" />}
      </div>

      {stems && (
        <div style={{ marginTop: 16 }}>
          <ApiBadge type="mureka" endpoint="POST /v1/song/stem" cost="$0.06" />
          <div style={{ fontSize: 12, color: GR, margin: "8px 0 12px" }}>Returns ZIP with WAV stems → {stems.length} tracks</div>

          {stems.map(stem => (
            <div key={stem.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: `1px solid ${BD}` }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{stem.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{stem.name}</div>
                <Player small color={stem.d === "keep" ? G : stem.d === "remove" ? "#ccc" : P} />
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {[{ k: "keep", l: "✅ ใช้ AI", c: G }, { k: "rerecord", l: "🔄 อัดใหม่", c: Y }, { k: "remove", l: "❌ ไม่ใช้", c: R }].map(o => (
                  <button key={o.k} onClick={() => setD(stem.id, o.k)} style={{
                    padding: "6px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font,
                    border: stem.d === o.k ? `2px solid ${o.c}` : `1px solid ${BD}`,
                    background: stem.d === o.k ? o.c + "12" : BG, color: stem.d === o.k ? o.c : GR,
                  }}>{o.l}</button>
                ))}
              </div>
            </div>
          ))}

          {stems.filter(s => s.d === "rerecord").length > 0 && (
            <div style={{ marginTop: 12, padding: 12, background: YL, borderRadius: 10, border: `1px solid #FDE68A` }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>มอบหมายนักดนตรี:</div>
              {stems.filter(s => s.d === "rerecord").map(stem => (
                <div key={stem.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13 }}>
                  <span>{stem.icon} {stem.name} →</span>
                  <select style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${BD}`, fontFamily: font, fontSize: 12 }}>
                    <option>เลือกนักดนตรี...</option>
                    <option>สมชาย — Guitarist</option>
                    <option>สมหญิง — Vocalist</option>
                    <option>ธนภัทร — Drummer</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <Btn big color={G} disabled={!allDone} onClick={() => {
              const kept = stems.filter(s => s.d === "keep").map(s => s.name);
              const rerecord = stems.filter(s => s.d === "rerecord").map(s => s.name);
              onUpdate({ ...song, stems: { kept, rerecord }, status: "ARRANGED" });
            }}>✓ ยืนยัน Arrangement</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RECORD ──
function RecordTab({ song, onUpdate }) {
  const rerecordStems = song.stems?.rerecord || ["Vocals", "Guitar"];
  const [tasks, setTasks] = useState(rerecordStems.map((name, i) => ({
    id: i, name, icon: name === "Vocals" ? "🎤" : name === "Guitar" ? "🎸" : name === "Drums" ? "🥁" : "🎵",
    who: name === "Vocals" ? "สมหญิง" : name === "Guitar" ? "สมชาย" : "ธนภัทร",
    uploaded: false, approved: false,
  })));

  const upload = id => setTasks(p => p.map(t => t.id === id ? { ...t, uploaded: true } : t));
  const approve = id => setTasks(p => p.map(t => t.id === id ? { ...t, approved: true } : t));
  const allApproved = tasks.every(t => t.approved);

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>บันทึกเสียง</div>
      <div style={{ fontSize: 13, color: GR, marginBottom: 16 }}>Stems ที่ต้องอัดใหม่ → ฟัง AI → อัปโหลด → เปรียบเทียบ → Approve</div>

      {tasks.map(t => (
        <Card key={t.id} active={t.approved} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: GR }}>นักดนตรี: {t.who}</div>
            </div>
            <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: t.approved ? GL : t.uploaded ? "#EFF6FF" : YL,
              color: t.approved ? G : t.uploaded ? "#2563EB" : Y,
            }}>{t.approved ? "✓ Approved" : t.uploaded ? "รอ Approve" : "รอไฟล์"}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: GR, marginBottom: 4 }}>AI Stem (อ้างอิง)</div>
              <Player small color={GR} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: GR, marginBottom: 4 }}>บันทึกใหม่</div>
              {t.uploaded ? <Player small color={G} /> : (
                <div style={{ height: 48, border: `2px dashed ${BD}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: GR, fontSize: 12 }}>ยังไม่มีไฟล์</div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {!t.uploaded && <Btn onClick={() => upload(t.id)} style={{ fontSize: 13 }}>📤 Upload</Btn>}
            {t.uploaded && !t.approved && <Btn color={G} onClick={() => approve(t.id)} style={{ fontSize: 13 }}>✓ Approve</Btn>}
          </div>
        </Card>
      ))}

      <div style={{ marginTop: 14 }}>
        <Btn big color={G} disabled={!allApproved} onClick={() => onUpdate({ ...song, status: "RECORDED" })}>✓ Approve ทั้งหมด</Btn>
      </div>
    </div>
  );
}

// ── MIX ──
function MixTab({ song, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const kept = song.stems?.kept || ["Drums", "Keyboard", "Strings"];
  const human = song.stems?.rerecord || ["Vocals", "Guitar"];

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Mixing</div>
      <div style={{ fontSize: 13, color: GR, marginBottom: 16 }}>รวม Stems ทั้งหมด → Auto Mix → ตรวจสอบ</div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Tracks ({kept.length + human.length})</div>
        {kept.map((n, i) => <div key={i} style={{ padding: "6px 0", borderBottom: `1px solid ${BD}`, fontSize: 13 }}>🤖 {n} — AI Stem</div>)}
        {human.map((n, i) => <div key={i} style={{ padding: "6px 0", borderBottom: `1px solid ${BD}`, fontSize: 13 }}>🎤 {n} — บันทึกใหม่</div>)}
      </Card>

      {!loading && !done && (
        <div>
          <ApiBadge type="roex" endpoint="POST /mixpreview → /retrievefinalmix" cost="250 credits" />
          <div style={{ marginTop: 8 }}><Btn big onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); setDone(true); }, 2500); }}>🎛 Auto Mix (Roex)</Btn></div>
        </div>
      )}
      {loading && <Spinner text="Roex กำลัง Mix" />}
      {done && (
        <div>
          <ApiBadge type="roex" endpoint="POST /retrievefinalmix" cost="250 credits" />
          <div style={{ marginTop: 8 }}><ABPlayer a="ก่อน Mix" b="หลัง Mix" showWave="large" /></div>
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <Btn big color={G} onClick={() => onUpdate({ ...song, status: "MIXED" })}>✓ Approve Mix</Btn>
            <Btn outline onClick={() => setDone(false)}>Mix ใหม่</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MASTER ──
function MasterTab({ song, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [qc, setQc] = useState(null);

  const master = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false); setDone(true);
      setQc([
        { label: "LUFS", val: "-14.2", target: "-14 ± 1", ok: true },
        { label: "True Peak", val: "-1.2 dBTP", target: "< -1.0", ok: true },
        { label: "Sample Rate", val: "44.1 kHz", target: "≥ 44.1", ok: true },
        { label: "Bit Depth", val: "24-bit", target: "≥ 16", ok: true },
        { label: "Tail Silence", val: "0.8s", target: "≥ 0.5s", ok: true },
      ]);
    }, 3000);
  };

  const allPass = qc?.every(q => q.ok);

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Mastering</div>
      <div style={{ fontSize: 13, color: GR, marginBottom: 16 }}>Auto Master → QC → Approve</div>

      {!loading && !done && (
        <div>
          <ApiBadge type="roex" endpoint="POST /masteringpreview → /retrievemasteredtrack" cost="220 credits" />
          <div style={{ marginTop: 8 }}><Btn big onClick={master}>💎 Auto Master (Roex)</Btn></div>
        </div>
      )}
      {loading && <Spinner text="Roex กำลัง Master" />}
      {done && (
        <div>
          <ApiBadge type="roex" endpoint="POST /retrievemasteredtrack" cost="220 credits" />
          <div style={{ marginTop: 8 }}><ABPlayer a="ก่อน Master" b="หลัง Master" showWave="large" /></div>

          <ApiBadge type="roex" endpoint="POST /mixanalysis" cost="10 credits" />
          <div style={{ marginTop: 8, background: "#FAFAFA", borderRadius: 12, overflow: "hidden", border: `1px solid ${BD}` }}>
            <div style={{ padding: "10px 16px", fontWeight: 700, fontSize: 14, borderBottom: `1px solid ${BD}` }}>Auto QC Panel</div>
            {qc.map((q, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: i < qc.length - 1 ? `1px solid ${BD}` : "none", fontSize: 13 }}>
                <span style={{ fontWeight: 600, width: 100 }}>{q.label}</span>
                <span style={{ flex: 1, color: GR }}>{q.val}</span>
                <span style={{ color: GR, fontSize: 11, marginRight: 10 }}>{q.target}</span>
                <span style={{ fontWeight: 700, color: q.ok ? G : R }}>{q.ok ? "✅ ผ่าน" : "❌ ไม่ผ่าน"}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <Btn big color={G} disabled={!allPass} onClick={() => onUpdate({ ...song, status: "MASTERED" })}>✓ Approve Master</Btn>
            <Btn outline onClick={() => { setDone(false); setQc(null); }}>Master ใหม่</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RELEASE ──
function ReleaseTab({ song, onUpdate }) {
  const [cover, setCover] = useState(null);
  const [genCover, setGenCover] = useState(false);
  const [coverPick, setCoverPick] = useState(null);
  const [signed, setSigned] = useState({ a: true, b: false, c: true, d: true });
  const [released, setReleased] = useState(false);

  const split = [
    { id: "a", name: "Composer A", role: "Composer", pct: 40 },
    { id: "b", name: "Artist B", role: "Artist", pct: 25 },
    { id: "c", name: "Producer C", role: "Producer", pct: 20 },
    { id: "d", name: "Nova Label", role: "Label", pct: 15 },
  ];

  const allSigned = Object.values(signed).every(v => v);
  const checklist = [
    { l: "Split sheet ครบ 100%", ok: true },
    { l: "ผู้ร่วมงานลงนามครบ", ok: allSigned },
    { l: "QC ผ่าน", ok: true },
    { l: "Master file พร้อม", ok: true },
    { l: "Cover art พร้อม", ok: !!cover },
  ];
  const allCheck = checklist.every(c => c.ok);

  const handleRelease = () => {
    setReleased(true);
    onUpdate({ ...song, status: "RELEASED" });
  };

  return (
    <div style={{ maxWidth: 740 }}>
      {released && <Confetti />}
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>สรุป & ปล่อยเพลง</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Split Sheet */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Rights & Split Sheet</div>
          {split.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${BD}`, fontSize: 13 }}>
              <span style={{ fontWeight: 600, flex: 1 }}>{r.name}</span>
              <span style={{ color: GR, width: 70 }}>{r.role}</span>
              <span style={{ width: 36, textAlign: "center", fontWeight: 700 }}>{r.pct}%</span>
              <button onClick={() => setSigned(p => ({ ...p, [r.id]: !p[r.id] }))} style={{
                width: 24, textAlign: "center", background: "none", border: "none", cursor: "pointer", fontSize: 14,
                color: signed[r.id] ? G : GR,
              }}>{signed[r.id] ? "✓" : "○"}</button>
            </div>
          ))}
          <div style={{ textAlign: "right", marginTop: 6, fontWeight: 700, fontSize: 13, color: P }}>รวม 100%</div>
        </Card>

        {/* Cover Art */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Cover Art</div>
          <ApiBadge type="mureka" endpoint="POST /v1/suno/cover/generate" cost="1 ต่อเพลง" />

          <div style={{
            aspectRatio: "1", borderRadius: 12, marginTop: 8, marginBottom: 12, overflow: "hidden",
            background: cover ? "linear-gradient(135deg, #667eea, #764ba2)" : "#F3F4F6",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {genCover ? <Spinner text="สร้างหน้าปก" /> :
              cover ? (
                <div style={{ textAlign: "center", color: "#fff", padding: 16 }}>
                  <div style={{ fontSize: 36, marginBottom: 6 }}>🎵</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{song.title}</div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>Style {coverPick}</div>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, color: GR }}>ยังไม่มีปก</div>
                  <div style={{ fontSize: 11, color: GR }}>แนะนำ 3000×3000px</div>
                </div>
              )
            }
          </div>

          {!cover && !genCover && (
            <div style={{ display: "flex", gap: 6 }}>
              <Btn onClick={() => { setGenCover(true); setTimeout(() => { setGenCover(false); setCover(true); setCoverPick("A"); }, 2000); }} style={{ flex: 1, fontSize: 13 }}>🎨 AI สร้าง</Btn>
              <Btn outline onClick={() => { setCover(true); setCoverPick("Upload"); }} style={{ flex: 1, fontSize: 13 }}>📤 อัปโหลด</Btn>
            </div>
          )}
          {cover && !genCover && (
            <div style={{ display: "flex", gap: 6 }}>
              <Btn outline onClick={() => { setCoverPick(coverPick === "A" ? "B" : "A"); }} style={{ flex: 1, fontSize: 12 }}>
                สลับ Style ({coverPick === "A" ? "B" : "A"})
              </Btn>
            </div>
          )}
        </Card>
      </div>

      {/* Checklist */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Release Checklist</div>
        {checklist.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < checklist.length - 1 ? `1px solid ${BD}` : "none" }}>
            <div style={{
              width: 20, height: 20, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
              background: c.ok ? GL : "#F3F4F6", color: c.ok ? G : GR, fontSize: 12, fontWeight: 700,
            }}>{c.ok ? "✓" : ""}</div>
            <span style={{ fontSize: 13, color: c.ok ? "#374151" : GR }}>{c.l}</span>
          </div>
        ))}
      </Card>

      {/* Metadata */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Metadata</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[["ชื่อเพลง", song.title], ["ศิลปิน", "Artist B"], ["แนวเพลง", song.genre || "Pop Ballad"],
            ["ISRC", "TH-NVA-26-00001"], ["Release", "Single"], ["วันเผยแพร่", "2026-05-01"]
          ].map(([k, v], i) => (
            <div key={i}><div style={{ fontSize: 11, color: GR }}>{k}</div><div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>{v}</div></div>
          ))}
        </div>
      </Card>

      {/* Distribution */}
      <Card style={{ marginBottom: 16 }}>
        <ApiBadge type="landr" endpoint="Distribution API" cost="Coming Soon" />
        <div style={{ fontSize: 13, color: GR, marginTop: 4 }}>เชื่อมต่อ LANDR สำหรับเผยแพร่ไปยัง Spotify, Apple Music, YouTube Music</div>
      </Card>

      {!released ? (
        <Btn big color={G} disabled={!allCheck} onClick={handleRelease}>
          🚀 ปล่อยเพลง
        </Btn>
      ) : (
        <div style={{ textAlign: "center", padding: 20, background: GL, borderRadius: 14, border: `2px solid ${G}` }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: G }}>ปล่อยเพลงสำเร็จ!</div>
          <div style={{ fontSize: 14, color: GR, marginTop: 4 }}>{song.title} — Status: RELEASED</div>
        </div>
      )}
    </div>
  );
}

// ── IDEATION WIZARD ──
function Wizard({ onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [type, setType] = useState("single");
  const [num, setNum] = useState(1);
  const [concept, setConcept] = useState("");
  const [genres, setGenres] = useState([]);

  const types = [
    { k: "single", label: "Single", sub: "1 เพลง", n: 1 },
    { k: "ep", label: "EP", sub: "2–6 เพลง", n: 4 },
    { k: "album", label: "Album", sub: "7+ เพลง", n: 10 },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: BG, borderRadius: 18, padding: 32, maxWidth: 500, width: "90%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{step === 1 ? "สร้างโปรเจกต์ใหม่" : "คอนเซปต์"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: GR }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: P }} />
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: step >= 2 ? P : BD }} />
        </div>

        {step === 1 && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <Label>ชื่อโปรเจกต์</Label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="เช่น: อัลบั้มรักในสายฝน"
                style={{ width: "100%", padding: "12px 14px", fontSize: 15, border: `1px solid ${BD}`, borderRadius: 10, fontFamily: font, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <Label>ประเภท</Label>
              <div style={{ display: "flex", gap: 8 }}>
                {types.map(t => (
                  <button key={t.k} onClick={() => { setType(t.k); setNum(t.n); }} style={{
                    flex: 1, padding: 16, borderRadius: 12, cursor: "pointer", fontFamily: font, textAlign: "center",
                    border: type === t.k ? `2px solid ${P}` : `1px solid ${BD}`, background: type === t.k ? PL : BG,
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: type === t.k ? P : "#374151" }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: GR, marginTop: 2 }}>{t.sub}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <Label>จำนวนเพลง</Label>
              <input type="number" value={num} min={1} onChange={e => setNum(parseInt(e.target.value) || 1)}
                style={{ width: 90, padding: "10px", fontSize: 18, fontWeight: 700, textAlign: "center", border: `1px solid ${BD}`, borderRadius: 8, fontFamily: font }} />
            </div>
            <Btn big disabled={!name} onClick={() => setStep(2)}>ถัดไป →</Btn>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <Label>คอนเซปต์ / ธีม</Label>
              <textarea value={concept} onChange={e => setConcept(e.target.value)} placeholder="ไอเดีย อารมณ์ เรื่องราว..."
                style={{ width: "100%", height: 80, padding: 12, fontSize: 14, border: `1px solid ${BD}`, borderRadius: 10, fontFamily: font, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <Label>อัปโหลด Reference</Label>
              <div style={{ border: `2px dashed ${BD}`, borderRadius: 12, padding: 22, textAlign: "center", color: GR, fontSize: 13 }}>📤 ลากไฟล์ MP3/WAV มาวาง (สูงสุด 50MB)</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <Label>แนวเพลง</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Pop", "Rock", "R&B", "Jazz", "EDM", "Hip-Hop", "ลูกทุ่ง", "สตริง", "Classical"].map(g => (
                  <button key={g} onClick={() => setGenres(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])} style={{
                    padding: "6px 14px", borderRadius: 16, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font,
                    border: genres.includes(g) ? `2px solid ${P}` : `1px solid ${BD}`,
                    background: genres.includes(g) ? PL : BG, color: genres.includes(g) ? P : GR,
                  }}>{g}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn outline onClick={() => setStep(1)}>← ย้อนกลับ</Btn>
              <Btn big onClick={() => onCreate({ name, type, num, concept, genres })}>สร้างโปรเจกต์ ({num} เพลง)</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════

const INIT_PROJECTS = [{
  id: 1, name: "Single — ลมหายใจสุดท้าย", type: "single",
  songs: [{
    id: 1, title: "ลมหายใจสุดท้าย", status: "DRAFT", songType: null,
    genre: "Pop Ballad", mood: "เศร้า", bpm: "78", key_: "C minor",
    lyrics: "", stems: null,
  }],
}];

export default function App() {
  const [view, setView] = useState("dash");
  const [wizard, setWizard] = useState(false);
  const [projects, setProjects] = useState(INIT_PROJECTS);
  const [pi, setPi] = useState(0);
  const [si, setSi] = useState(0);
  const [tab, setTab] = useState("brief");

  const proj = projects[pi];
  const song = proj?.songs[si];

  const upd = (s) => {
    setProjects(p => { const c = JSON.parse(JSON.stringify(p)); c[pi].songs[si] = s; return c; });
    const m = { BRIEFED: song?.songType === "instrumental" ? "generate" : "lyrics", LYRICS_DONE: "generate", REFERENCE_DONE: "arrange", ARRANGED: "record", RECORDED: "mix", MIXED: "master", MASTERED: "release" };
    if (m[s.status]) setTab(m[s.status]);
  };

  const create = (d) => {
    const np = { id: projects.length + 1, name: d.name, type: d.type, songs: Array.from({ length: d.num }, (_, i) => ({ id: i + 1, title: `เพลงที่ ${i + 1}`, status: "DRAFT", songType: null, genre: d.genres?.[0] || "Pop", lyrics: "", stems: null })) };
    setProjects(p => [...p, np]); setPi(projects.length); setSi(0); setWizard(false); setView("studio"); setTab("brief");
  };

  const reset = () => { setProjects(JSON.parse(JSON.stringify(INIT_PROJECTS))); setPi(0); setSi(0); setTab("brief"); setView("dash"); };

  const getTabs = (s) => {
    if (!s) return [];
    const i = IDX[s.status] || 0;
    const t = [{ k: "brief", l: "บรีฟ" }];
    if (i >= IDX.BRIEFED && s.songType !== "instrumental") t.push({ k: "lyrics", l: "เนื้อร้อง" });
    if (i >= IDX.BRIEFED) t.push({ k: "generate", l: "Reference Track" });
    if (i >= IDX.REFERENCE_DONE) t.push({ k: "arrange", l: "เรียบเรียง" });
    if (i >= IDX.ARRANGED) t.push({ k: "record", l: "บันทึกเสียง" });
    if (i >= IDX.RECORDED) t.push({ k: "mix", l: "Mix" });
    if (i >= IDX.MIXED) t.push({ k: "master", l: "Master" });
    if (i >= IDX.MASTERED) t.push({ k: "release", l: "สรุป & ปล่อย" });
    return t;
  };

  // ── KPI ──
  const allSongs = projects.flatMap(p => p.songs);
  const kpis = [
    { label: "โครงการทั้งหมด", val: projects.length, color: P },
    { label: "กำลังดำเนินการ", val: allSongs.filter(s => s.status !== "DRAFT" && s.status !== "RELEASED").length, color: "#3B82F6" },
    { label: "ติดค้าง", val: allSongs.filter(s => s.status === "DRAFT").length, color: Y },
    { label: "ปล่อยแล้ว", val: allSongs.filter(s => s.status === "RELEASED").length, color: G },
  ];

  // ── DASHBOARD ──
  if (view === "dash") {
    return (
      <div style={{ fontFamily: font, background: BG, minHeight: "100vh", display: "flex" }}>
        {wizard && <Wizard onClose={() => setWizard(false)} onCreate={create} />}

        {/* Sidebar */}
        <div style={{ width: 56, background: "#FAFAFA", borderRight: `1px solid ${BD}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: P, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800, marginBottom: 12 }}>N</div>
          {[{ icon: <Home size={18} />, active: true }, { icon: <Music size={18} /> }, { icon: <User size={18} /> }, { icon: <Settings size={18} /> }].map((item, i) => (
            <div key={i} style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: item.active ? P : GR, background: item.active ? PL : "transparent", cursor: "pointer" }}>{item.icon}</div>
          ))}
          <div style={{ marginTop: "auto" }}>
            <div onClick={reset} style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: GR, cursor: "pointer" }} title="Reset"><RotateCcw size={16} /></div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "28px 36px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>Nova Music OS</div>
              <div style={{ fontSize: 13, color: GR }}>AI-Powered Music Production</div>
            </div>
            <Btn big onClick={() => setWizard(true)}>+ สร้างโครงการใหม่</Btn>
          </div>

          {/* KPIs */}
          <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
            {kpis.map((k, i) => (
              <Card key={i} style={{ flex: 1, textAlign: "center", padding: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: k.color }}>{k.val}</div>
                <div style={{ fontSize: 12, color: GR, marginTop: 2 }}>{k.label}</div>
              </Card>
            ))}
          </div>

          {/* Cost Breakdown */}
          <Card style={{ marginBottom: 20, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>💰 ต้นทุนต่อเพลง (Full Pipeline)</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <ApiBadge type="mureka" endpoint="Lyrics" cost="$0.009" />
              <ApiBadge type="mureka" endpoint="Song Gen" cost="$0.045" />
              <ApiBadge type="mureka" endpoint="Stem Split" cost="$0.06" />
              <ApiBadge type="roex" endpoint="Mix" cost="250 cr" />
              <ApiBadge type="roex" endpoint="Master" cost="220 cr" />
              <ApiBadge type="roex" endpoint="Analysis" cost="10 cr" />
            </div>
          </Card>

          {/* Projects */}
          {projects.map((p, pidx) => (
            <Card key={p.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 700, flex: 1 }}>{p.name}</div>
                <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: PL, color: P }}>
                  {p.type === "single" ? "Single" : p.type === "ep" ? "EP" : "Album"} · {p.songs.length} เพลง
                </span>
              </div>
              <ProgressBar songs={p.songs} />
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {p.songs.map((s, sidx) => (
                  <div key={s.id} onClick={() => { setPi(pidx); setSi(sidx); setView("studio"); setTab("brief"); }}
                    style={{
                      padding: "10px 14px", borderRadius: 8, cursor: "pointer", border: `1px solid ${BD}`,
                      display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                    onMouseLeave={e => e.currentTarget.style.background = BG}
                  >
                    <div>
                      <span style={{ fontWeight: 600 }}>{s.title}</span>
                      <span style={{ color: GR, fontSize: 12, marginLeft: 8 }}>{s.genre}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Badge status={s.status} />
                      <ChevronRight size={14} color={GR} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── SONG STUDIO ──
  const tabs = getTabs(song);

  return (
    <div style={{ fontFamily: font, background: BG, minHeight: "100vh", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: 56, background: "#FAFAFA", borderRight: `1px solid ${BD}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 8, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, background: P, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800, marginBottom: 12 }}>N</div>
        <div onClick={() => setView("dash")} style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: GR, cursor: "pointer" }}><Home size={18} /></div>
        <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: P, background: PL }}><Music size={18} /></div>
        <div style={{ marginTop: "auto" }}>
          <div onClick={reset} style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: GR, cursor: "pointer" }} title="Reset"><RotateCcw size={16} /></div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ padding: "16px 32px", borderBottom: `1px solid ${BD}`, display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setView("dash")} style={{ background: "none", border: `1px solid ${BD}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontFamily: font, fontSize: 13, color: GR }}>← กลับ</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{song?.title}</div>
            <div style={{ fontSize: 12, color: GR }}>{proj?.name} · {song?.genre} · {song?.bpm} BPM · {song?.key_}</div>
          </div>
          <Badge status={song?.status} />
        </div>

        {/* Stepper */}
        <div style={{ padding: "8px 32px", borderBottom: `1px solid ${BD}` }}>
          <Stepper status={song?.status || "DRAFT"} instrumental={song?.songType === "instrumental"} />
        </div>

        {/* Song switcher */}
        {proj?.songs.length > 1 && (
          <div style={{ padding: "8px 32px", borderBottom: `1px solid ${BD}`, display: "flex", gap: 4, overflowX: "auto" }}>
            {proj.songs.map((s, i) => (
              <button key={s.id} onClick={() => { setSi(i); setTab("brief"); }} style={{
                padding: "5px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: font,
                border: si === i ? `2px solid ${P}` : `1px solid ${BD}`,
                background: si === i ? PL : BG, fontWeight: si === i ? 700 : 400, color: si === i ? P : GR,
              }}>{s.title}</button>
            ))}
          </div>
        )}

        {/* Tab bar */}
        <div style={{ padding: "0 32px", borderBottom: `1px solid ${BD}`, display: "flex", gap: 0 }}>
          {tabs.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              padding: "12px 18px", border: "none", fontFamily: font, fontSize: 13, cursor: "pointer",
              borderBottom: tab === t.k ? `2px solid ${P}` : "2px solid transparent",
              color: tab === t.k ? P : GR, fontWeight: tab === t.k ? 700 : 400, background: "none",
            }}>{t.l}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: "24px 32px" }}>
          {tab === "brief" && <BriefTab song={song} onUpdate={upd} />}
          {tab === "lyrics" && <LyricsTab song={song} onUpdate={upd} />}
          {tab === "generate" && <GenerateTab song={song} onUpdate={upd} />}
          {tab === "arrange" && <ArrangeTab song={song} onUpdate={upd} />}
          {tab === "record" && <RecordTab song={song} onUpdate={upd} />}
          {tab === "mix" && <MixTab song={song} onUpdate={upd} />}
          {tab === "master" && <MasterTab song={song} onUpdate={upd} />}
          {tab === "release" && <ReleaseTab song={song} onUpdate={upd} />}
        </div>
      </div>
    </div>
  );
}

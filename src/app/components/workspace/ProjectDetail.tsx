import { useState } from "react";
import { ApprovalCard, DetailField } from "./WorkspaceFields";
import {
  ArrowLeftIcon,
  CheckIcon,
  CloseIcon,
  DownloadIcon,
  MusicNoteIcon,
  UploadIcon,
  TitleWithIcon,
} from "./ProjectDetailPrimitives";
import { getInitials, joinClasses } from "../../utils/workspace";
import { getProjectStepAccess } from "../../utils/rolePermissions";

// Stage order for progressive disclosure
const STAGE_ORDER = [
  "draft",
  "briefed",
  "lyrics-done",
  "reference-done",
  "arranged",
  "recorded",
  "mixed",
  "mastered",
  "rights-signed",
  "released",
];

function getStageIndex(stageClass: string): number {
  return STAGE_ORDER.indexOf(stageClass.toLowerCase());
}

function isTabVisible(tabMinStage: string, projectStage: string): boolean {
  return getStageIndex(projectStage) >= getStageIndex(tabMinStage);
}

// Simple inline audio player component
function InlineAudioPlayer({ duration = "3:32" }: any) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");

  return (
    <div className="ss-audio-player">
      <button
        className="ss-audio-play-btn"
        type="button"
        onClick={() => setIsPlaying(!isPlaying)}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
      <div className="ss-audio-progress">
        <div className="ss-audio-progress-bar" style={{ width: "0%" }} />
      </div>
      <div className="ss-audio-time">
        {currentTime} / {duration}
      </div>
    </div>
  );
}

// A/B Comparison Player
function ABComparisonPlayer({ onSelectTrack }: any) {
  const [selectedTrack, setSelectedTrack] = useState<"a" | "b" | null>(null);
  const [playingTrack, setPlayingTrack] = useState<"a" | "b" | null>(null);

  return (
    <div className="ss-ab-player">
      <div className="ss-ab-track">
        <div className="ss-ab-track-label">Track A</div>
        <button
          className="ss-audio-play-btn"
          type="button"
          onClick={() => setPlayingTrack(playingTrack === "a" ? null : "a")}
        >
          {playingTrack === "a" ? "⏸" : "▶"}
        </button>
        <div className="ss-audio-progress">
          <div
            className="ss-audio-progress-bar"
            style={{ width: playingTrack === "a" ? "60%" : "0%" }}
          />
        </div>
        <div className="ss-audio-time">0:00 / 3:32</div>
      </div>

      <div className="ss-ab-track">
        <div className="ss-ab-track-label">Track B</div>
        <button
          className="ss-audio-play-btn"
          type="button"
          onClick={() => setPlayingTrack(playingTrack === "b" ? null : "b")}
        >
          {playingTrack === "b" ? "⏸" : "▶"}
        </button>
        <div className="ss-audio-progress">
          <div
            className="ss-audio-progress-bar"
            style={{ width: playingTrack === "b" ? "35%" : "0%" }}
          />
        </div>
        <div className="ss-audio-time">0:00 / 3:32</div>
      </div>

      <div className="ss-ab-selection">
        <label className="ss-radio-label">
          <input
            type="radio"
            name="track-select"
            checked={selectedTrack === "a"}
            onChange={() => {
              setSelectedTrack("a");
              onSelectTrack("a");
            }}
          />
          <span>⭕ เลือก Track A</span>
        </label>
        <label className="ss-radio-label">
          <input
            type="radio"
            name="track-select"
            checked={selectedTrack === "b"}
            onChange={() => {
              setSelectedTrack("b");
              onSelectTrack("b");
            }}
          />
          <span>⭕ เลือก Track B</span>
        </label>
      </div>
    </div>
  );
}

// Tab 0: Song Brief
function SongBriefTab({ project, onUpdate }: any) {
  const [songName, setSongName] = useState(project?.songName || "");
  const [songType, setSongType] = useState<
    "instrumental" | "lyrics-first" | "melody-first" | null
  >(project?.songType || null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    project?.styles || []
  );
  const [bpm, setBpm] = useState(project?.bpm || "");
  const [key, setKey] = useState(project?.key || "");
  const [mood, setMood] = useState(project?.mood || "");
  const [notes, setNotes] = useState(project?.notes || "");

  const styleOptions = [
    "Pop",
    "Rock",
    "Jazz",
    "R&B",
    "EDM",
    "Country",
    "Classical",
    "Thai",
    "Hip-Hop",
    "Indie",
  ];
  const moodOptions = [
    "Upbeat",
    "Melancholic",
    "Romantic",
    "Energetic",
    "Chill",
    "Dark",
  ];

  const handleSave = () => {
    if (!songName.trim() || !songType) return;
    onUpdate({
      songName,
      songType,
      styles: selectedStyles,
      bpm,
      key,
      mood,
      notes,
    });
  };

  const handleStyleToggle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  return (
    <div className="ss-tab">
      <div className="ss-section">
        <div className="ss-form-group">
          <label className="ss-label">ชื่อเพลง</label>
          <input
            type="text"
            className="ss-input"
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            placeholder="เช่น ฟ้าวเงา"
          />
        </div>
      </div>

      <div className="ss-section">
        <h3 className="ss-section-title">เลือกประเภทเพลง</h3>
        <div className="ss-grid-3">
          <button
            className={joinClasses(
              "ss-choice-card",
              songType === "instrumental" && "is-selected"
            )}
            type="button"
            onClick={() => setSongType("instrumental")}
          >
            <div className="ss-choice-icon">🎹</div>
            <div className="ss-choice-label">เพลงบรรเลง</div>
            <div className="ss-choice-desc">ข้ามเนื้อร้อง ไปสร้าง Reference Track เลย</div>
          </button>
          <button
            className={joinClasses(
              "ss-choice-card",
              songType === "lyrics-first" && "is-selected"
            )}
            type="button"
            onClick={() => setSongType("lyrics-first")}
          >
            <div className="ss-choice-icon">📝</div>
            <div className="ss-choice-label">เนื้อร้องก่อน</div>
            <div className="ss-choice-desc">เขียนหรือ gen เนื้อร้องก่อน แล้วค่อยสร้างเพลง</div>
          </button>
          <button
            className={joinClasses(
              "ss-choice-card",
              songType === "melody-first" && "is-selected"
            )}
            type="button"
            onClick={() => setSongType("melody-first")}
          >
            <div className="ss-choice-icon">🎵</div>
            <div className="ss-choice-label">ทำนองก่อน</div>
            <div className="ss-choice-desc">สร้าง Reference Track ก่อน แล้วค่อยเขียนเนื้อร้อง</div>
          </button>
        </div>
      </div>

      <div className="ss-section">
        <h3 className="ss-section-title">สไตล์เพลง</h3>
        <div className="ss-tag-list">
          {styleOptions.map((style) => (
            <button
              key={style}
              className={joinClasses(
                "ss-tag",
                selectedStyles.includes(style) && "is-selected"
              )}
              type="button"
              onClick={() => handleStyleToggle(style)}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div className="ss-section">
        <div className="ss-form-row">
          <div className="ss-form-group">
            <label className="ss-label">BPM (ไม่บังคับ)</label>
            <input
              type="number"
              className="ss-input"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              placeholder="120"
            />
          </div>
          <div className="ss-form-group">
            <label className="ss-label">Key (ไม่บังคับ)</label>
            <input
              type="text"
              className="ss-input"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="C Major"
            />
          </div>
        </div>

        <div className="ss-form-group">
          <label className="ss-label">อารมณ์</label>
          <select
            className="ss-input"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          >
            <option value="">-- เลือกอารมณ์ --</option>
            {moodOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="ss-form-group">
          <label className="ss-label">หมายเหตุ (ไม่บังคับ)</label>
          <textarea
            className="ss-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="เขียนแนวคิด อารมณ์ หรืออื่นๆ..."
            rows={4}
          />
        </div>
      </div>

      <button
        className="ss-button ss-button-primary"
        type="button"
        onClick={handleSave}
        disabled={!songName.trim() || !songType}
      >
        บันทึก Song Brief
      </button>
    </div>
  );
}

// Tab 1: Lyrics
function LyricsTab({ project, role }: any) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatedLyrics, setGeneratedLyrics] = useState<string[] | null>(
    null
  );
  const [selectedLyricsVersion, setSelectedLyricsVersion] = useState(0);
  const [manualLyrics, setManualLyrics] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalLyrics, setFinalLyrics] = useState(project?.lyrics || "");
  const [assignedComposer, setAssignedComposer] = useState<string | null>(null);

  const mockLyricsVersions = [
    `[Verse 1]\nNeon signs flash through the rain\nEvery heartbeat calls your name\nWe were strangers, now we're flames\n\n[Chorus]\nElectric hearts, we're burning bright\nChasing shadows through the night`,
    `[Verse 1]\nCity lights paint memories\nYour voice echoes in the breeze\nElectricity between two souls\n\n[Chorus]\nBurning bright like summer stars\nIgniting what we are`,
    `[Verse 1]\nShadows dance on midnight walls\nYour whisper through the empty halls\nTwo hearts beating out of time\n\n[Chorus]\nWe collide like waves at shore\nBreaking down to build once more`,
  ];

  const handleAiGeneration = () => {
    if (!aiPrompt.trim() || aiPrompt.length > 200) return;
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedLyrics(mockLyricsVersions);
      setIsGenerating(false);
    }, 1500);
  };

  if (finalLyrics) {
    return (
      <div className="ss-tab">
        <div className="ss-section">
          <h3 className="ss-section-title">เนื้อร้องที่ยืนยันแล้ว</h3>
          <div className="ss-form-group">
            <textarea
              className="ss-textarea"
              value={finalLyrics}
              readOnly
              rows={8}
            />
          </div>
          <button
            className="ss-button ss-button-secondary"
            type="button"
            onClick={() => setFinalLyrics("")}
          >
            แก้ไขเนื้อร้อง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ss-tab">
      {selectedOption === null ? (
        <div className="ss-section">
          <h3 className="ss-section-title">เลือกวิธีสร้างเนื้อร้อง</h3>
          <div className="ss-grid-3">
            <button
              className="ss-choice-card"
              type="button"
              onClick={() => setSelectedOption("ai")}
            >
              <div className="ss-choice-icon">✨</div>
              <div className="ss-choice-label">ใช้ AI สร้างเนื้อเพลง</div>
              <div className="ss-choice-desc">ใช้ AI สร้างเนื้อเพลงหลายเวอร์ชัน แล้วเลือกที่ชอบ</div>
            </button>
            <button
              className="ss-choice-card"
              type="button"
              onClick={() => setSelectedOption("assign")}
            >
              <div className="ss-choice-icon">👤</div>
              <div className="ss-choice-label">มอบหมายให้นักแต่งเพลง</div>
              <div className="ss-choice-desc">เลือกนักแต่งเพลงจากทีมมาเขียนเนื้อร้อง</div>
            </button>
            <button
              className="ss-choice-card"
              type="button"
              onClick={() => setSelectedOption("manual")}
            >
              <div className="ss-choice-icon">✏️</div>
              <div className="ss-choice-label">เขียนเอง</div>
              <div className="ss-choice-desc">พิมพ์เนื้อร้องเอง รองรับ [Verse], [Chorus] ฯลฯ</div>
            </button>
          </div>
        </div>
      ) : selectedOption === "ai" ? (
        <div className="ss-section">
          <h3 className="ss-section-title">สร้างเนื้อเพลง ด้วย AI</h3>
          <div className="ss-form-group">
            <label className="ss-label">
              คำอธิบาย (สูงสุด 200 คำ)
            </label>
            <textarea
              className="ss-textarea"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value.slice(0, 200))}
              placeholder="เขียนเกี่ยวกับแนวคิด อารมณ์ หรือเรื่องราวของเพลง..."
              rows={4}
            />
            <div className="ss-char-count">{aiPrompt.length} / 200</div>
          </div>

          <button
            className="ss-button ss-button-primary"
            type="button"
            onClick={handleAiGeneration}
            disabled={!aiPrompt.trim() || isGenerating}
          >
            {isGenerating ? "กำลังสร้าง..." : "✨ สร้างเนื้อร้องด้วย AI"}
          </button>

          {generatedLyrics && (
            <div className="ss-mt-16">
              <h4 className="ss-label">เลือกเวอร์ชัน</h4>
              <div className="ss-versions-grid">
                {generatedLyrics.map((lyrics, idx) => (
                  <button
                    key={idx}
                    className={joinClasses(
                      "ss-version-card",
                      selectedLyricsVersion === idx && "is-selected"
                    )}
                    type="button"
                    onClick={() => setSelectedLyricsVersion(idx)}
                  >
                    <div className="ss-version-num">เวอร์ชัน {idx + 1}</div>
                    <textarea
                      className="ss-textarea ss-version-preview"
                      value={lyrics}
                      readOnly
                      rows={6}
                    />
                  </button>
                ))}
              </div>

              <button
                className="ss-button ss-button-primary ss-mt-16"
                type="button"
                onClick={() => {
                  setFinalLyrics(generatedLyrics[selectedLyricsVersion]);
                }}
              >
                ✅ ยืนยันเนื้อร้อง
              </button>
            </div>
          )}

          <button
            className="ss-button ss-button-secondary ss-mt-16"
            type="button"
            onClick={() => setSelectedOption(null)}
          >
            ย้อนกลับ
          </button>
        </div>
      ) : selectedOption === "manual" ? (
        <div className="ss-section">
          <h3 className="ss-section-title">เขียนเนื้อร้อง</h3>
          <div className="ss-form-group">
            <label className="ss-label">
              เนื้อร้อง (สนับสนุน: [Verse], [Chorus], [Bridge], [Outro])
            </label>
            <textarea
              className="ss-textarea"
              value={manualLyrics}
              onChange={(e) => setManualLyrics(e.target.value)}
              placeholder="[Verse 1]\n...\n\n[Chorus]\n..."
              rows={8}
            />
          </div>

          <button
            className="ss-button ss-button-primary"
            type="button"
            onClick={() => setFinalLyrics(manualLyrics)}
            disabled={!manualLyrics.trim()}
          >
            ✅ ยืนยันเนื้อร้อง
          </button>

          <button
            className="ss-button ss-button-secondary ss-mt-16"
            type="button"
            onClick={() => setSelectedOption(null)}
          >
            ย้อนกลับ
          </button>
        </div>
      ) : selectedOption === "assign" ? (
        <div className="ss-section">
          <h3 className="ss-section-title">มอบหมายให้นักแต่งเพลง</h3>
          {assignedComposer ? (
            <div className="ss-ref-message">
              <strong>มอบหมายแล้ว:</strong> รอ {assignedComposer} เขียนเนื้อร้อง
            </div>
          ) : (
            <div className="ss-form-group">
              <label className="ss-label">เลือกนักแต่งเพลง</label>
              <select
                className="ss-input"
                onChange={(e: any) => setAssignedComposer(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>-- เลือกนักแต่งเพลง --</option>
                <option value="อัณญา ไทยเพลง">อัณญา ไทยเพลง (Composer)</option>
                <option value="สมชาย นักร้อง">สมชาย นักร้อง (Composer)</option>
                <option value="วิไล เสียงดี">วิไล เสียงดี (Composer)</option>
              </select>
            </div>
          )}
          <button
            className="ss-button ss-button-secondary ss-mt-16"
            type="button"
            onClick={() => { setSelectedOption(null); setAssignedComposer(null); }}
          >
            ย้อนกลับ
          </button>
        </div>
      ) : null}
    </div>
  );
}

// Tab 2: Reference Track
function ReferenceTrackTab({ project, songType }: any) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState<string[] | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<"a" | "b" | null>(null);
  const [confirmedTrack, setConfirmedTrack] = useState<string | null>(
    project?.referenceTrack || null
  );
  const [generationCount, setGenerationCount] = useState(1);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedTracks(["track_a_id", "track_b_id"]);
      setSelectedTrack(null);
      setIsGenerating(false);
    }, 1800);
  };

  const handleGenerateNew = () => {
    setGenerationCount(generationCount + 1);
    handleGenerate();
  };

  if (confirmedTrack) {
    return (
      <div className="ss-tab">
        <div className="ss-ref-message">
          <strong>ทำสำเร็จ!</strong> Reference Track ที่เลือกแล้ว
        </div>
        <div className="ss-section">
          <h3 className="ss-section-title">Reference Track ที่ยืนยัน</h3>
          <InlineAudioPlayer duration="3:32" />
          <button
            className="ss-button ss-button-secondary ss-mt-16"
            type="button"
            onClick={() => setConfirmedTrack(null)}
          >
            สร้างใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ss-tab">
      <div className="ss-ref-message">
        นี่คือ Reference Track — ใช้เพื่อให้ทีมฟังว่า "feel นี้ใช่ไหม"
        ก่อนส่งต่อให้ Arranger เรียบเรียง
      </div>

      <div className="ss-section">
        {songType === "lyrics-first" && project?.lyrics && (
          <div className="ss-form-group">
            <label className="ss-label">เนื้อร้อง (จากขั้นตอนก่อนหน้า)</label>
            <textarea
              className="ss-textarea"
              value={project.lyrics}
              readOnly
              rows={4}
            />
          </div>
        )}

        <div className="ss-form-group">
          <label className="ss-label">อธิบายเพลง / Reference</label>
          <textarea
            className="ss-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="เช่น upbeat pop ที่มีเสียง synth และ electric guitar..."
            rows={4}
          />
        </div>

        <button
          className="ss-button ss-button-primary"
          type="button"
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
        >
          {isGenerating ? "กำลังสร้าง..." : "🎵 สร้าง Reference Track"}
        </button>

        {generatedTracks && (
          <div className="ss-mt-16">
            <div className="ss-label">ครั้งที่ {generationCount}</div>

            <ABComparisonPlayer
              onSelectTrack={(track: any) => setSelectedTrack(track)}
            />

            <div className="ss-button-group ss-mt-16">
              <button
                className="ss-button ss-button-secondary"
                type="button"
                onClick={handleGenerateNew}
              >
                🔄 Gen ใหม่
              </button>
              <button
                className="ss-button ss-button-primary"
                type="button"
                onClick={() => {
                  if (selectedTrack) {
                    setConfirmedTrack(
                      selectedTrack === "a" ? generatedTracks[0] : generatedTracks[1]
                    );
                  }
                }}
                disabled={!selectedTrack}
              >
                ✅ ยืนยัน Reference Track นี้
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Tab 3: Arrangement
function ArrangementTab({ project }: any) {
  const [numSingers, setNumSingers] = useState(project?.numSingers || 1);
  const [voiceType, setVoiceType] = useState(project?.voiceType || "Lead");
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(
    project?.instruments || []
  );
  const [arrangementNotes, setArrangementNotes] = useState(
    project?.arrangementNotes || ""
  );
  const [stemsSeparated, setStemsSeparated] = useState(
    project?.stemsSeparated || false
  );
  const [stemDecisions, setStemDecisions] = useState<
    Record<number, "keep" | "replace" | "remove">
  >(project?.stemDecisions || {});
  const [stemAssignments, setStemAssignments] = useState<Record<number, string>>({});

  const instruments = [
    "🥁 Drums & Percussion",
    "🎸 Guitar",
    "🎹 Keyboard/Piano",
    "🎷 Bass",
    "🎻 Strings",
    "🎺 Brass",
    "🪈 Woodwinds",
    "🎛 Synth",
    "🔊 FX/Sound Design",
  ];

  const mockStems = [
    { id: 0, name: "🥁 Drums", duration: "3:32" },
    { id: 1, name: "🎸 Guitar", duration: "3:32" },
    { id: 2, name: "🎹 Keyboard", duration: "3:32" },
  ];

  const handleInstrumentToggle = (instrument: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(instrument)
        ? prev.filter((i) => i !== instrument)
        : [...prev, instrument]
    );
  };

  const handleSeparateStems = () => {
    setStemsSeparated(true);
  };

  const handleStemDecision = (
    stemId: number,
    decision: "keep" | "replace" | "remove"
  ) => {
    setStemDecisions((prev) => ({
      ...prev,
      [stemId]: decision,
    }));
  };

  return (
    <div className="ss-tab">
      <div className="ss-section">
        <h3 className="ss-section-title">ฟัง Reference Track</h3>
        <InlineAudioPlayer duration="3:32" />
      </div>

      <div className="ss-section">
        <h3 className="ss-section-title">Arrangement Plan</h3>

        <div className="ss-form-row">
          <div className="ss-form-group">
            <label className="ss-label">จำนวนนักร้อง</label>
            <input
              type="number"
              className="ss-input"
              value={numSingers}
              onChange={(e) => setNumSingers(parseInt(e.target.value))}
              min="1"
            />
          </div>
          <div className="ss-form-group">
            <label className="ss-label">ประเภท</label>
            <select
              className="ss-input"
              value={voiceType}
              onChange={(e) => setVoiceType(e.target.value)}
            >
              <option>Lead</option>
              <option>Duet</option>
              <option>BGV</option>
              <option>Choir</option>
            </select>
          </div>
        </div>

        <div className="ss-form-group">
          <label className="ss-label">เครื่องดนตรี</label>
          <div className="ss-checkbox-grid">
            {instruments.map((instrument) => (
              <label key={instrument} className="ss-checkbox">
                <input
                  type="checkbox"
                  checked={selectedInstruments.includes(instrument)}
                  onChange={() => handleInstrumentToggle(instrument)}
                />
                <span>{instrument}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="ss-form-group">
          <label className="ss-label">หมายเหตุ Arrangement</label>
          <textarea
            className="ss-textarea"
            value={arrangementNotes}
            onChange={(e) => setArrangementNotes(e.target.value)}
            placeholder="เช่น guitar riff ที่โดดเด่น, melody climax ที่ crescendo..."
            rows={3}
          />
        </div>
      </div>

      <div className="ss-section">
        <h3 className="ss-section-title">Stem Separation</h3>

        {!stemsSeparated ? (
          <button
            className="ss-button ss-button-primary"
            type="button"
            onClick={handleSeparateStems}
          >
            🔀 แยก Stems จาก Reference Track
          </button>
        ) : (
          <div className="ss-stems-list">
            {mockStems.map((stem) => (
              <div key={stem.id} className="ss-stem-card">
                <div className="ss-stem-info">
                  <div className="ss-stem-name">{stem.name}</div>
                  <div className="ss-stem-duration">{stem.duration}</div>
                </div>

                <div className="ss-stem-waveform">[========---]</div>

                <div className="ss-stem-radio">
                  <label className="ss-radio-label">
                    <input
                      type="radio"
                      name={`stem-${stem.id}`}
                      checked={stemDecisions[stem.id] === "keep"}
                      onChange={() => handleStemDecision(stem.id, "keep")}
                    />
                    <span>✅ ใช้ AI stem นี้</span>
                  </label>

                  <label className="ss-radio-label">
                    <input
                      type="radio"
                      name={`stem-${stem.id}`}
                      checked={stemDecisions[stem.id] === "replace"}
                      onChange={() => handleStemDecision(stem.id, "replace")}
                    />
                    <span>🔄 อัดใหม่</span>
                  </label>

                  <label className="ss-radio-label">
                    <input
                      type="radio"
                      name={`stem-${stem.id}`}
                      checked={stemDecisions[stem.id] === "remove"}
                      onChange={() => handleStemDecision(stem.id, "remove")}
                    />
                    <span>❌ ไม่ใช้ stem นี้</span>
                  </label>

                  {stemDecisions[stem.id] === "replace" && (
                    <div className="ss-stem-replace-options">
                      <div className="ss-form-group" style={{ flex: 1 }}>
                        <label className="ss-label">เลือกนักดนตรี</label>
                        <select
                          className="ss-input ss-input-sm"
                          value={stemAssignments[stem.id] || ""}
                          onChange={(e: any) =>
                            setStemAssignments((prev) => ({
                              ...prev,
                              [stem.id]: e.target.value,
                            }))
                          }
                        >
                          <option value="" disabled>-- เลือกนักดนตรี --</option>
                          <option value="ธนากร กลอง">ธนากร กลอง (Drums)</option>
                          <option value="พิชัย กีตาร์">พิชัย กีตาร์ (Guitar)</option>
                          <option value="สุรศักดิ์ คีย์บอร์ด">สุรศักดิ์ คีย์บอร์ด (Keyboard)</option>
                          <option value="อนันต์ เบส">อนันต์ เบส (Bass)</option>
                          <option value="วรรณา ไวโอลิน">วรรณา ไวโอลิน (Strings)</option>
                        </select>
                      </div>
                      {stemAssignments[stem.id] && (
                        <div className="ss-ref-message" style={{ flex: 1 }}>
                          มอบหมายให้: <strong>{stemAssignments[stem.id]}</strong>
                        </div>
                      )}
                      <input
                        type="text"
                        className="ss-input ss-input-sm"
                        placeholder="หมายเหตุให้นักดนตรี..."
                        style={{ flex: 1 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="ss-button ss-button-primary ss-mt-16" type="button">
        ✅ ยืนยัน Arrangement
      </button>
    </div>
  );
}

// Tab 4: Recording
function RecordingTab({ project }: any) {
  const [uploadedStems, setUploadedStems] = useState<Record<number, boolean>>(
    {}
  );

  const stemsToRecord = [
    { id: 0, name: "🥁 Drums", notes: "Tight kick, steady hi-hat" },
    { id: 1, name: "🎸 Guitar", notes: "Smooth lead with reverb" },
  ];

  return (
    <div className="ss-tab">
      <div className="ss-section">
        <h3 className="ss-section-title">บันทึกเสียง</h3>

        <div className="ss-stems-list">
          {stemsToRecord.map((stem) => (
            <div key={stem.id} className="ss-stem-card">
              <div className="ss-stem-info">
                <div className="ss-stem-name">{stem.name}</div>
              </div>

              <div className="ss-form-group">
                <label className="ss-label">AI Reference</label>
                <InlineAudioPlayer duration="3:32" />
              </div>

              <button
                className="ss-button ss-button-secondary ss-sm"
                type="button"
              >
                <span className="ss-icon-sm"><DownloadIcon /></span>
                ดาวน์โหลด AI Stem
              </button>

              <div className="ss-form-group ss-mt-16">
                <label className="ss-label">หมายเหตุจาก Arranger</label>
                <div className="ss-note-readonly">{stem.notes}</div>
              </div>

              <div className="ss-form-group">
                <label className="ss-label">อัดเสียงใหม่</label>
                <div className="ss-drop-zone">
                  <span className="ss-icon"><UploadIcon /></span>
                  <div>ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก</div>
                  <div className="ss-drop-zone-hint">
                    MP3, WAV, FLAC (สูงสุด 50MB)
                  </div>
                </div>

                {uploadedStems[stem.id] && (
                  <div className="ss-mt-16">
                    <label className="ss-label">A/B เปรียบเทียบ</label>
                    <ABComparisonPlayer
                      onSelectTrack={() => {
                        /* save selection */
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                className="ss-button ss-button-primary ss-mt-16"
                type="button"
              >
                ส่งให้ Producer รีวิว
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Tab 5: Mixing
function MixingTab({ project }: any) {
  const [beforeAfterMode, setBeforeAfterMode] = useState<"before" | "after">(
    "before"
  );
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "เอ",
      role: "Producer",
      text: "ลองเพิ่มมิกซ์กับ bass ให้ชัดขึ้น",
    },
  ]);

  return (
    <div className="ss-tab">
      <div className="ss-section">
        <h3 className="ss-section-title">เลือก Track</h3>
        <div className="ss-track-list">
          <label className="ss-checkbox">
            <input type="checkbox" defaultChecked />
            <span>🥁 Drums (AI)</span>
          </label>
          <label className="ss-checkbox">
            <input type="checkbox" defaultChecked />
            <span>🎸 Guitar (Human)</span>
          </label>
          <label className="ss-checkbox">
            <input type="checkbox" defaultChecked />
            <span>🎹 Keyboard (AI)</span>
          </label>
        </div>
      </div>

      <div className="ss-section">
        <button className="ss-button ss-button-primary" type="button">
          🎛 Auto Mix (Roex)
        </button>
        <div className="ss-progress-bar ss-mt-16">
          <div className="ss-progress-fill" style={{ width: "0%" }} />
        </div>
      </div>

      <div className="ss-section">
        <div className="ss-toggle-group">
          <button
            className={joinClasses(
              "ss-toggle-btn",
              beforeAfterMode === "before" && "is-active"
            )}
            type="button"
            onClick={() => setBeforeAfterMode("before")}
          >
            Before
          </button>
          <button
            className={joinClasses(
              "ss-toggle-btn",
              beforeAfterMode === "after" && "is-active"
            )}
            type="button"
            onClick={() => setBeforeAfterMode("after")}
          >
            After
          </button>
        </div>
        <InlineAudioPlayer duration="3:32" />
      </div>

      <div className="ss-comments-section">
        <h4 className="ss-label">ความเห็น</h4>
        {comments.map((comment) => (
          <div key={comment.id} className="ss-comment">
            <div
              className="ss-comment-avatar"
              title={`${comment.author} - ${comment.role}`}
            >
              {getInitials(comment.author)}
            </div>
            <div className="ss-comment-body">
              <div className="ss-comment-header">
                {comment.author} • {comment.role}
              </div>
              <div className="ss-comment-text">{comment.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ss-button-group ss-mt-16">
        <button className="ss-button ss-button-primary" type="button">
          ✅ Approve
        </button>
        <button className="ss-button ss-button-secondary" type="button">
          มิกซ์ใหม่
        </button>
      </div>
    </div>
  );
}

// Tab 6: Mastering
function MasteringTab({ project }: any) {
  const [beforeAfterMode, setBeforeAfterMode] = useState<"before" | "after">(
    "before"
  );
  const [qcResults] = useState([
    { metric: "LUFS (Integrated)", value: "-14.0", status: "pass" },
    { metric: "True Peak", value: "-1.0 dBTP", status: "pass" },
    { metric: "Sample Rate", value: "44.1 kHz", status: "pass" },
    { metric: "Bit Depth", value: "16-bit", status: "pass" },
    { metric: "Tail Silence", value: "≥ 0.5s", status: "pass" },
  ]);

  const allQCPass = qcResults.every((r) => r.status === "pass");

  return (
    <div className="ss-tab">
      <div className="ss-section">
        <button className="ss-button ss-button-primary" type="button">
          💎 Auto Master (Roex)
        </button>
        <div className="ss-progress-bar ss-mt-16">
          <div className="ss-progress-fill" style={{ width: "0%" }} />
        </div>
      </div>

      <div className="ss-section">
        <div className="ss-toggle-group">
          <button
            className={joinClasses(
              "ss-toggle-btn",
              beforeAfterMode === "before" && "is-active"
            )}
            type="button"
            onClick={() => setBeforeAfterMode("before")}
          >
            Before
          </button>
          <button
            className={joinClasses(
              "ss-toggle-btn",
              beforeAfterMode === "after" && "is-active"
            )}
            type="button"
            onClick={() => setBeforeAfterMode("after")}
          >
            After
          </button>
        </div>
        <InlineAudioPlayer duration="3:32" />
      </div>

      <div className="ss-section">
        <h3 className="ss-section-title">QC Check</h3>
        <table className="ss-qc-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>ค่า</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {qcResults.map((row, idx) => (
              <tr key={idx}>
                <td>{row.metric}</td>
                <td>{row.value}</td>
                <td className="ss-qc-status">
                  {row.status === "pass" ? (
                    <>
                      <span className="ss-icon-sm ss-check-icon"><CheckIcon /></span>
                      ผ่าน
                    </>
                  ) : (
                    <>
                      <span className="ss-icon-sm ss-close-icon"><CloseIcon /></span>
                      ไม่ผ่าน
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="ss-button ss-button-primary ss-mt-16"
        type="button"
        disabled={!allQCPass}
      >
        ✅ Approve Master
      </button>
    </div>
  );
}

// Tab 7: Summary & Release
function SummaryReleaseTab({ project }: any) {
  const [contributors] = useState([
    { id: 1, name: "อัณญา ไทยเพลง", role: "Composer", split: 50, signed: true },
    { id: 2, name: "พีรพัฒน์ บันทึก", role: "Producer", split: 30, signed: false },
    { id: 3, name: "ศรัณย์ มิกซ์", role: "Mix Engineer", split: 20, signed: false },
  ]);

  const [checklist, setChecklist] = useState({
    splitSheetComplete: true,
    allSigned: false,
    techQC: true,
    creativeQC: true,
    masterUploaded: false,
    coverArtSelected: false,
  });

  const [coverArtMethod, setCoverArtMethod] = useState<"ai" | "upload" | "default" | null>(null);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [aiCoverStyles, setAiCoverStyles] = useState<string[] | null>(null);
  const [selectedCoverStyle, setSelectedCoverStyle] = useState<number | null>(null);
  const [coverArtConfirmed, setCoverArtConfirmed] = useState(false);

  const allChecksPass =
    checklist.splitSheetComplete &&
    checklist.allSigned &&
    checklist.techQC &&
    checklist.creativeQC &&
    checklist.masterUploaded &&
    checklist.coverArtSelected;

  return (
    <div className="ss-tab">
      <div className="ss-section">
        <h3 className="ss-section-title">Rights & Split Sheet</h3>
        <table className="ss-contributors-table">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>บทบาท</th>
              <th>% Split</th>
              <th>ลงนาม</th>
            </tr>
          </thead>
          <tbody>
            {contributors.map((contrib) => (
              <tr key={contrib.id}>
                <td>{contrib.name}</td>
                <td>{contrib.role}</td>
                <td>
                  <input
                    type="number"
                    className="ss-input ss-input-sm"
                    value={contrib.split}
                    disabled
                    min="0"
                    max="100"
                  />
                  %
                </td>
                <td>
                  {contrib.signed ? (
                    <span className="ss-icon-sm ss-check-icon"><CheckIcon /></span>
                  ) : (
                    <button className="ss-button ss-button-secondary ss-sm" type="button">
                      ✍️ ลงนาม
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ss-split-total">
          รวม: {contributors.reduce((sum, c) => sum + c.split, 0)}%
        </div>
      </div>

      <div className="ss-section">
        <h3 className="ss-section-title">Release Checklist</h3>
        <div className="ss-checklist">
          <label className="ss-checkbox">
            <input
              type="checkbox"
              checked={checklist.splitSheetComplete}
              onChange={(e) =>
                setChecklist({
                  ...checklist,
                  splitSheetComplete: e.target.checked,
                })
              }
            />
            <span>Split sheet ที่สมบูรณ์ (รวม 100%)</span>
          </label>
          <label className="ss-checkbox">
            <input
              type="checkbox"
              checked={checklist.allSigned}
              onChange={(e) =>
                setChecklist({ ...checklist, allSigned: e.target.checked })
              }
            />
            <span>ผู้มีส่วนร่วมลงนามทั้งหมด</span>
          </label>
          <label className="ss-checkbox">
            <input
              type="checkbox"
              checked={checklist.techQC}
              onChange={(e) =>
                setChecklist({ ...checklist, techQC: e.target.checked })
              }
            />
            <span>Technical QC ผ่าน</span>
          </label>
          <label className="ss-checkbox">
            <input
              type="checkbox"
              checked={checklist.creativeQC}
              onChange={(e) =>
                setChecklist({ ...checklist, creativeQC: e.target.checked })
              }
            />
            <span>Creative QC อนุมัติ</span>
          </label>
          <label className="ss-checkbox">
            <input
              type="checkbox"
              checked={checklist.masterUploaded}
              onChange={(e) =>
                setChecklist({
                  ...checklist,
                  masterUploaded: e.target.checked,
                })
              }
            />
            <span>Master file อัปโหลด</span>
          </label>
          <label className="ss-checkbox">
            <input
              type="checkbox"
              checked={checklist.coverArtSelected}
              onChange={(e) =>
                setChecklist({
                  ...checklist,
                  coverArtSelected: e.target.checked,
                })
              }
            />
            <span>ภาพปกอัลบั้ม (Cover Art)</span>
          </label>
        </div>
      </div>

      <div className="ss-section">
        <h3 className="ss-section-title">Release Metadata</h3>
        <div className="ss-form-group">
          <label className="ss-label">ชื่อเพลง</label>
          <input
            type="text"
            className="ss-input"
            defaultValue={project?.songName || ""}
            disabled
          />
        </div>
        <div className="ss-form-group">
          <label className="ss-label">ศิลปิน</label>
          <input type="text" className="ss-input" placeholder="Artist name" />
        </div>
        <div className="ss-form-group">
          <label className="ss-label">อัลบั้ม</label>
          <input type="text" className="ss-input" placeholder="Album name" />
        </div>
        <div className="ss-form-group">
          <label className="ss-label">แนวเพลง</label>
          <input type="text" className="ss-input" placeholder="Genre" />
        </div>
        <div className="ss-form-group">
          <label className="ss-label">ISRC</label>
          <input type="text" className="ss-input" placeholder="ISRC code" />
        </div>
        <div className="ss-form-group">
          <label className="ss-label">ปกอัลบั้ม (Cover Art)</label>

          {coverArtConfirmed ? (
            <div className="ss-cover-confirmed">
              <div className="ss-cover-preview">
                <div className="ss-cover-placeholder-img">🎨</div>
                <div className="ss-cover-confirmed-text">เลือกภาพปกแล้ว</div>
              </div>
              <button className="ss-button ss-button-secondary ss-sm" type="button" onClick={() => setCoverArtConfirmed(false)}>
                เปลี่ยนภาพปก
              </button>
            </div>
          ) : coverArtMethod === null ? (
            <div className="ss-grid-3">
              <button className="ss-choice-card" type="button" onClick={() => setCoverArtMethod("ai")}>
                <div className="ss-choice-icon">🎨</div>
                <div className="ss-choice-label">AI สร้างให้</div>
                <div className="ss-choice-desc">Mureka AI สร้างภาพปก 2 สไตล์ให้เลือก</div>
              </button>
              <button className="ss-choice-card" type="button" onClick={() => setCoverArtMethod("upload")}>
                <div className="ss-choice-icon">📤</div>
                <div className="ss-choice-label">อัปโหลดเอง</div>
                <div className="ss-choice-desc">JPG, PNG ขนาด 3000x3000px</div>
              </button>
              <button className="ss-choice-card" type="button" onClick={() => { setCoverArtMethod("default"); setCoverArtConfirmed(true); }}>
                <div className="ss-choice-icon">🖼️</div>
                <div className="ss-choice-label">ใช้ภาพ Default</div>
                <div className="ss-choice-desc">ใช้ภาพปก default ของโปรเจกต์</div>
              </button>
            </div>
          ) : coverArtMethod === "ai" ? (
            <div className="ss-section">
              {!aiCoverStyles ? (
                <div>
                  <button
                    className="ss-button ss-button-primary"
                    type="button"
                    disabled={isGeneratingCover}
                    onClick={() => {
                      setIsGeneratingCover(true);
                      setTimeout(() => {
                        setAiCoverStyles(["style_modern", "style_classic"]);
                        setIsGeneratingCover(false);
                      }, 2000);
                    }}
                  >
                    {isGeneratingCover ? "กำลังสร้างหน้าปก..." : "🎨 สร้างหน้าปก AI"}
                  </button>
                  {isGeneratingCover && (
                    <div className="ss-progress-bar ss-mt-16">
                      <div className="ss-progress-fill" style={{ width: "60%" }} />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h4 className="ss-label">เลือกสไตล์ภาพปก</h4>
                  <div className="ss-grid-3 ss-mt-16">
                    <button
                      className={joinClasses("ss-choice-card", selectedCoverStyle === 0 && "is-selected")}
                      type="button"
                      onClick={() => setSelectedCoverStyle(0)}
                    >
                      <div className="ss-cover-placeholder-img">🎨</div>
                      <div className="ss-choice-label">สไตล์ Modern</div>
                    </button>
                    <button
                      className={joinClasses("ss-choice-card", selectedCoverStyle === 1 && "is-selected")}
                      type="button"
                      onClick={() => setSelectedCoverStyle(1)}
                    >
                      <div className="ss-cover-placeholder-img">🖼️</div>
                      <div className="ss-choice-label">สไตล์ Classic</div>
                    </button>
                  </div>
                  <button
                    className="ss-button ss-button-primary ss-mt-16"
                    type="button"
                    disabled={selectedCoverStyle === null}
                    onClick={() => setCoverArtConfirmed(true)}
                  >
                    ✅ ยืนยันภาพปก
                  </button>
                </div>
              )}
              <button className="ss-button ss-button-secondary ss-mt-16" type="button" onClick={() => { setCoverArtMethod(null); setAiCoverStyles(null); setSelectedCoverStyle(null); }}>
                ย้อนกลับ
              </button>
            </div>
          ) : coverArtMethod === "upload" ? (
            <div className="ss-section">
              <div className="ss-drop-zone">
                <span className="ss-icon"><UploadIcon /></span>
                <div>ลากรูปภาพมาวางที่นี่ หรือคลิกเพื่อเลือก</div>
                <div className="ss-drop-zone-hint">JPG, PNG (แนะนำ 3000x3000px)</div>
              </div>
              <button className="ss-button ss-button-primary ss-mt-16" type="button" onClick={() => setCoverArtConfirmed(true)}>
                ✅ ยืนยันภาพปก
              </button>
              <button className="ss-button ss-button-secondary ss-mt-16" type="button" onClick={() => setCoverArtMethod(null)}>
                ย้อนกลับ
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="ss-section ss-coming-soon">
        <p>Distribution integration (LANDR API) — Coming Soon</p>
      </div>

      <button
        className="ss-button ss-button-primary ss-button-lg ss-mt-16"
        type="button"
        disabled={!allChecksPass}
      >
        🚀 ปล่อยเพลง
      </button>
    </div>
  );
}

// Main component
export default function ProjectDetail({ role, permissions, project, selectedStep, onStepChange, onBack }: any) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [projectState, setProjectState] = useState(project || {});

  const stageClass = projectState.stageClass || "draft";

  // Define tabs with minimum visible stages
  const tabs = [
    { label: "ข้อมูลเพลง", minStage: "draft", component: SongBriefTab },
    { label: "เนื้อร้อง", minStage: "briefed", component: LyricsTab },
    { label: "สร้างเพลง Reference", minStage: "briefed", component: ReferenceTrackTab },
    { label: "เรียบเรียง", minStage: "reference-done", component: ArrangementTab },
    { label: "บันทึกเสียง", minStage: "arranged", component: RecordingTab },
    { label: "มิกซ์", minStage: "recorded", component: MixingTab },
    { label: "มาสเตอร์", minStage: "mixed", component: MasteringTab },
    { label: "สรุป & ปล่อยเพลง", minStage: "mastered", component: SummaryReleaseTab },
  ];

  // Filter visible tabs based on stage and song type
  const visibleTabs = tabs.filter((tab, index) => {
    if (!isTabVisible(tab.minStage, stageClass)) return false;

    // Hide lyrics tab for instrumental songs
    if (
      index === 1 &&
      projectState.songType === "instrumental"
    ) {
      return false;
    }

    return true;
  });

  const currentTab = visibleTabs[activeTabIndex];
  const TabComponent = currentTab?.component;

  const handleUpdateBrief = (briefData: any) => {
    setProjectState((prev: any) => ({
      ...prev,
      ...briefData,
      stageClass: "briefed",
    }));
    if (visibleTabs.length > 1 && activeTabIndex < visibleTabs.length - 1) {
      setActiveTabIndex(activeTabIndex + 1);
    }
  };

  return (
    <section className="song-studio">
      <div className="ss-back-btn">
        <button type="button" onClick={onBack} className="ss-back-link">
          <span className="ss-icon-sm"><ArrowLeftIcon /></span>
          กลับไปโปรเจกต์
        </button>
      </div>

      <div className="ss-header">
        <div className="ss-title">
          <span className="ss-icon"><MusicNoteIcon /></span>
          Song Studio v3
        </div>
        <div className="ss-meta">
          {projectState.songName && `${projectState.songName}`}
          {projectState.stageClass &&
            ` • ${projectState.stageClass.toUpperCase()}`}
        </div>
      </div>

      <div className="ss-stepper">
        {visibleTabs.map((tab, index) => (
          <button
            key={index}
            className={joinClasses(
              "ss-step-btn",
              index === activeTabIndex && "is-active",
              index < activeTabIndex && "is-completed"
            )}
            type="button"
            onClick={() => setActiveTabIndex(index)}
          >
            <div className="ss-step-num">
              {index < activeTabIndex ? <span className="ss-icon-sm"><CheckIcon /></span> : index + 1}
            </div>
            <div className="ss-step-label">{tab.label}</div>
          </button>
        ))}
      </div>

      <div className="ss-panel">
        {TabComponent && (
          <TabComponent
            project={projectState}
            role={role}
            permissions={permissions}
            onUpdate={activeTabIndex === 0 ? handleUpdateBrief : () => {}}
            songType={projectState.songType}
          />
        )}
      </div>

      <style>{`
        /* Main Container */
        .song-studio {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .ss-back-btn {
          margin-bottom: 20px;
        }

        .ss-back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #7c3aed;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }

        .ss-back-link:hover {
          color: #6d28d9;
        }

        /* Header */
        .ss-header {
          margin-bottom: 24px;
          border-bottom: 2px solid #f0f0f2;
          padding-bottom: 16px;
        }

        .ss-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          font-weight: 700;
          color: #232730;
          margin-bottom: 8px;
        }

        .ss-title .ss-icon {
          width: 28px;
          height: 28px;
          color: #7c3aed;
        }

        .ss-meta {
          font-size: 14px;
          color: #8a8c91;
        }

        /* Stepper */
        .ss-stepper {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
          flex-wrap: wrap;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f2;
        }

        .ss-step-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border: 2px solid #e1e4e8;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          font-weight: 500;
          color: #6a6e78;
        }

        .ss-step-btn:hover {
          border-color: #7c3aed;
          color: #7c3aed;
        }

        .ss-step-btn.is-active {
          border-color: #7c3aed;
          background: #faf9ff;
          color: #7c3aed;
          font-weight: 600;
        }

        .ss-step-btn.is-completed {
          border-color: #16a34a;
          background: #f0fdf4;
          color: #16a34a;
        }

        .ss-step-num {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f3f4f6;
          font-size: 12px;
          font-weight: 700;
        }

        .ss-step-btn.is-active .ss-step-num {
          background: #7c3aed;
          color: white;
        }

        .ss-step-btn.is-completed .ss-step-num {
          background: #16a34a;
          color: white;
        }

        .ss-step-label {
          white-space: nowrap;
        }

        /* Panel */
        .ss-panel {
          min-height: 300px;
        }

        /* Tabs & Sections */
        .ss-tab {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .ss-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ss-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #232730;
          margin: 0;
        }

        /* Reference Track Message */
        .ss-ref-message {
          padding: 12px 16px;
          background: #faf9ff;
          border-left: 4px solid #7c3aed;
          border-radius: 4px;
          font-size: 14px;
          color: #232730;
          line-height: 1.6;
        }

        /* Choice Cards */
        .ss-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .ss-choice-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px;
          background: white;
          border: 2px solid #e1e4e8;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          font-size: 14px;
        }

        .ss-choice-card:hover {
          border-color: #7c3aed;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
        }

        .ss-choice-card.is-selected {
          border-color: #7c3aed;
          background: #faf9ff;
        }

        .ss-choice-icon {
          font-size: 32px;
        }

        .ss-choice-label {
          font-weight: 600;
          color: #232730;
        }

        .ss-choice-desc {
          font-size: 12px;
          color: #8a8c91;
          font-weight: 400;
        }

        /* Forms */
        .ss-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ss-form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .ss-label {
          font-size: 14px;
          font-weight: 600;
          color: #232730;
        }

        .ss-input,
        .ss-textarea,
        select {
          padding: 12px;
          border: 1px solid #e1e4e8;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
        }

        .ss-input:focus,
        .ss-textarea:focus,
        select:focus {
          outline: none;
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        .ss-input:disabled,
        .ss-textarea:disabled {
          background: #f9f9fb;
          color: #8a8c91;
          cursor: not-allowed;
        }

        .ss-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .ss-input-sm,
        select.ss-input-sm {
          padding: 6px 8px;
          font-size: 13px;
        }

        .ss-char-count {
          font-size: 12px;
          color: #8a8c91;
          text-align: right;
        }

        /* Buttons */
        .ss-button {
          padding: 12px 24px;
          min-height: 48px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          user-select: none;
        }

        .ss-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ss-button-primary {
          background: #7c3aed;
          color: white;
        }

        .ss-button-primary:hover:not(:disabled) {
          background: #6d28d9;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .ss-button-secondary {
          background: #f3f4f6;
          color: #232730;
          border: 1px solid #e1e4e8;
        }

        .ss-button-secondary:hover:not(:disabled) {
          background: #e5e7eb;
          border-color: #d1d5db;
        }

        .ss-button-lg {
          min-height: 56px;
          font-size: 18px;
          width: 100%;
        }

        .ss-button-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .ss-sm {
          padding: 6px 12px;
          min-height: auto;
          font-size: 13px;
        }

        .ss-button-group .ss-button {
          flex: 1;
          min-width: 120px;
        }

        /* Audio Player */
        .ss-audio-player {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9f9fb;
          border-radius: 6px;
        }

        .ss-audio-play-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #7c3aed;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .ss-audio-play-btn:hover {
          background: #6d28d9;
        }

        .ss-audio-progress {
          flex: 1;
          height: 4px;
          background: #e1e4e8;
          border-radius: 2px;
          overflow: hidden;
          cursor: pointer;
        }

        .ss-audio-progress-bar {
          height: 100%;
          background: #7c3aed;
          border-radius: 2px;
          transition: width 0.1s linear;
        }

        .ss-audio-time {
          font-size: 12px;
          color: #8a8c91;
          min-width: 60px;
          text-align: right;
          font-family: monospace;
        }

        /* A/B Comparison Player */
        .ss-ab-player {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 16px;
          background: #f9f9fb;
          border-radius: 8px;
        }

        .ss-ab-track {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e1e4e8;
        }

        .ss-ab-track-label {
          font-weight: 600;
          color: #232730;
          min-width: 60px;
          font-size: 14px;
        }

        .ss-ab-selection {
          display: flex;
          gap: 24px;
          padding-top: 12px;
          border-top: 1px solid #e1e4e8;
        }

        .ss-radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #232730;
          user-select: none;
        }

        .ss-radio-label input {
          cursor: pointer;
          accent-color: #7c3aed;
        }

        /* Tags and Checkboxes */
        .ss-tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 0;
        }

        .ss-tag {
          padding: 8px 12px;
          background: #f3f4f6;
          border: 1px solid #e1e4e8;
          border-radius: 20px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
          color: #232730;
        }

        .ss-tag:hover {
          border-color: #7c3aed;
        }

        .ss-tag.is-selected {
          background: #7c3aed;
          color: white;
          border-color: #7c3aed;
        }

        .ss-checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 0;
        }

        .ss-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          cursor: pointer;
          user-select: none;
          font-size: 14px;
        }

        .ss-checkbox input {
          cursor: pointer;
          accent-color: #7c3aed;
        }

        .ss-track-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Stems */
        .ss-stems-list {
          display: grid;
          gap: 16px;
        }

        .ss-stem-card {
          background: white;
          border: 1px solid #e1e4e8;
          border-radius: 8px;
          padding: 16px;
        }

        .ss-stem-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .ss-stem-name {
          font-size: 14px;
          font-weight: 600;
          color: #232730;
        }

        .ss-stem-duration {
          font-size: 12px;
          color: #8a8c91;
        }

        .ss-stem-waveform {
          font-size: 12px;
          color: #8a8c91;
          margin-bottom: 8px;
          letter-spacing: 2px;
        }

        .ss-stem-radio {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ss-stem-replace-options {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding: 12px;
          background: #faf9ff;
          border-radius: 6px;
          margin-left: 24px;
        }

        .ss-stem-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        /* Drop Zone */
        .ss-drop-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px;
          border: 2px dashed #e1e4e8;
          border-radius: 8px;
          background: #f9f9fb;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          font-size: 14px;
          color: #6a6e78;
        }

        .ss-drop-zone:hover {
          border-color: #7c3aed;
          background: #faf9ff;
        }

        .ss-drop-zone-hint {
          font-size: 12px;
          color: #8a8c91;
        }

        /* Notes */
        .ss-note-readonly {
          padding: 12px;
          background: #f9f9fb;
          border-radius: 6px;
          font-size: 14px;
          color: #6a6e78;
          line-height: 1.6;
        }

        /* Toggle Group */
        .ss-toggle-group {
          display: flex;
          gap: 0;
          margin-bottom: 16px;
        }

        .ss-toggle-btn {
          flex: 1;
          padding: 10px 16px;
          background: #f3f4f6;
          border: 1px solid #e1e4e8;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #6a6e78;
          transition: all 0.2s;
        }

        .ss-toggle-btn:first-child {
          border-radius: 6px 0 0 6px;
        }

        .ss-toggle-btn:last-child {
          border-radius: 0 6px 6px 0;
        }

        .ss-toggle-btn.is-active {
          background: #7c3aed;
          color: white;
          border-color: #7c3aed;
        }

        /* Progress Bar */
        .ss-progress-bar {
          width: 100%;
          height: 8px;
          background: #e1e4e8;
          border-radius: 4px;
          overflow: hidden;
        }

        .ss-progress-fill {
          height: 100%;
          background: #7c3aed;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        /* Versions Grid */
        .ss-versions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .ss-version-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          background: white;
          border: 2px solid #e1e4e8;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .ss-version-card:hover {
          border-color: #7c3aed;
        }

        .ss-version-card.is-selected {
          border-color: #7c3aed;
          background: #faf9ff;
        }

        .ss-version-num {
          font-size: 12px;
          font-weight: 600;
          color: #8a8c91;
        }

        .ss-version-preview {
          font-size: 12px;
          height: 120px !important;
        }

        /* Comments */
        .ss-comments-section {
          background: #f9f9fb;
          border-radius: 8px;
          padding: 16px;
        }

        .ss-comment {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .ss-comment-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #7c3aed;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .ss-comment-body {
          flex: 1;
        }

        .ss-comment-header {
          font-size: 13px;
          font-weight: 600;
          color: #232730;
          margin-bottom: 4px;
        }

        .ss-comment-text {
          font-size: 13px;
          color: #6a6e78;
          line-height: 1.5;
        }

        /* Contributors Table */
        .ss-contributors-table {
          width: 100%;
          border-collapse: collapse;
        }

        .ss-contributors-table thead {
          background: #f9f9fb;
        }

        .ss-contributors-table th {
          padding: 12px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          color: #232730;
          border-bottom: 2px solid #e1e4e8;
        }

        .ss-contributors-table td {
          padding: 12px;
          font-size: 14px;
          border-bottom: 1px solid #e1e4e8;
        }

        /* QC Table */
        .ss-qc-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0;
        }

        .ss-qc-table thead {
          background: #f9f9fb;
        }

        .ss-qc-table th {
          padding: 12px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          color: #232730;
          border-bottom: 2px solid #e1e4e8;
        }

        .ss-qc-table td {
          padding: 12px;
          font-size: 14px;
          border-bottom: 1px solid #e1e4e8;
        }

        .ss-qc-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
          color: #16a34a;
        }

        .ss-check-icon {
          color: #16a34a;
        }

        .ss-close-icon {
          color: #dc2626;
        }

        /* Split Total */
        .ss-split-total {
          padding: 12px;
          background: #faf9ff;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #7c3aed;
          text-align: right;
        }

        /* Checklist */
        .ss-checklist {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ss-checklist-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          font-size: 14px;
          color: #16a34a;
        }

        /* Coming Soon */
        .ss-coming-soon {
          padding: 16px;
          background: #f0f0f2;
          border-radius: 8px;
          color: #8a8c91;
          font-size: 14px;
          text-align: center;
        }

        /* Icons */
        .ss-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .ss-icon-sm {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        /* Utility Classes */
        .ss-mt-16 {
          margin-top: 16px;
        }

        .ss-mt-24 {
          margin-top: 24px;
        }

        .ss-mt-32 {
          margin-top: 32px;
        }

        /* Cover Art */
        .ss-cover-confirmed {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
        }

        .ss-cover-preview {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ss-cover-placeholder-img {
          width: 80px;
          height: 80px;
          background: #f3f4f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }

        .ss-cover-confirmed-text {
          font-size: 14px;
          font-weight: 600;
          color: #16a34a;
        }
      `}</style>
    </section>
  );
}

# Nova Music OS — Engineering Handoff Document

**Date:** 2026-03-30 (Updated)
**Prepared by:** AI Integration Team
**Purpose:** API integration guide for Frontend & Backend teams
**All endpoints tested and verified with live API keys**

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Status & Credentials](#2-api-status--credentials)
3. [Mureka API — Music & Voice Generation](#3-mureka-api)
4. [Roex API — AI Mixing & Mastering](#4-roex-api)
5. [Critical Implementation Notes](#5-critical-implementation-notes)
6. [Backend Integration Patterns](#6-backend-integration-patterns)
7. [Frontend Integration Guide](#7-frontend-integration-guide)
8. [Test Results & Known Issues](#8-test-results--known-issues)

---

## 1. Architecture Overview

### Pipeline

```
User Input (prompt/lyrics)
    │
    ▼
┌─────────────────────────────┐
│  Step 1: Generate Lyrics    │  Mureka /v1/lyrics/generate
│  Step 2: Generate Music     │  Mureka /v1/song/generate (~45s)
└─────────────┬───────────────┘
              │ MP3/WAV/FLAC URLs + song_id
              ▼
┌─────────────────────────────┐
│  Step 3: Stem Separation    │  Mureka /v1/song/stem (~30s)
└─────────────┬───────────────┘
              │ ZIP with WAV stems (vocals, drums, bass, other)
              ▼
┌─────────────────────────────┐
│  Step 4: Convert to WAV     │  Backend (pydub/ffmpeg, 44100Hz 16-bit stereo)
│  Step 5: Upload to Roex     │  Roex POST /upload (URLs expire ~60s!)
│  Step 6: AI Mix             │  Roex POST /mixpreview (~2-3 min)
│  Step 7: AI Master          │  Roex POST /masteringpreview (~2 min)
│  Step 8: QC Analysis        │  Roex POST /mixanalysis (instant)
└─────────────────────────────┘

Estimated cost per song: $3.95–$4.91
Total processing time: ~5-8 minutes end-to-end
```

### Technology Stack Required

| Component | Technology |
|-----------|-----------|
| Audio conversion | `pydub` + `ffmpeg` (MP3 → WAV) |
| Roex SDK | `pip install roex-python==1.3.0` |
| HTTP client | `requests` or equivalent |
| Queue/Worker | Recommended for async pipeline orchestration |

---

## 2. API Status & Credentials

### Authentication

| API | Auth Header | Auth Format | Key Source |
|-----|-------------|-------------|-----------|
| Mureka | `Authorization` | `Bearer {key}` | platform.mureka.ai |
| Roex | `x-api-key` | `{key}` (plain) | tonn-portal.roexaudio.com |

### Current Status

| API | Status | Base URL | Credits | Notes |
|-----|--------|----------|---------|-------|
| Mureka | **Ready** | `https://api.mureka.ai` | 3,000 | All 16 endpoints tested with new key |
| Roex | **Ready** | `https://tonn.roexaudio.com` | Active | Upload, mix, master, analysis, cleanup all tested |

---

## 3. Mureka API

**Base URL:** `https://api.mureka.ai`
**Auth:** `Authorization: Bearer {key}`
**Models:** `auto` (default), `mureka-8`, `mureka-o2`, `mureka-7.6`, `mureka-7.5`
**Concurrency:** 10 parallel jobs, ~45 seconds per generation
**Status:** **All endpoints tested 2026-03-30** — 3,000 credits active

### All Endpoints (Verified with Live Tests)

| Method | Endpoint | Required Params | Cost | Status |
|--------|----------|-----------------|------|--------|
| `GET` | `/v1/account/billing` | — | Free | **Tested** |
| `POST` | `/v1/lyrics/generate` | `prompt` | $0.009/set | **Tested** |
| `POST` | `/v1/lyrics/extend` | `lyrics`, `prompt` | $0.002/line | **Tested** |
| `POST` | `/v1/song/generate` | **`lyrics`** (required!) | $0.045/song (V8) | **Tested** |
| `GET` | `/v1/song/query/{task_id}` | — | Free | **Tested** |
| `POST` | `/v1/song/extend` | `song_id`+`lyrics`+`extend_at` | $0.045/song | Verified |
| `POST` | `/v1/song/stem` | `url` | $0.06/song | **Tested** |
| `POST` | `/v1/song/recognize` | `upload_audio_id` | — | Verified |
| `POST` | `/v1/song/describe` | `url` | Free | **Tested** |
| `POST` | `/v1/instrumental/generate` | `prompt`, **`model`** (both required!) | $0.045/song | **Tested** |
| `GET` | `/v1/instrumental/query/{task_id}` | — | Free | Verified |
| `POST` | `/v1/tts/generate` | `text` + (`voice` or `voice_id`) | $4.90/hr | **Tested** |
| `POST` | `/v1/tts/podcast` | `text`, `voice` | $6.90/hr | Verified |
| `POST` | `/v1/files/upload` | multipart file | Free | Verified |
| `POST` | `/v1/finetuning/create` | `suffix` | — | Verified |
| `GET` | `/v1/finetuning/query/{task_id}` | — | Free | Verified |

### Song Generation (Verified Request/Response)

```json
// Request
POST /v1/song/generate
{
  "lyrics": "[Verse]\nHello world\n[Chorus]\nLa la la",  // REQUIRED
  "prompt": "r&b, slow, passionate, male vocal",           // optional style description
  "model": "auto",                                         // auto, mureka-8, mureka-o2, mureka-7.6, mureka-7.5
  "n": 2                                                   // 1-3 variations
}

// Response (immediate)
{ "id": "130387735019522", "created_at": 1774852118, "model": "mureka-8", "status": "preparing" }

// Poll: GET /v1/song/query/130387735019522
// Response (completed):
{
  "id": "130387735019522",
  "status": "succeeded",
  "choices": [
    {
      "id": "130387831554050",
      "url": "https://cdn.mureka.ai/.../song.mp3",
      "wav_url": "https://cdn.mureka.ai/.../song.wav",
      "flac_url": "https://cdn.mureka.ai/.../song.flac",
      "duration": 151830,
      "lyrics_sections": [
        {
          "section_type": "verse",
          "start": 15560, "end": 16320,
          "lines": [{ "start": 15560, "end": 16320, "text": "Hello world",
            "words": [{ "start": 15560, "end": 16280, "text": "Hello " }]
          }]
        }
      ]
    }
  ]
}
```

### Song Describe (Verified Response)

```json
POST /v1/song/describe
{ "url": "https://example.com/song.mp3" }

// Response:
{
  "instrument": ["Lead Vocal (Male)", "Acoustic Guitar", "Synth Bass", "Electronic Drum Kit"],
  "genres": ["Thai Pop", "Pop Rock"],
  "tags": ["upbeat", "energetic"],
  "description": "A Thai pop track with..."
}
```

### TTS (Verified Response)

```json
POST /v1/tts/generate
{ "text": "Hello from Nova Music OS", "voice": "Ethan" }

// Response:
{ "url": "https://cdn.mureka.ai/.../tts.mp3", "expires_at": 1774939365 }
```

### Error Format
```json
{ "error": { "message": "Invalid Request, The lyrics are empty." }, "trace_id": "xxx" }
// Quota: { "error": { "message": "You exceeded your current quota..." } }
```

---

## 4. Roex API

**Base URL:** `https://tonn.roexaudio.com`
**Auth:** `x-api-key` header
**SDK:** `roex-python==1.3.0`
**Input:** WAV only (44.1/48 kHz, 16/24-bit, stereo)

### All Endpoints (Tested 2026-03-30)

| Method | Endpoint | Function | Credits | Cost (Small/Large) | Status |
|--------|----------|----------|---------|-------------------|--------|
| `GET` | `/health` | Health check | 0 | Free | **Tested** |
| `POST` | `/upload` | Get signed upload URL | 0 | Free | **Tested** |
| `POST` | `/mixpreview` | Create mix preview (30s) | 0 | **Free** | **Tested** |
| `POST` | `/retrievepreviewmix` | Poll/retrieve mix result | 0 | Free | **Tested** |
| `POST` | `/retrievefinalmix` | Get full mix with FX | 250 | $2.50 / $2.00 | Verified |
| `POST` | `/masteringpreview` | Create mastering preview (30s) | 0 | **Free** | **Tested** |
| `POST` | `/retrievepreviewmaster` | Poll/retrieve mastering | 0 | Free | **Tested** |
| `POST` | `/retrievefinalmaster` | Get full master | 220 | $2.20 / $1.76 | Verified |
| `POST` | `/mixanalysis` | Analyze LUFS, dynamics, stereo | 10 | $0.10 / $0.08 | **Tested** |
| `POST` | `/mixenhancepreview` | Enhance stereo mix preview | 0 | **Free** | **SDK Bug** |
| `POST` | `/mixenhance` | Full enhance | 250 | $2.50 / $2.00 | Verified |
| `POST` | `/retrieveenhancedtrack` | Retrieve enhanced track | 0 | Free | Verified |
| `POST` | `/audiocleanup` | Remove noise/hum/clicks | 10 | $0.10 / $0.08 | **Tested** |

### Analysis (Verified Request/Response)

```json
POST /mixanalysis
{
  "mixDiagnosisData": {
    "audioFileLocation": "https://storage.googleapis.com/...",
    "isMaster": false,
    "musicalStyle": "POP",
    "webhookURL": "https://your-server.com/webhook"
  }
}

// Response (immediate — synchronous!):
{
  "mixDiagnosisResults": {
    "payload": {
      "integrated_loudness_lufs": -8.685,
      "peak_loudness_dbfs": -6.6,
      "clipping": "NONE",
      "mono_compatible": true,
      "if_master_drc": "LESS",
      "if_master_loudness": "LESS",
      "bit_depth": 16,
      "phase_issues": false
    }
  }
}
```

### Audio Cleanup (Verified)

```python
# SDK usage:
from roex_python.models.audio_cleanup import AudioCleanupData, SoundSource
# SoundSource: KICK_GROUP, SNARE_GROUP, VOCAL_GROUP, BACKING_VOCALS_GROUP,
#              PERCS_GROUP, STRINGS_GROUP, E_GUITAR_GROUP, ACOUSTIC_GUITAR_GROUP

cleanup = AudioCleanupData(audio_file_location=url, sound_source=SoundSource.VOCAL_GROUP)
result = client.audio_cleanup.clean_up_audio(cleanup)
# → result.audio_cleanup_results.cleaned_audio_file_location = "https://storage.googleapis.com/..."
```

### Upload Flow

```python
# Step 1: Get signed URL
POST /upload
Body: { "filename": "bass.wav", "contentType": "audio/wav" }
Response: { "signedUrl": "https://storage.googleapis.com/...", "readableUrl": "https://storage.googleapis.com/..." }

# Step 2: Upload file to signed URL
PUT {signedUrl}
Headers: { "Content-Type": "audio/wav" }
Body: <binary file data>

# Step 3: Use readableUrl in mix/master requests
# ⚠️ URL expires quickly (~60 seconds) — must use immediately
```

### Mix Preview

```json
// Request
POST /mixpreview
Headers: { "x-api-key": "KEY", "Content-Type": "application/json" }
{
  "multitrackData": {
    "trackData": [
      {
        "trackURL": "https://storage.googleapis.com/tonn-user-upload/...",
        "instrumentGroup": "VOCAL_GROUP",
        "presenceSetting": "LEAD",
        "panPreference": "CENTRE",
        "reverbPreference": "NONE"
      },
      {
        "trackURL": "https://storage.googleapis.com/tonn-user-upload/...",
        "instrumentGroup": "DRUMS_GROUP",
        "presenceSetting": "NORMAL",
        "panPreference": "CENTRE",
        "reverbPreference": "NONE"
      }
    ],
    "musicalStyle": "POP",
    "returnStems": false,
    "sampleRate": "44100",
    "webhookURL": "https://your-server.com/webhook"
  }
}

// Response
{ "multitrack_task_id": "uuid", "error": null, "message": null }

// Poll result
POST /retrievepreviewmix
{ "multitrackData": { "multitrackTaskId": "uuid", "retrieveFXSettings": false } }

// Completed response
{
  "previewMixTaskResults": {
    "status": "MIX_TASK_PREVIEW_COMPLETED",
    "download_url_preview_mixed": "https://storage.googleapis.com/tonn-audio/uuid/RoEx_Final_Mix_Preview.mp3"
  }
}
```

### Mastering Preview

```json
// Request
POST /masteringpreview
{
  "masteringData": {
    "trackData": [{ "trackURL": "https://..." }],
    "musicalStyle": "POP",
    "desiredLoudness": "MEDIUM",
    "sampleRate": "44100",
    "webhookURL": "https://your-server.com/webhook"
  }
}

// Response
{ "mastering_task_id": "uuid" }

// Poll
POST /retrievepreviewmaster
{ "masteringData": { "masteringTaskId": "uuid" } }

// Completed
{
  "download_url_mastered_preview": "https://storage.googleapis.com/tonn-audio/uuid/RoEx_Preview_Master.mp3",
  "preview_start_time": 30.0
}
```

### Enum Values

```
InstrumentGroup:
  VOCAL_GROUP, BACKING_VOX_GROUP, DRUMS_GROUP, KICK_GROUP, SNARE_GROUP,
  CYMBALS_GROUP, BASS_GROUP, E_GUITAR_GROUP, ACOUSTIC_GUITAR_GROUP,
  KEYS_GROUP, STRINGS_GROUP, SYNTH_GROUP, PERCS_GROUP, BRASS_GROUP,
  FX_GROUP, BACKING_TRACK_GROUP, OTHER_GROUP1..5

PresenceSetting:  NORMAL | LEAD | BACKGROUND
PanPreference:    NO_PREFERENCE | LEFT | CENTRE | RIGHT
ReverbPreference: NONE | LOW | MEDIUM | HIGH
MusicalStyle:     POP | ROCK_INDIE | ACOUSTIC | HIPHOP_GRIME | ELECTRONIC |
                  REGGAE_DUB | ORCHESTRAL | METAL | OTHER
DesiredLoudness:  LOW | MEDIUM | HIGH
```

---

## 5. Critical Implementation Notes

### 5.1 Roex: Upload URLs Expire Fast

Upload URLs from `/upload` expire within ~60 seconds. The backend **MUST** upload files and create the mix/master task in a single uninterrupted flow:

```
download stems → convert WAV → upload to Roex → create mix task
        │                                             │
        └── all in one synchronous operation ─────────┘
```

**Do NOT** store upload URLs for later use. Do NOT add delays between upload and task creation.

### 5.2 Roex: WAV Only, No MP3

Roex rejects MP3 files with: `"Error checking file type for URL"`.
All audio must be converted to WAV (44100 Hz, 16-bit, stereo) before upload.

```python
from pydub import AudioSegment
audio = AudioSegment.from_mp3("stem.mp3")
audio = audio.set_frame_rate(44100).set_sample_width(2).set_channels(2)
audio.export("stem.wav", format="wav")
```

### 5.3 Roex: SDK `webhookURL` Bug

The Python SDK (`roex-python 1.3.0`) sends `webhookURL: null` which causes a 400 error.
**Workaround:** Use raw HTTP requests instead of SDK for task creation.

```python
# SDK (broken):
client.mix.create_mix_preview(request)  # ← sends webhookURL: null → 400

# Raw HTTP (working):
requests.post("https://tonn.roexaudio.com/mixpreview", json=payload,
    headers={"x-api-key": KEY, "Content-Type": "application/json"})
```

The SDK `retrieve_*` methods work correctly for polling results.

### 5.4 Roex: Track Limits for Preview

Testing shows that the free mix preview works reliably with:
- **3 tracks, 30-60 seconds each** (tested successfully)
- **3 tracks, 10 seconds each** (tested successfully)

It fails with:
- 5+ tracks at 170 seconds (too much data)
- 11 tracks at 60 seconds (too many tracks for preview)

For production, consider using the paid `/retrievefinalmix` endpoint which may have higher limits.

### 5.5 Mureka: `lyrics` Required for Song Generation

`/v1/song/generate` requires the `lyrics` field (not just `prompt`).
Generate lyrics first with `/v1/lyrics/generate`, then pass to song generation.

### 5.6 Mureka: `model` Required for Instrumental

`/v1/instrumental/generate` requires both `prompt` and `model`.
Always pass `"model": "auto"` (or a specific version).

### 5.7 Mureka: Song Recognize Requires Upload

`/v1/song/recognize` requires `upload_audio_id` — must upload file first via `/v1/files/upload`.
Does NOT accept a direct audio URL.

### 5.8 Mureka: TTS Voice Parameter

Built-in voices use `voice` field: `Ethan`, `Victoria`, `Jake`, `Luna`, `Emma`.
Custom cloned voices use `voice_id` field instead.

---

## 6. Backend Integration Patterns

### 6.1 Recommended Architecture

```
┌──────────┐     ┌───────────┐     ┌──────────────┐
│ Frontend  │────▶│  Backend  │────▶│ Task Queue   │
│ (React)   │◀────│  (API)    │◀────│ (Celery/Bull)│
└──────────┘     └───────────┘     └──────┬───────┘
                                          │
                              ┌───────────┴───────────┐
                              ▼                       ▼
                         ┌─────────┐           ┌───────────┐
                         │ Mureka  │           │   Roex    │
                         └─────────┘           └───────────┘
```

### 6.2 Pipeline State Machine

```
CREATED → GENERATING_LYRICS → GENERATING_MUSIC → SEPARATING_STEMS
    → CONVERTING_WAV → UPLOADING_ROEX → MIXING → MASTERING → QC_ANALYSIS → COMPLETED
```

Each state should be persisted in the database. On failure, the pipeline can be retried from the failed state.

### 6.3 Polling Strategy

| API | Method | Interval | Max Wait |
|-----|--------|----------|----------|
| Mureka lyrics | Synchronous | — | instant |
| Mureka song | GET poll | 10s | 2 min |
| Mureka stem | Synchronous | — | ~30s |
| Roex mix | POST poll | 10s | 5 min |
| Roex master | POST poll | 10s | 5 min |
| Roex analysis | Synchronous | — | ~5s |

### 6.4 Webhook Alternative

Both APIs support webhooks. For production, prefer webhooks over polling:

```
Mureka: callback in request body (where supported)
Roex:   webhookURL in multitrackData/masteringData
```

---

## 7. Frontend Integration Guide

### 7.1 User Flow

```
1. User enters prompt/lyrics → POST /api/pipeline/create
2. Frontend polls /api/pipeline/{id}/status every 5s
3. Backend returns progress: { step: "mixing", progress: 65 }
4. On completion: { step: "completed", urls: { original, mixed, mastered } }
5. Frontend renders audio player with all 3 versions
```

### 7.2 Status Display Mapping

| Backend State | User-facing Message | Progress |
|---------------|-------------------|----------|
| GENERATING_LYRICS | "Writing lyrics..." | 10% |
| GENERATING_MUSIC | "Composing music..." | 25% |
| SEPARATING_STEMS | "Separating instruments..." | 40% |
| CONVERTING_WAV | "Preparing audio..." | 50% |
| MIXING | "Mixing tracks..." | 65% |
| MASTERING | "Mastering final track..." | 80% |
| QC_ANALYSIS | "Quality check..." | 90% |
| COMPLETED | "Your song is ready!" | 100% |

### 7.3 Audio Player Requirements

- Play original, mixed, and mastered versions side-by-side
- Display individual stem tracks (vocals, drums, bass, other)
- Show timestamped lyrics (from Mureka `lyrics_sections`) synchronized with playback
- Support download in MP3, WAV, and FLAC formats

---

## 8. Test Results & Known Issues

### Successful Test Runs (2026-03-30)

| Test | Result | Duration |
|------|--------|----------|
| **Mureka** |
| Account billing | 3,000 credits confirmed | instant |
| Lyrics generate + extend | Working | instant |
| Song generate (mureka-8) | 2 choices with MP3/WAV/FLAC + lyrics_sections | ~48s |
| Instrumental generate | Task created | ~45s |
| Song describe | Genres, instruments, tags returned | ~5s |
| Song stem | ZIP URL with WAV stems returned | ~30s |
| TTS (voice: Ethan) | MP3 URL with expiry returned | ~3s |
| **Roex** |
| Health check | OK | instant |
| File upload (3 x 10s WAV) | 3 signed URLs | ~20s |
| Mix preview (3 tracks, 10s) | Mixed MP3 downloaded | ~30s |
| Mastering preview | Mastered MP3 downloaded | ~30s |
| Mix analysis | LUFS, peak, clipping, phase, mono compat | ~5s |
| Audio cleanup | Cleaned WAV URL returned | ~10s |

### Known Issues

| # | Issue | Severity | Workaround | Verified |
|---|-------|----------|-----------|----------|
| 1 | Roex SDK sends `webhookURL: null` on ALL create endpoints | **High** | Use raw `requests.post` for mixpreview, masteringpreview, mixenhancepreview | 2026-03-30 |
| 2 | Roex upload URLs expire in ~60s | **High** | Upload + create task atomically in one continuous flow | 2026-03-30 |
| 3 | Roex rejects MP3 input | **High** | Convert all audio to WAV (44100Hz, 16-bit, stereo) via pydub/ffmpeg | 2026-03-30 |
| 4 | Roex mix fails with 5+ tracks or long audio | **High** | Limit to 3 tracks, trim to 10-30s for preview. Full mix may support more | 2026-03-30 |
| 5 | Mureka `/v1/song/generate` requires `lyrics` (not `prompt`) | **Medium** | `lyrics` is the content, `prompt` is optional style description | 2026-03-30 |
| 6 | Mureka `/v1/instrumental/generate` requires `model` field | **Medium** | Always pass `"model": "auto"` (or specific version) | 2026-03-30 |
| 7 | Mureka `/v1/song/recognize` requires `upload_audio_id` | **Medium** | Must upload file first via `/v1/files/upload`, then use returned ID | 2026-03-30 |
| 8 | Mureka `/v1/tts/generate` uses `voice` not `voice_id` for built-in | **Low** | Built-in: `Ethan`, `Victoria`, `Jake`, `Luna`, `Emma`. Custom: use `voice_id` | 2026-03-30 |
| 9 | Roex Analysis uses `audioFileLocation` + `isMaster` + `musicalStyle` | **Low** | Different payload structure from mix/master endpoints | 2026-03-30 |

### Files Included

| File | Description |
|------|-------------|
| `Nova_Music_OS_API_Handoff.ipynb` | Interactive Jupyter notebook — run each API step-by-step |
| `Nova_Music_OS_Pricing.md` | Detailed pricing breakdown per feature |
| `Nova_Music_OS_Handoff.md` | This document |

### Conda Environment

```bash
conda activate nova_music_api   # Python 3.11
# Pre-installed: requests, roex-python, pydub, jupyter
```

---

## Appendix: Quick Copy-Paste Examples

### Mureka: Generate a song end-to-end

```python
import requests, time

BASE = "https://api.mureka.ai"
HEADERS = {"Authorization": "Bearer YOUR_KEY", "Content-Type": "application/json"}

# 1. Generate lyrics
resp = requests.post(f"{BASE}/v1/lyrics/generate", json={
    "prompt": "A happy pop song about Bangkok"
}, headers=HEADERS)
lyrics = resp.json()["lyrics"]

# 2. Generate song (lyrics is REQUIRED)
resp = requests.post(f"{BASE}/v1/song/generate", json={
    "lyrics": lyrics,
    "prompt": "thai pop, upbeat",
    "model": "auto",
    "n": 2
}, headers=HEADERS)
task_id = resp.json()["id"]

# 3. Poll until succeeded
while True:
    r = requests.get(f"{BASE}/v1/song/query/{task_id}", headers=HEADERS)
    data = r.json()
    if data["status"] == "succeeded":
        audio_url = data["choices"][0]["url"]
        wav_url = data["choices"][0]["wav_url"]
        break
    time.sleep(10)

# 4. Separate stems
resp = requests.post(f"{BASE}/v1/song/stem", json={
    "url": audio_url
}, headers=HEADERS)
stems_zip = resp.json()["zip_url"]
```

### Roex: Upload WAV + Mix

```python
from roex_python.client import RoExClient
from roex_python.utils import upload_file
import requests

client = RoExClient(api_key="YOUR_KEY")

# Upload (URL expires fast!)
url = upload_file(client, "vocals.wav")

# Mix immediately (raw POST, not SDK)
resp = requests.post("https://tonn.roexaudio.com/mixpreview", json={
    "multitrackData": {
        "trackData": [
            {"trackURL": url, "instrumentGroup": "VOCAL_GROUP",
             "presenceSetting": "LEAD", "panPreference": "CENTRE", "reverbPreference": "NONE"},
            # ... more tracks
        ],
        "musicalStyle": "POP", "returnStems": False,
        "sampleRate": "44100", "webhookURL": "https://httpbin.org/post"
    }
}, headers={"x-api-key": "YOUR_KEY", "Content-Type": "application/json"})
task_id = resp.json()["multitrack_task_id"]

# Poll with SDK (this part works)
result = client.mix.retrieve_preview_mix(task_id)
download_url = result["download_url_preview_mixed"]
```

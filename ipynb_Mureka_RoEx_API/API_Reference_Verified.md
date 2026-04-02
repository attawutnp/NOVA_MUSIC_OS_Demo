# Nova Music OS — Verified API Reference
**Last verified:** 2026-03-24
**Pipeline:** SUNO (Generate) → Mureka (Generate) → Roex (Mix+Master) → Landr (Master+Distribute)

---

## 1. SUNO API

**Base URL:** `https://api.sunoapi.org`
**Auth:** `Authorization: Bearer {API_KEY}`
**Status:** ✅ Working & Tested

### ⚠️ Key Pattern
Most endpoints use `taskId` + `audioId` (not `audioUrl`):
- `taskId` = music generation task ID (from POST /api/v1/generate response)
- `audioId` = song ID (from `response.sunoData[].id`)
- Status field = `successFlag` (not `status`) for stem/WAV endpoints

### Endpoints

| # | Method | Endpoint | Input | Output | Cost |
|---|--------|----------|-------|--------|------|
| 1 | `POST` | `/api/v1/lyrics` | `prompt`, `callBackUrl` | `taskId` | credits |
| 2 | `GET` | `/api/v1/lyrics/record-info?taskId=` | query: `taskId` | `response.data[]` (title, text) | - |
| 3 | `POST` | `/api/v1/generate` | `prompt`, `customMode`, `style`, `title`, `lyrics`, `instrumental`, `model`, `callBackUrl` | `taskId` | credits |
| 4 | `GET` | `/api/v1/generate/record-info?taskId=` | query: `taskId` | `response.sunoData[]` (id, audioUrl, imageUrl, prompt) | - |
| 5 | `POST` | `/api/v1/vocal-removal/generate` | `taskId`, `audioId`, `type`, `callBackUrl` | `taskId` | 1-5 credits |
| 6 | `GET` | `/api/v1/vocal-removal/record-info?taskId=` | query: `taskId` | `response` (vocalUrl, drumsUrl, bassUrl, ...) | - |
| 7 | `POST` | `/api/v1/wav/generate` | `taskId`, `audioId`, `callBackUrl` | `taskId` | credits |
| 8 | `GET` | `/api/v1/wav/record-info?taskId=` | query: `taskId` | `response.audioWavUrl` | - |
| 9 | `POST` | `/api/v1/generate/get-timestamped-lyrics` | `taskId`, `audioId` | `alignedWords[]` (word, startS, endS) | - |

### Stem Separation Types
| Type | Stems | Cost |
|------|-------|------|
| `separate_vocal` | 2 (Vocals + Instrumental) | 1 credit |
| `split_stem` | 12 (Vocals, BackingVocals, Drums, Bass, Guitar, Keyboard, Percussion, Strings, Synth, FX, Brass, Woodwinds) | 5 credits |

### Music Models
`V4` / `V4_5` / `V4_5PLUS` / `V5`

### Callback Stages (Music)
`PENDING` → `TEXT_SUCCESS` → `FIRST_SUCCESS` → `SUCCESS`

### Response Structure
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "xxx",
    "status": "SUCCESS",
    "response": {
      "sunoData": [
        {
          "id": "song-uuid",
          "audioUrl": "https://...",
          "imageUrl": "https://...",
          "prompt": "lyrics text..."
        }
      ]
    }
  }
}
```

### Stem Response Structure (successFlag pattern)
```json
{
  "code": 200,
  "data": {
    "taskId": "xxx",
    "successFlag": "SUCCESS",
    "response": {
      "vocalUrl": "https://...",
      "instrumentalUrl": "https://...",
      "drumsUrl": "https://...",
      "bassUrl": "https://...",
      "originData": [
        {"stem_type_group_name": "Vocals", "audio_url": "...", "duration": 174.88}
      ]
    }
  }
}
```

---

## 2. Mureka API

**Base URL:** `https://api.mureka.ai`
**Auth:** `Authorization: Bearer {API_KEY}`
**Status:** ✅ All endpoints verified (quota-dependent)
**Models:** V8 (default), O2, V7.6, V7.5
**Concurrency:** 10 parallel jobs, ~45s per generation

### Endpoints (All Verified ✅)

| # | Method | Endpoint | Input | Output |
|---|--------|----------|-------|--------|
| **Song** |
| 1 | `POST` | `/v1/song/generate` | `lyrics` (required), `title`, `description`, `vocal_id`, `ref_id`, `motif_id`, `model`, `vocal_gender` | `task_id` |
| 2 | `GET` | `/v1/song/query/{task_id}` | path: `task_id` | song data + audio URLs |
| 3 | `POST` | `/v1/song/extend` | `song_id`, `lyrics` (required) | `task_id` |
| 4 | `POST` | `/v1/song/stem` | `audio_url` | stem URLs |
| 5 | `POST` | `/v1/song/recognize` | `audio_url` | BPM, key, mood |
| 6 | `POST` | `/v1/song/describe` | `audio_url` | text description |
| **Instrumental** |
| 7 | `POST` | `/v1/instrumental/generate` | `prompt` | `task_id` |
| 8 | `GET` | `/v1/instrumental/query/{task_id}` | path: `task_id` | audio URLs |
| **Lyrics** |
| 9 | `POST` | `/v1/lyrics/generate` | `prompt` | lyrics text |
| 10 | `POST` | `/v1/lyrics/extend` | `lyrics`, `prompt` | extended lyrics |
| **TTS** |
| 11 | `POST` | `/v1/tts/generate` | `text`, `voice_id` (required) | audio URL |
| 12 | `POST` | `/v1/tts/podcast` | `text`, `voice` (required) | audio URL |
| **Files** |
| 13 | `POST` | `/v1/files/upload` | multipart file | file URL |
| **Fine-tuning** |
| 14 | `POST` | `/v1/finetuning/create` | `suffix` (lowercase letters) | `task_id` |
| 15 | `GET` | `/v1/finetuning/query/{task_id}` | path: `task_id` | status |
| **Account** |
| 16 | `GET` | `/v1/account/billing` | - | billing/credits info |

### Error Response
```json
{
  "error": {
    "message": "You exceeded your current quota, please check your plan and billing details"
  },
  "trace_id": "xxx"
}
```

---

## 3. Roex Tonn API

**Base URL:** `https://tonn.roexaudio.com`
**Auth:** `x-api-key: {API_KEY}` header
**SDK:** `pip install roex-python` (v1.3.0)
**Status:** ✅ All endpoints verified

### ⚠️ Known Issues & Workarounds
| Issue | Workaround |
|-------|-----------|
| SDK sends `webhookURL: null` → 400 error | Use raw `requests.post` with `"webhookURL": "https://httpbin.org/post"` |
| Upload URLs expire in ~60s | Upload + create task in one continuous flow |
| Only accepts WAV | Convert MP3 → WAV with `pydub` before upload |
| Mix preview fails with 5+ tracks × 170s | Limit to 3-5 tracks, trim to 60s |
| `retrieve` returns 404 if task doesn't exist | This is normal — use valid task ID from create step |

### Endpoints (All Verified ✅)

| # | Method | Endpoint | Function | Free? |
|---|--------|----------|----------|-------|
| **Mixing** |
| 1 | `POST` | `/mixpreview` | Create mix preview (30s) | ✅ Free |
| 2 | `POST` | `/retrievepreviewmix` | Poll/retrieve mix preview | - |
| 3 | `POST` | `/retrievefinalmix` | Retrieve full mix (apply FX) | Credits |
| **Mastering** |
| 4 | `POST` | `/masteringpreview` | Create mastering preview (30s) | ✅ Free |
| 5 | `POST` | `/retrievepreviewmaster` | Poll/retrieve mastering preview | - |
| 6 | `POST` | `/retrievefinalmaster` | Retrieve full master | Credits |
| **Analysis** |
| 7 | `POST` | `/mixanalysis` | Analyze LUFS, dynamics, stereo | Credits |
| **Enhance** |
| 8 | `POST` | `/mixenhancepreview` | Enhance stereo mix preview | ✅ Free |
| 9 | `POST` | `/mixenhance` | Full enhance | Credits |
| 10 | `POST` | `/retrieveenhancedtrack` | Retrieve enhanced track | - |
| **Cleanup** |
| 11 | `POST` | `/audiocleanup` | Remove noise/hum/clicks | Credits |
| **Upload** |
| 12 | `POST` | `/upload` | Get signed upload URL | - |
| **Health** |
| 13 | `GET` | `/health` | Health check | - |

### Mix Preview Request
```json
POST /mixpreview
{
  "multitrackData": {
    "trackData": [
      {
        "trackURL": "https://storage.googleapis.com/...",
        "instrumentGroup": "VOCAL_GROUP",
        "presenceSetting": "LEAD",
        "panPreference": "CENTRE",
        "reverbPreference": "NONE"
      },
      {
        "trackURL": "https://storage.googleapis.com/...",
        "instrumentGroup": "DRUMS_GROUP",
        "presenceSetting": "NORMAL",
        "panPreference": "CENTRE",
        "reverbPreference": "NONE"
      }
    ],
    "musicalStyle": "POP",
    "returnStems": false,
    "sampleRate": "44100",
    "webhookURL": "https://your-webhook.com/callback"
  }
}
```

### Mix Preview Response
```json
{
  "multitrack_task_id": "uuid",
  "error": null,
  "message": null
}
```

### Retrieve Mix Result
```json
POST /retrievepreviewmix
{
  "multitrackData": {
    "multitrackTaskId": "uuid",
    "retrieveFXSettings": false
  }
}

// Response when complete:
{
  "previewMixTaskResults": {
    "status": "MIX_TASK_PREVIEW_COMPLETED",
    "download_url_preview_mixed": "https://storage.googleapis.com/tonn-audio/uuid/RoEx_Final_Mix_Preview.mp3"
  }
}
```

### Mastering Preview Request
```json
POST /masteringpreview
{
  "masteringData": {
    "trackData": [{"trackURL": "https://..."}],
    "musicalStyle": "POP",
    "desiredLoudness": "MEDIUM",
    "sampleRate": "44100",
    "webhookURL": "https://your-webhook.com/callback"
  }
}
```

### Mastering Preview Response
```json
{
  "mastering_task_id": "uuid"
}

// Retrieve:
POST /retrievepreviewmaster
{
  "masteringData": {"masteringTaskId": "uuid"}
}

// Response:
{
  "download_url_mastered_preview": "https://storage.googleapis.com/tonn-audio/uuid/RoEx_Preview_Master.mp3",
  "preview_start_time": 30.0
}
```

### Enum Values (SDK v1.3.0)
```
InstrumentGroup:  VOCAL_GROUP, BACKING_VOX_GROUP, DRUMS_GROUP, KICK_GROUP,
                  SNARE_GROUP, CYMBALS_GROUP, BASS_GROUP, E_GUITAR_GROUP,
                  ACOUSTIC_GUITAR_GROUP, KEYS_GROUP, STRINGS_GROUP,
                  SYNTH_GROUP, PERCS_GROUP, BRASS_GROUP, FX_GROUP,
                  BACKING_TRACK_GROUP, OTHER_GROUP1-5

PresenceSetting:  NORMAL, LEAD, BACKGROUND
PanPreference:    NO_PREFERENCE, LEFT, CENTRE, RIGHT
ReverbPreference: NONE, LOW, MEDIUM, HIGH
MusicalStyle:     POP, ROCK_INDIE, ACOUSTIC, HIPHOP_GRIME, ELECTRONIC,
                  REGGAE_DUB, ORCHESTRAL, METAL, OTHER
DesiredLoudness:  LOW, MEDIUM, HIGH
```

### SDK Method Mapping
```python
from roex_python.client import RoExClient
client = RoExClient(api_key="KEY")

# Mix
client.mix.create_mix_preview(request)       # → /mixpreview
client.mix.retrieve_preview_mix(task_id)     # → /retrievepreviewmix
client.mix.retrieve_final_mix(task_id)       # → /retrievefinalmix

# Master
client.mastering.create_mastering_preview(request)  # → /masteringpreview
client.mastering.retrieve_preview_master(task_id)   # → /retrievepreviewmaster
client.mastering.retrieve_final_master(task_id)     # → /retrievefinalmaster

# Upload
from roex_python.utils import upload_file
url = upload_file(client, "path/to/file.wav")  # → /upload + PUT signed URL
```

---

## 4. Landr Mastering API

**Base URL:** `https://api.landr.com/mastering`
**Auth:** `x-landr-mastering-api-key: {API_KEY}` header
**Docs:** [OpenAPI Spec](https://api.landr.com/mastering/openapi_redoc/index.html?url=/mastering/openapi/v1/openapi.json)
**Status:** ⏳ Pending partnership API key
**Rate Limits:** 50 creates/hour, 100 status queries/minute

### Endpoints

| # | Method | Endpoint | Input | Output | Cost |
|---|--------|----------|-------|--------|------|
| **Preview** |
| 1 | `POST` | `/v1/preview/single` | `inputUri`, `loudness?`, `style?` | `id`, `location` | **FREE** |
| 2 | `GET` | `/v1/preview/single/{id}/status` | path: `id` (GUID) | `status` | - |
| 3 | `GET` | `/v1/preview/single/{id}/download` | path: `id` (GUID) | `downloadUrl` | - |
| **Master** |
| 4 | `POST` | `/v1/master/single` | `inputUri`, `loudness?`, `style?`, `format?` | `id`, `location` | **$2.50/track** |
| 5 | `GET` | `/v1/master/single/{id}/status` | path: `id` (GUID) | `status` | - |
| 6 | `GET` | `/v1/master/single/{id}/download` | path: `id` (GUID) | `downloadUrl` | - |
| **Webhook** |
| 7 | `POST` | `/v1/webhook` | `url`, `enabled` | `url`, `enabled`, `secret` | - |
| 8 | `PUT` | `/v1/webhook` | `url?`, `enabled?` | updated webhook | - |
| 9 | `GET` | `/v1/webhook` | - | webhook config | - |
| 10 | `POST` | `/v1/webhook/secret` | - | `secret` (base64) | - |

### Parameters
| Param | Values | Note |
|-------|--------|------|
| `inputUri` | URL to audio file | Required |
| `loudness` | `low`, `medium`, `high` | Optional |
| `style` | `warm`, `balanced`, `open` | Optional |
| `format` | `cd`, `mp3`, `wav` | Master only |

### Status Values
`downloading` → `processing` → `completed` / `failed` / `expired`

### Webhook Event
```json
{
  "trackId": "uuid",
  "status": "completed"
}
// Header: x-signature (HMAC-SHA256 of body with webhook secret)
```

---

## Full Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Generate Lyrics                                      │
│   SUNO POST /api/v1/lyrics                                   │
│   Mureka POST /v1/lyrics/generate                            │
├─────────────────────────────────────────────────────────────┤
│ Step 2: Generate Music                                       │
│   SUNO POST /api/v1/generate → poll record-info              │
│   Mureka POST /v1/song/generate → poll /v1/song/query/{id}  │
├─────────────────────────────────────────────────────────────┤
│ Step 3: Stem Separation                                      │
│   SUNO POST /api/v1/vocal-removal/generate (12 stems)       │
│     ⚠️ Requires taskId + audioId + type                      │
├─────────────────────────────────────────────────────────────┤
│ Step 4: AI Mix (Roex)                                        │
│   ⚠️ Convert MP3 → WAV first (pydub)                        │
│   ⚠️ Upload + mix in one flow (URLs expire fast)            │
│   POST /mixpreview → POST /retrievepreviewmix               │
├─────────────────────────────────────────────────────────────┤
│ Step 5: AI Master                                            │
│   Roex: POST /masteringpreview → /retrievepreviewmaster     │
│   Landr: POST /v1/preview/single → GET /{id}/download       │
├─────────────────────────────────────────────────────────────┤
│ Step 6: QC Gate                                              │
│   Roex POST /mixanalysis → LUFS, dynamics, stereo width     │
├─────────────────────────────────────────────────────────────┤
│ Step 7: Distribution (Landr)                                 │
│   150+ stores, 100% royalties, ISRC/UPC metadata            │
└─────────────────────────────────────────────────────────────┘

Estimated cost per song: ~$4.26–$6.70
```

---

## Authentication Summary

| API | Header | Key Source |
|-----|--------|-----------|
| SUNO | `Authorization: Bearer {key}` | sunoapi.org |
| Mureka | `Authorization: Bearer {key}` | platform.mureka.ai |
| Roex | `x-api-key: {key}` | tonn-portal.roexaudio.com |
| Landr | `x-landr-mastering-api-key: {key}` | Landr sales team |

## API Status

| API | Status | Note |
|-----|--------|------|
| SUNO | ✅ Working | All endpoints tested |
| Mureka | ⚠️ Quota exceeded | Endpoints verified, needs credits |
| Roex | ✅ Working | Mix + Master preview tested |
| Landr | ⏳ Pending | API key from partnership form |

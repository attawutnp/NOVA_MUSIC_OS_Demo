# Nova Music OS — External API Reference Guide

**Pipeline: Option A Confirmed**
```
AI Lyrics/Music (SUNO+Mureka) → Stems → Roex (Auto-Mix) → Landr (Auto-Master) → Landr (Distribution)
```

---

## 1. SUNO API — Lyrics & Music Generation

**Base URL:** `https://api.sunoapi.org`
**Auth:** Bearer Token (API Key from sunoapi.org)
**Docs:** https://docs.sunoapi.org

### 1.1 Lyrics Generation

| Method | Endpoint | Function |
|--------|----------|----------|
| `POST` | `/api/v1/lyrics` | สร้างเนื้อเพลงจาก prompt (mood, theme, style) — return หลาย variations |
| `GET` | `/api/v1/lyrics/record-info?taskId=xxx` | เช็คสถานะ + ดึงผลเนื้อเพลงที่สร้างเสร็จ |

**Parameters (POST /api/v1/lyrics):**
- `prompt` (string, required) — คำอธิบายเนื้อเพลง, max 200 words
- `callBackUrl` (string, required) — URL สำหรับรับผลเมื่อเสร็จ

**Status:** PENDING → SUCCESS / GENERATE_LYRICS_FAILED / SENSITIVE_WORD_ERROR

### 1.2 Music Generation

| Method | Endpoint | Function |
|--------|----------|----------|
| `POST` | `/api/v1/generate` | สร้างเพลงจาก prompt หรือ custom lyrics — return 2 variations |
| `GET` | `/api/v1/generate/record-info?taskId=xxx` | เช็คสถานะ + ดึง audio URL |
| `POST` | `/api/v1/generate/extend` | ต่อเพลงจากจุดที่กำหนด |
| `POST` | `/api/v1/generate/upload-cover` | สร้างเพลงใหม่จาก reference audio ที่ upload |
| `POST` | `/api/v1/generate/upload-extend` | Upload audio แล้วต่อเพลงด้วย AI |

**Parameters (POST /api/v1/generate):**
- `prompt` (string) — คำอธิบายเพลง (ถ้า custom mode = false)
- `customMode` (boolean) — true = ใช้ lyrics/style/title เอง
- `style` (string) — แนวเพลง เช่น "Thai Pop Acoustic" (max 200–1000 chars ตาม model)
- `title` (string) — ชื่อเพลง
- `lyrics` (string) — เนื้อเพลงที่จะใช้ (custom mode)
- `instrumental` (boolean) — true = เพลงบรรเลง ไม่มีเสียงร้อง
- `model` (string) — V4 / V4_5 / V4_5PLUS / V5
- `callBackUrl` (string) — URL สำหรับรับผล

**Callback stages:** TEXT_SUCCESS → FIRST_SUCCESS → SUCCESS

### 1.3 Stem Separation

| Method | Endpoint | Function |
|--------|----------|----------|
| `POST` | `/api/v1/vocal-removal/generate` | แยก stems จากเพลงที่สร้าง |
| `GET` | `/api/v1/vocal-removal/record-info?taskId=xxx` | ดึง URL ของ stems ที่แยกเสร็จ |

**Separation Modes:**
| Mode | Stems | Cost |
|------|-------|------|
| `separate_vocal` | 2 stems (Vocals + Instrumental) | 1 credit |
| `split_stem` | 12 stems (Vocals, Backing Vocals, Drums, Bass, Guitar, Keyboard, Strings, Brass, Woodwinds, Percussion, Synth, FX) | 5 credits |

**Return fields (split_stem):** `vocalUrl`, `backingVocalsUrl`, `drumsUrl`, `bassUrl`, `guitarUrl`, `keyboardUrl`, `percussionUrl`, `stringsUrl`, `synthUrl`, `fxUrl`, `brassUrl`, `woodwindsUrl`

### 1.4 Utility Endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| `POST` | `/api/v1/wav/generate` | แปลงเป็น WAV format |
| `GET` | `/api/v1/wav/record-info?taskId=xxx` | เช็คสถานะ WAV conversion |
| `POST` | `/api/v1/generate/generate-persona` | สร้าง Persona (voice model) จากเพลง |
| `POST` | `/api/v1/video/generate` | สร้าง Music Video |
| `GET` | `/api/v1/video/record-info?taskId=xxx` | เช็คสถานะ video |
| `POST` | `/api/v1/suno/cover/generate` | สร้าง cover image |
| `GET` | `/api/v1/credits` | เช็ค credits คงเหลือ |
| `POST` | `/api/v1/generate/generate-midi` | แปลง separated stems เป็น MIDI |
| `GET` | `/api/v1/timestamped-lyrics?taskId=xxx` | ดึง lyrics พร้อม timestamp |

---

## 2. Mureka API — Music & Voice Generation

**Base URL:** `https://platform.mureka.ai/api`
**Auth:** Bearer Token
**Docs:** https://platform.mureka.ai/docs

### 2.1 Core Endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| `POST` | `/v1/song/generate` | สร้างเพลงจาก prompt/lyrics/reference |
| `GET` | `/v1/song/query/{task_id}` | เช็คสถานะ + ดึงผลเพลง |
| `POST` | `/v1/song/extend` | ต่อเพลง |
| `POST` | `/v1/song/stem` | แยก stems จากเพลง |
| `POST` | `/v1/song/recognize` | วิเคราะห์เพลง (BPM, Key, Mood) |
| `POST` | `/v1/song/describe` | สร้างคำอธิบายเพลงจาก audio |
| `POST` | `/v1/instrumental/generate` | สร้างเพลงบรรเลง |
| `GET` | `/v1/instrumental/query/{task_id}` | เช็คสถานะ instrumental |

### 2.2 Lyrics

| Method | Endpoint | Function |
|--------|----------|----------|
| `POST` | `/v1/lyrics/generate` | สร้างเนื้อเพลง |
| `POST` | `/v1/lyrics/extend` | ต่อเนื้อเพลง |

### 2.3 Voice & TTS

| Method | Endpoint | Function |
|--------|----------|----------|
| `POST` | `/v1/tts/generate` | Text-to-Speech (สร้างเสียงพูด) |
| `POST` | `/v1/tts/podcast` | สร้าง Podcast 2 เสียง |

### 2.4 File Management

| Method | Endpoint | Function |
|--------|----------|----------|
| `POST` | `/v1/files/upload` | Upload ไฟล์ (reference audio, voice sample) |
| `POST` | `/v1/uploads/create` | เริ่ม multipart upload |
| `POST` | `/v1/uploads/add` | เพิ่ม part ใน upload |
| `POST` | `/v1/uploads/complete` | จบ multipart upload |

### 2.5 Fine-tuning & Account

| Method | Endpoint | Function |
|--------|----------|----------|
| `POST` | `/v1/finetuning/create` | สร้าง fine-tuning task (custom model จาก 200 tracks) |
| `GET` | `/v1/finetuning/query/{task_id}` | เช็คสถานะ fine-tuning |
| `GET` | `/v1/account/billing` | เช็คยอด billing/credits |

### Mureka Unique Features
- **Voice Cloning:** 10 วินาทีก็สร้าง voice model ได้
- **Reference Track:** Upload เพลงตัวอย่าง → AI สร้างเพลงใหม่ที่สไตล์คล้ายกัน
- **Fine-tuning:** Upload 200 เพลง → สร้าง custom model "Signature Sound" ของค่าย
- **10+ ภาษา:** EN, TH, CN, JP, KR, ES, และอื่นๆ
- **Concurrent:** รองรับ 10 jobs พร้อมกัน, ~45 วินาที/เพลง

---

## 3. Roex Tonn API — AI Mixing

**Base URL:** `https://tonn.roexaudio.com`
**Auth:** API Key (จาก tonn-portal.roexaudio.com)
**Python SDK:** `pip install roex-python`
**Docs:** https://roex.stoplight.io/docs/tonn-api
**Examples:** https://github.com/roex-audio/TonnExamples

### 3.1 Core Methods (Python SDK)

| Method | Class | Function |
|--------|-------|----------|
| `client.mix.create_mix_preview()` | Mix | สร้าง mix preview (ฟรี 30 วินาที) |
| `client.mix.create_mix()` | Mix | สร้าง full mix (ใช้ credits) |
| `client.mastering.create_mastering_preview()` | Mastering | Preview mastering (ฟรี 30 วินาที) |
| `client.mastering.create_mastering()` | Mastering | Full mastering (ใช้ credits) |
| `client.analysis.create_analysis()` | Analysis | วิเคราะห์ mix/master readiness (LUFS, dynamics, stereo) |
| `client.enhance.create_enhance_preview()` | Enhance | Preview enhance stereo mix |
| `client.enhance.create_enhance()` | Enhance | Full enhance |
| `client.cleanup.create_cleanup()` | Cleanup | ลบ noise/hum/clicks |
| `upload_file(client, path)` | Utils | Upload local file → get URL |

### 3.2 Key Models (Python SDK)

```python
from roex_python.client import RoExClient
from roex_python.models import (
    TrackData,              # ข้อมูลต่อ track
    MultitrackMixRequest,   # Request สำหรับ mixing
    MasteringRequest,       # Request สำหรับ mastering
    InstrumentGroup,        # ประเภทเครื่องดนตรี
    PresenceSetting,        # ระดับ presence (LOW/NORMAL/HIGH)
    PanPreference,          # ตำแหน่ง panning (LEFT/CENTRE/RIGHT)
    ReverbPreference,       # ระดับ reverb (NONE/SMALL/MEDIUM/LARGE)
    MusicalStyle,           # แนวเพลง (POP/ROCK/JAZZ/ELECTRONIC/etc.)
)
```

### 3.3 InstrumentGroup Options
`VOCAL_GROUP`, `DRUM_GROUP`, `BASS_GROUP`, `GUITAR_GROUP`, `KEYBOARD_GROUP`, `STRINGS_GROUP`, `BRASS_GROUP`, `WOODWIND_GROUP`, `SYNTH_GROUP`, `FX_GROUP`, `OTHER_GROUP`

### 3.4 Processing Specs
| Feature | Spec |
|---------|------|
| Tracks | 2–32 multitrack |
| Input | WAV 44.1/48 kHz, 16/24-bit |
| Max duration | 8 min (mix), 10 min (master) |
| Output | WAV 44.1 kHz / 16-bit |
| Preview | ฟรี 30 วินาที, unlimited previews |
| Processing time | Mix ~2 min, Master ~2 min/track, Analysis ~30 sec |

### 3.5 Example: Multitrack Mix

```python
client = RoExClient(api_key="YOUR_KEY")

# Upload stems
bass_url = upload_file(client, "bass.wav")
drums_url = upload_file(client, "drums.wav")
guitar_url = upload_file(client, "guitar.wav")
vocals_url = upload_file(client, "vocals.wav")

# Define tracks
tracks = [
    TrackData(track_url=bass_url, instrument_group=InstrumentGroup.BASS_GROUP,
              presence_setting=PresenceSetting.NORMAL, pan_preference=PanPreference.CENTRE),
    TrackData(track_url=drums_url, instrument_group=InstrumentGroup.DRUM_GROUP,
              presence_setting=PresenceSetting.NORMAL, pan_preference=PanPreference.CENTRE),
    TrackData(track_url=guitar_url, instrument_group=InstrumentGroup.GUITAR_GROUP,
              presence_setting=PresenceSetting.NORMAL, pan_preference=PanPreference.SLIGHT_RIGHT),
    TrackData(track_url=vocals_url, instrument_group=InstrumentGroup.VOCAL_GROUP,
              presence_setting=PresenceSetting.HIGH, pan_preference=PanPreference.CENTRE),
]

# Create mix
request = MultitrackMixRequest(tracks=tracks, musical_style=MusicalStyle.POP)
preview = client.mix.create_mix_preview(request)  # Free preview
full_mix = client.mix.create_mix(request)          # Paid full mix
```

### 3.6 Pricing (Credits)
| Service | Small Plan | Large Plan |
|---------|-----------|-----------|
| Mastering (full) | 220 credits ($2.20) | 176 credits ($1.76) |
| Mix preview | Free | Free |
| Analysis | Varies | Varies |
| Signup bonus | 1,000 free credits | 1,000 free credits |

---

## 4. Landr API — AI Mastering + Distribution

**Mastering API:** https://www.landr.com/pro-audio-mastering-api
**RapidAPI:** https://rapidapi.com/landr-audio-inc1-landr-audio-inc-default/api/landr-mastering-v1
**Auth:** Partnership API access (contact Landr sales team)

### 4.1 Mastering Endpoints

| Method | Function |
|--------|----------|
| `POST /master` | Upload mixed WAV → เลือก style/loudness → สร้าง master |
| `GET /master/{id}` | ดึงสถานะ + download mastered file |
| `GET /master/{id}/preview` | Preview ก่อน commit (3 loudness levels) |

### 4.2 Mastering Parameters
| Parameter | Options |
|-----------|---------|
| **Loudness** | 3 levels (Low / Medium / High) |
| **Style** | Multiple mastering styles per genre |
| **Input** | WAV/FLAC/MP3, stereo, 44.1–48 kHz |
| **Output** | Mastered WAV ready for release |

### 4.3 Distribution (via Landr Platform)
| Feature | Detail |
|---------|--------|
| Stores | 150+ (Spotify, Apple Music, YouTube Music, Amazon, Tidal, etc.) |
| Royalties | Artists keep 100% |
| Metadata | ISRC, UPC/EAN, artwork, lyrics, genre, territory |
| Payment | Built-in royalty tracking + payment system |
| Integration | Same ecosystem as mastering API |

### 4.4 Pricing
| Plan | Price |
|------|-------|
| Per track | From $2.50/track |
| Volume | Discount available |
| Distribution | Included with Landr plan |

**Note:** Landr Mastering API เป็น partnership model — ต้องติดต่อ Landr sales team เพื่อขอ API access สำหรับ integration

---

## Pipeline Summary (Option A)

```
Step 1: AI Lyrics     → SUNO POST /api/v1/lyrics
                       → Mureka POST /v1/lyrics/generate

Step 2: AI Music Gen  → SUNO POST /api/v1/generate (full song)
                       → Mureka POST /v1/song/generate

Step 3: Stem Split    → SUNO POST /api/v1/vocal-removal/generate (split_stem = 12 stems)
                       → Mureka POST /v1/song/stem

Step 4: AI Mix        → Roex client.mix.create_mix(MultitrackMixRequest)
                         Input: stems from Step 3
                         Output: mixed WAV

Step 5: AI Master     → Landr POST /master
                         Input: mixed WAV from Step 4
                         Output: mastered WAV

Step 6: QC Gate       → Roex client.analysis.create_analysis()
                         Check: LUFS, True Peak, dynamics, stereo width

Step 7: Distribute    → Landr Distribution (150+ stores)
                         Input: mastered WAV + metadata (ISRC, artwork, lyrics)

Step 8: Revenue       → Landr royalty tracking → Smart Split Sheet auto-payment
```

**Total cost per song: ~$4.26–$6.70** (mix + master + distribute, all in-browser)

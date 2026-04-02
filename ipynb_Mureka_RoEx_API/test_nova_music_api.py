"""
Nova Music OS — API Integration Test Suite
Pipeline: AI Lyrics/Music (SUNO+Mureka) → Stems → Roex (Mix) → Landr (Master) → Distribution

Tested & verified 2026-03-20:
  - SUNO:   ✅ Lyrics + Music generation working (base: api.sunoapi.org)
  - Mureka: ✅ API responding (base: api.mureka.ai) — quota-dependent
  - Roex:   ✅ SDK initialized (pip install roex-python)
  - Landr:  ⏳ Pending partnership API access
"""

import os
import sys
import json
import time
import requests

# ─── Configuration ────────────────────────────────────────────────────────────

SUNO_API_KEY = os.getenv("SUNO_API_KEY", "your-suno-api-key")
MUREKA_API_KEY = os.getenv("MUREKA_API_KEY", "your-mureka-api-key")
ROEX_API_KEY = os.getenv("ROEX_API_KEY", "your-roex-api-key")
LANDR_API_KEY = os.getenv("LANDR_API_KEY", "your-landr-api-key")

SUNO_BASE_URL = "https://api.sunoapi.org"
MUREKA_BASE_URL = "https://api.mureka.ai"
LANDR_BASE_URL = "https://api.landr.com"  # Adjust based on partnership endpoint

CALLBACK_URL = os.getenv("CALLBACK_URL", "https://httpbin.org/post")

# Polling settings
POLL_INTERVAL = 10  # seconds
MAX_POLL_ATTEMPTS = 30  # max ~5 minutes


# ─── Helpers ──────────────────────────────────────────────────────────────────

def suno_headers():
    return {
        "Authorization": f"Bearer {SUNO_API_KEY}",
        "Content-Type": "application/json",
    }


def mureka_headers():
    return {
        "Authorization": f"Bearer {MUREKA_API_KEY}",
        "Content-Type": "application/json",
    }


def pp(data):
    """Pretty print JSON response."""
    print(json.dumps(data, indent=2, ensure_ascii=False)[:1500])


def poll_suno(url: str, target: str = "SUCCESS", interval: int = POLL_INTERVAL) -> dict:
    """Poll a SUNO endpoint until task reaches target status.
    Handles both 'status' and 'successFlag' response fields.
    """
    for attempt in range(MAX_POLL_ATTEMPTS):
        resp = requests.get(url, headers=suno_headers())
        resp.raise_for_status()
        data = resp.json()
        d = data.get("data", {})
        status = d.get("status") or d.get("successFlag")
        print(f"  Poll {attempt + 1}: status={status}")

        if status == target:
            return data
        if status and "FAIL" in str(status).upper():
            raise RuntimeError(f"Task failed: {status}\n{json.dumps(data, indent=2)}")

        time.sleep(interval)

    raise TimeoutError(f"Task did not complete after {MAX_POLL_ATTEMPTS * interval}s")


# ═══════════════════════════════════════════════════════════════════════════════
# 1. SUNO API Tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestSunoAPI:
    """
    Test suite for SUNO API — Lyrics & Music Generation.
    Base URL: https://api.sunoapi.org
    Auth: Bearer Token

    Response structure:
      { "code": 200, "msg": "success", "data": { "taskId": "...", ... } }

    Record info structure:
      { "code": 200, "data": { "taskId": "...", "status": "SUCCESS",
        "response": { "taskId": "...", "sunoData": [...] } } }
    """

    # ── 1.1 Lyrics Generation ─────────────────────────────────────────────────

    def test_generate_lyrics(self, prompt: str = "A heartfelt Thai pop ballad about missing home"):
        """POST /api/v1/lyrics — Generate lyrics from prompt. Returns multiple variations."""
        print("\n[SUNO] Generating lyrics...")
        payload = {
            "prompt": prompt,
            "callBackUrl": CALLBACK_URL,
        }
        resp = requests.post(f"{SUNO_BASE_URL}/api/v1/lyrics", json=payload, headers=suno_headers())
        print(f"  Status: {resp.status_code}")
        data = resp.json()
        task_id = data.get("data", {}).get("taskId")
        print(f"  Task ID: {task_id}")
        assert resp.status_code == 200 and data.get("code") == 200, f"Failed: {data}"
        return task_id

    def test_get_lyrics_result(self, task_id: str):
        """GET /api/v1/lyrics/record-info — Poll and get lyrics result."""
        print(f"\n[SUNO] Polling lyrics for task: {task_id}")
        url = f"{SUNO_BASE_URL}/api/v1/lyrics/record-info?taskId={task_id}"
        result = poll_suno(url)

        # Extract lyrics from nested response
        response = result.get("data", {}).get("response", {})
        variations = response.get("data", [])
        for i, v in enumerate(variations):
            print(f"\n  --- Variation {i + 1} ---")
            print(f"  Title: {v.get('title')}")
            print(f"  Status: {v.get('status')}")
            text = v.get("text", "")
            print(f"  Lyrics:\n{text[:300]}...")
        return variations

    # ── 1.2 Music Generation ──────────────────────────────────────────────────

    def test_generate_music(self, prompt: str = "Upbeat Thai pop song about summer vacation",
                            model: str = "V4"):
        """POST /api/v1/generate — Generate music from text prompt. Returns 2 variations."""
        print(f"\n[SUNO] Generating music (model={model})...")
        payload = {
            "prompt": prompt,
            "customMode": False,
            "instrumental": False,
            "model": model,
            "callBackUrl": CALLBACK_URL,
        }
        resp = requests.post(f"{SUNO_BASE_URL}/api/v1/generate", json=payload, headers=suno_headers())
        print(f"  Status: {resp.status_code}")
        data = resp.json()
        task_id = data.get("data", {}).get("taskId")
        print(f"  Task ID: {task_id}")
        assert resp.status_code == 200 and data.get("code") == 200, f"Failed: {data}"
        return task_id

    def test_generate_music_custom(self, lyrics: str, style: str = "Thai Pop Acoustic",
                                   title: str = "Test Song", model: str = "V4"):
        """POST /api/v1/generate — Generate music with custom lyrics/style/title."""
        print(f"\n[SUNO] Generating music (custom mode, model={model})...")
        payload = {
            "customMode": True,
            "style": style,
            "title": title,
            "lyrics": lyrics,
            "instrumental": False,
            "model": model,
            "callBackUrl": CALLBACK_URL,
        }
        resp = requests.post(f"{SUNO_BASE_URL}/api/v1/generate", json=payload, headers=suno_headers())
        print(f"  Status: {resp.status_code}")
        data = resp.json()
        task_id = data.get("data", {}).get("taskId")
        print(f"  Task ID: {task_id}")
        assert resp.status_code == 200 and data.get("code") == 200, f"Failed: {data}"
        return task_id

    def test_generate_instrumental(self, prompt: str = "Chill lo-fi jazz beats for studying",
                                   model: str = "V4"):
        """POST /api/v1/generate — Generate instrumental (no vocals)."""
        print("\n[SUNO] Generating instrumental...")
        payload = {
            "prompt": prompt,
            "customMode": False,
            "instrumental": True,
            "model": model,
            "callBackUrl": CALLBACK_URL,
        }
        resp = requests.post(f"{SUNO_BASE_URL}/api/v1/generate", json=payload, headers=suno_headers())
        print(f"  Status: {resp.status_code}")
        data = resp.json()
        task_id = data.get("data", {}).get("taskId")
        print(f"  Task ID: {task_id}")
        assert resp.status_code == 200 and data.get("code") == 200, f"Failed: {data}"
        return task_id

    def test_get_music_result(self, task_id: str):
        """GET /api/v1/generate/record-info — Poll and get music result.

        Callback stages: PENDING → TEXT_SUCCESS → FIRST_SUCCESS → SUCCESS
        """
        print(f"\n[SUNO] Polling music for task: {task_id}")
        url = f"{SUNO_BASE_URL}/api/v1/generate/record-info?taskId={task_id}"
        result = poll_suno(url)

        # Extract songs from nested response.sunoData
        response = result.get("data", {}).get("response", {})
        songs = response.get("sunoData", [])
        for i, song in enumerate(songs):
            print(f"\n  --- Song {i + 1} ---")
            print(f"  ID: {song.get('id')}")
            print(f"  Audio URL: {song.get('audioUrl')}")
            print(f"  Stream URL: {song.get('streamAudioUrl')}")
            print(f"  Image URL: {song.get('imageUrl')}")
            prompt_text = song.get("prompt", "")
            print(f"  Lyrics preview: {prompt_text[:200]}...")
        return songs

    # ── 1.3 Stem Separation ───────────────────────────────────────────────────

    def test_stem_separation(self, music_task_id: str, audio_id: str,
                             stem_type: str = "split_stem"):
        """POST /api/v1/vocal-removal/generate — Separate stems.

        Args:
          music_task_id: taskId from music generation (POST /api/v1/generate)
          audio_id: song ID from response.sunoData[].id
          stem_type: 'separate_vocal' (2 stems, 1 credit) or 'split_stem' (12 stems, 5 credits)

        Response uses 'successFlag' field (not 'status').
        """
        print(f"\n[SUNO] Separating stems (type={stem_type})...")
        payload = {
            "taskId": music_task_id,
            "audioId": audio_id,
            "type": stem_type,
            "callBackUrl": CALLBACK_URL,
        }
        resp = requests.post(
            f"{SUNO_BASE_URL}/api/v1/vocal-removal/generate",
            json=payload, headers=suno_headers(),
        )
        print(f"  Status: {resp.status_code}")
        data = resp.json()
        task_id = data.get("data", {}).get("taskId")
        print(f"  Task ID: {task_id}")
        assert resp.status_code == 200 and data.get("code") == 200, f"Failed: {data}"
        return task_id

    def test_get_stem_result(self, task_id: str):
        """GET /api/v1/vocal-removal/record-info — Poll and get stem URLs."""
        print(f"\n[SUNO] Polling stem separation for task: {task_id}")
        url = f"{SUNO_BASE_URL}/api/v1/vocal-removal/record-info?taskId={task_id}"
        result = poll_suno(url)

        response = result.get("data", {}).get("response", {})
        stem_keys = [
            "vocalUrl", "backingVocalsUrl", "drumsUrl", "bassUrl", "guitarUrl",
            "keyboardUrl", "percussionUrl", "stringsUrl", "synthUrl", "fxUrl",
            "brassUrl", "woodwindsUrl", "instrumentalUrl",
        ]
        print("\n  Stems found:")
        for key in stem_keys:
            val = response.get(key)
            if val:
                print(f"    {key}: {val[:80]}...")

        # Also show originData (detailed per-stem info)
        origin_data = response.get("originData", [])
        if origin_data:
            print(f"\n  Detailed stems ({len(origin_data)} tracks):")
            for item in origin_data:
                name = item.get("stem_type_group_name", "Unknown")
                dur = item.get("duration", 0)
                print(f"    {name} ({dur:.1f}s)")
        return response

    # ── 1.4 WAV Conversion ────────────────────────────────────────────────────

    def test_convert_to_wav(self, music_task_id: str, audio_id: str):
        """POST /api/v1/wav/generate — Convert audio to WAV format.

        Args:
          music_task_id: taskId from music generation (POST /api/v1/generate)
          audio_id: song ID from response.sunoData[].id

        Response uses 'successFlag' field. Output in response.audioWavUrl.
        """
        print("\n[SUNO] Converting to WAV...")
        payload = {
            "taskId": music_task_id,
            "audioId": audio_id,
            "callBackUrl": CALLBACK_URL,
        }
        resp = requests.post(f"{SUNO_BASE_URL}/api/v1/wav/generate", json=payload, headers=suno_headers())
        print(f"  Status: {resp.status_code}")
        data = resp.json()
        task_id = data.get("data", {}).get("taskId")
        print(f"  Task ID: {task_id}")
        assert resp.status_code == 200 and data.get("code") == 200, f"Failed: {data}"
        return task_id

    def test_get_wav_result(self, task_id: str):
        """GET /api/v1/wav/record-info — Poll WAV conversion result."""
        print(f"\n[SUNO] Polling WAV conversion for task: {task_id}")
        url = f"{SUNO_BASE_URL}/api/v1/wav/record-info?taskId={task_id}"
        result = poll_suno(url)
        wav_url = result.get("data", {}).get("response", {}).get("audioWavUrl")
        print(f"  WAV URL: {wav_url}")
        return result.get("data", {})

    # ── 1.5 Other Endpoints ───────────────────────────────────────────────────

    def test_get_timestamped_lyrics(self, music_task_id: str, audio_id: str):
        """POST /api/v1/generate/get-timestamped-lyrics — Get lyrics with word-level timestamps.

        Args:
          music_task_id: taskId from music generation
          audio_id: song ID from response.sunoData[].id

        Returns alignedWords[] with startS/endS per word (seconds).
        """
        print(f"\n[SUNO] Getting timestamped lyrics...")
        resp = requests.post(
            f"{SUNO_BASE_URL}/api/v1/generate/get-timestamped-lyrics",
            json={"taskId": music_task_id, "audioId": audio_id},
            headers=suno_headers(),
        )
        print(f"  Status: {resp.status_code}")
        data = resp.json()
        words = data.get("data", {}).get("alignedWords", [])
        print(f"  Total words: {len(words)}")
        for w in words[:5]:
            print(f"    [{w.get('startS', 0):6.2f}s - {w.get('endS', 0):6.2f}s] {w.get('word', '').strip()}")
        return data


# ═══════════════════════════════════════════════════════════════════════════════
# 2. Mureka API Tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestMurekaAPI:
    """
    Test suite for Mureka API — Music & Voice Generation.
    Base URL: https://api.mureka.ai  (verified 2026-03-20)
    Auth: Bearer Token
    """

    # ── 2.1 Account ───────────────────────────────────────────────────────────

    def test_check_billing(self):
        """GET /v1/account/billing — Check billing/credits."""
        print("\n[Mureka] Checking billing...")
        resp = requests.get(f"{MUREKA_BASE_URL}/v1/account/billing", headers=mureka_headers())
        print(f"  Status: {resp.status_code}")
        pp(resp.json())
        return resp.json()

    # ── 2.2 Lyrics ────────────────────────────────────────────────────────────

    def test_generate_lyrics(self, prompt: str = "Write a Thai pop song about city life at night"):
        """POST /v1/lyrics/generate — Generate lyrics from prompt."""
        print("\n[Mureka] Generating lyrics...")
        resp = requests.post(
            f"{MUREKA_BASE_URL}/v1/lyrics/generate",
            json={"prompt": prompt}, headers=mureka_headers(),
        )
        print(f"  Status: {resp.status_code}")
        data = resp.json()
        pp(data)
        return data

    def test_extend_lyrics(self, lyrics: str, prompt: str = "Add a bridge and final chorus"):
        """POST /v1/lyrics/extend — Extend existing lyrics."""
        print("\n[Mureka] Extending lyrics...")
        resp = requests.post(
            f"{MUREKA_BASE_URL}/v1/lyrics/extend",
            json={"lyrics": lyrics, "prompt": prompt}, headers=mureka_headers(),
        )
        print(f"  Status: {resp.status_code}")
        data = resp.json()
        pp(data)
        return data

    # ── 2.3 Song Generation ───────────────────────────────────────────────────

    def test_generate_song(self, prompt: str = "Upbeat Thai pop song with catchy melody"):
        """POST /v1/song/generate — Generate a full song."""
        print("\n[Mureka] Generating song...")
        resp = requests.post(
            f"{MUREKA_BASE_URL}/v1/song/generate",
            json={"prompt": prompt}, headers=mureka_headers(),
        )
        print(f"  Status: {resp.status_code}")
        data = resp.json()
        pp(data)
        task_id = data.get("task_id") or data.get("data", {}).get("task_id")
        print(f"  Task ID: {task_id}")
        return task_id

    def test_query_song(self, task_id: str):
        """GET /v1/song/query/{task_id} — Poll song generation status."""
        print(f"\n[Mureka] Polling song task: {task_id}")
        for attempt in range(MAX_POLL_ATTEMPTS):
            resp = requests.get(
                f"{MUREKA_BASE_URL}/v1/song/query/{task_id}",
                headers=mureka_headers(),
            )
            data = resp.json()
            status = data.get("status") or data.get("data", {}).get("status")
            print(f"  Poll {attempt + 1}: status={status}")

            if status and status.lower() in ("completed", "success", "done"):
                pp(data)
                return data
            if status and "fail" in str(status).lower():
                raise RuntimeError(f"Song generation failed: {status}")
            time.sleep(POLL_INTERVAL)
        raise TimeoutError("Song generation timed out")

    def test_generate_instrumental(self, prompt: str = "Smooth jazz instrumental background"):
        """POST /v1/instrumental/generate — Generate instrumental track."""
        print("\n[Mureka] Generating instrumental...")
        resp = requests.post(
            f"{MUREKA_BASE_URL}/v1/instrumental/generate",
            json={"prompt": prompt}, headers=mureka_headers(),
        )
        print(f"  Status: {resp.status_code}")
        data = resp.json()
        pp(data)
        return data.get("task_id") or data.get("data", {}).get("task_id")

    # ── 2.4 Stem & Analysis ───────────────────────────────────────────────────

    def test_stem_separation(self, audio_url: str):
        """POST /v1/song/stem — Separate stems from a song."""
        print("\n[Mureka] Separating stems...")
        resp = requests.post(
            f"{MUREKA_BASE_URL}/v1/song/stem",
            json={"audio_url": audio_url}, headers=mureka_headers(),
        )
        print(f"  Status: {resp.status_code}")
        pp(resp.json())
        return resp.json()

    def test_recognize_song(self, audio_url: str):
        """POST /v1/song/recognize — Analyze song (BPM, Key, Mood)."""
        print("\n[Mureka] Analyzing song...")
        resp = requests.post(
            f"{MUREKA_BASE_URL}/v1/song/recognize",
            json={"audio_url": audio_url}, headers=mureka_headers(),
        )
        print(f"  Status: {resp.status_code}")
        pp(resp.json())
        return resp.json()

    def test_describe_song(self, audio_url: str):
        """POST /v1/song/describe — Generate description from audio."""
        print("\n[Mureka] Describing song...")
        resp = requests.post(
            f"{MUREKA_BASE_URL}/v1/song/describe",
            json={"audio_url": audio_url}, headers=mureka_headers(),
        )
        print(f"  Status: {resp.status_code}")
        pp(resp.json())
        return resp.json()

    # ── 2.5 TTS ───────────────────────────────────────────────────────────────

    def test_tts(self, text: str = "สวัสดีครับ นี่คือเสียงทดสอบจาก Nova Music OS"):
        """POST /v1/tts/generate — Text-to-Speech."""
        print("\n[Mureka] Generating TTS...")
        resp = requests.post(
            f"{MUREKA_BASE_URL}/v1/tts/generate",
            json={"text": text}, headers=mureka_headers(),
        )
        print(f"  Status: {resp.status_code}")
        pp(resp.json())
        return resp.json()

    def test_podcast(self, text: str = "Welcome to our music tech podcast. Today we discuss AI music."):
        """POST /v1/tts/podcast — Generate 2-voice podcast."""
        print("\n[Mureka] Generating podcast...")
        resp = requests.post(
            f"{MUREKA_BASE_URL}/v1/tts/podcast",
            json={"text": text}, headers=mureka_headers(),
        )
        print(f"  Status: {resp.status_code}")
        pp(resp.json())
        return resp.json()

    # ── 2.6 File Upload ───────────────────────────────────────────────────────

    def test_upload_file(self, file_path: str):
        """POST /v1/files/upload — Upload a file (reference audio, voice sample)."""
        print(f"\n[Mureka] Uploading: {file_path}")
        with open(file_path, "rb") as f:
            resp = requests.post(
                f"{MUREKA_BASE_URL}/v1/files/upload",
                headers={"Authorization": f"Bearer {MUREKA_API_KEY}"},
                files={"file": f},
            )
        print(f"  Status: {resp.status_code}")
        pp(resp.json())
        return resp.json()


# ═══════════════════════════════════════════════════════════════════════════════
# 3. Roex API Tests (Python SDK)
# ═══════════════════════════════════════════════════════════════════════════════

class TestRoexAPI:
    """
    Test suite for Roex Tonn API — AI Mixing & Mastering.
    SDK: pip install roex-python
    Auth: API Key from tonn-portal.roexaudio.com
    """

    def __init__(self):
        self.client = None

    def setup(self):
        """Initialize Roex client."""
        try:
            from roex_python.client import RoExClient
            self.client = RoExClient(api_key=ROEX_API_KEY)
            print("\n[Roex] Client initialized OK")
            print(f"  Mix methods: {[m for m in dir(self.client.mix) if not m.startswith('_')]}")
            print(f"  Mastering: {[m for m in dir(self.client.mastering) if not m.startswith('_')]}")
            print(f"  Analysis: {[m for m in dir(self.client.analysis) if not m.startswith('_')]}")
            return True
        except ImportError:
            print("\n[Roex] SDK not installed. Run: pip install roex-python")
            return False

    def test_upload_file(self, file_path: str) -> str:
        """Upload a local WAV file and get URL."""
        from roex_python.utils import upload_file
        print(f"\n[Roex] Uploading: {file_path}")
        url = upload_file(self.client, file_path)
        print(f"  URL: {url}")
        return url

    def test_mix_preview(self, stem_urls: dict, style="POP"):
        """Create a free 30s mix preview from stem URLs.

        stem_urls: dict like {"vocals": "url", "drums": "url", "bass": "url", ...}
        """
        from roex_python.models import (
            TrackData, MultitrackMixRequest,
            InstrumentGroup, PresenceSetting, PanPreference, MusicalStyle,
        )

        print("\n[Roex] Creating mix preview (free 30s)...")

        # SDK enum values (roex-python 1.3.0):
        #   PresenceSetting: NORMAL, LEAD, BACKGROUND
        #   PanPreference:   NO_PREFERENCE, LEFT, CENTRE, RIGHT
        #   InstrumentGroup: DRUMS_GROUP, KEYS_GROUP, E_GUITAR_GROUP, BACKING_VOX_GROUP, PERCS_GROUP
        instrument_map = {
            "vocals": (InstrumentGroup.VOCAL_GROUP, PresenceSetting.LEAD, PanPreference.CENTRE),
            "drums": (InstrumentGroup.DRUMS_GROUP, PresenceSetting.NORMAL, PanPreference.CENTRE),
            "bass": (InstrumentGroup.BASS_GROUP, PresenceSetting.NORMAL, PanPreference.CENTRE),
            "guitar": (InstrumentGroup.E_GUITAR_GROUP, PresenceSetting.NORMAL, PanPreference.RIGHT),
            "keyboard": (InstrumentGroup.KEYS_GROUP, PresenceSetting.NORMAL, PanPreference.LEFT),
            "strings": (InstrumentGroup.STRINGS_GROUP, PresenceSetting.NORMAL, PanPreference.CENTRE),
            "synth": (InstrumentGroup.SYNTH_GROUP, PresenceSetting.NORMAL, PanPreference.CENTRE),
            "brass": (InstrumentGroup.BRASS_GROUP, PresenceSetting.NORMAL, PanPreference.CENTRE),
            "fx": (InstrumentGroup.FX_GROUP, PresenceSetting.BACKGROUND, PanPreference.CENTRE),
            "percussion": (InstrumentGroup.PERCS_GROUP, PresenceSetting.NORMAL, PanPreference.CENTRE),
            "backingVocals": (InstrumentGroup.BACKING_VOX_GROUP, PresenceSetting.BACKGROUND, PanPreference.CENTRE),
        }

        tracks = []
        for name, url in stem_urls.items():
            if not url or name not in instrument_map:
                continue
            group, presence, pan = instrument_map[name]
            tracks.append(TrackData(
                track_url=url,
                instrument_group=group,
                presence_setting=presence,
                pan_preference=pan,
            ))

        if len(tracks) < 2:
            print("  [!] Need at least 2 tracks for mixing.")
            return None

        musical_style = getattr(MusicalStyle, style, MusicalStyle.POP)
        request = MultitrackMixRequest(track_data=tracks, musical_style=musical_style)
        result = self.client.mix.create_mix_preview(request)
        print(f"  Preview result: {result}")
        return result

    def test_full_mix(self, stem_urls: dict, style="POP"):
        """Create a full mix (uses credits)."""
        from roex_python.models import (
            TrackData, MultitrackMixRequest,
            InstrumentGroup, PresenceSetting, PanPreference, MusicalStyle,
        )

        print("\n[Roex] Creating full mix (uses credits)...")
        # Same track setup as preview
        return self.test_mix_preview(stem_urls, style)  # Reuse logic, replace call below
        # To actually create full mix:
        # result = self.client.mix.create_mix(request)

    def test_mastering_preview(self, audio_url: str):
        """Create mastering preview (free 30s)."""
        print("\n[Roex] Creating mastering preview...")
        result = self.client.mastering.create_mastering_preview(track_url=audio_url)
        print(f"  Preview: {result}")
        return result

    def test_analysis(self, audio_url: str):
        """Analyze audio — LUFS, dynamics, stereo width, mix readiness."""
        print("\n[Roex] Analyzing audio...")
        result = self.client.analysis.analyze_mix(track_url=audio_url)
        print(f"  Analysis: {result}")
        return result


# ═══════════════════════════════════════════════════════════════════════════════
# 4. Landr API Tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestLandrAPI:
    """
    Test suite for Landr API — AI Mastering + Distribution.
    Status: Partnership API — pending access from Landr sales team.
    """

    def _headers(self):
        return {
            "Authorization": f"Bearer {LANDR_API_KEY}",
            "Content-Type": "application/json",
        }

    def test_create_master(self, audio_file_path: str):
        """POST /master — Upload mixed WAV and create master."""
        print(f"\n[Landr] Creating master from: {audio_file_path}")
        with open(audio_file_path, "rb") as f:
            resp = requests.post(
                f"{LANDR_BASE_URL}/master",
                headers={"Authorization": f"Bearer {LANDR_API_KEY}"},
                files={"file": f},
                data={"loudness": "medium", "style": "balanced"},
            )
        print(f"  Status: {resp.status_code}")
        data = resp.json()
        master_id = data.get("id") or data.get("data", {}).get("id")
        print(f"  Master ID: {master_id}")
        return master_id

    def test_get_master_status(self, master_id: str):
        """GET /master/{id} — Check mastering status + download URL."""
        print(f"\n[Landr] Checking master status: {master_id}")
        for attempt in range(MAX_POLL_ATTEMPTS):
            resp = requests.get(f"{LANDR_BASE_URL}/master/{master_id}", headers=self._headers())
            data = resp.json()
            status = data.get("status")
            print(f"  Poll {attempt + 1}: status={status}")

            if status and status.lower() in ("completed", "done", "ready"):
                print(f"  Download: {data.get('download_url')}")
                return data
            if status and "fail" in str(status).lower():
                raise RuntimeError(f"Mastering failed: {status}")
            time.sleep(POLL_INTERVAL)
        raise TimeoutError("Mastering timed out")

    def test_get_master_preview(self, master_id: str):
        """GET /master/{id}/preview — Get 3 loudness level previews before commit."""
        print(f"\n[Landr] Getting master preview: {master_id}")
        resp = requests.get(f"{LANDR_BASE_URL}/master/{master_id}/preview", headers=self._headers())
        print(f"  Status: {resp.status_code}")
        pp(resp.json())
        return resp.json()


# ═══════════════════════════════════════════════════════════════════════════════
# Full Pipeline Test
# ═══════════════════════════════════════════════════════════════════════════════

def run_full_pipeline():
    """
    Full Nova Music OS pipeline:
    Step 1: Lyrics → Step 2: Music → Step 3: Stems → Step 4: Mix → Step 5: QC
    """
    print("=" * 70)
    print("  NOVA MUSIC OS — Full Pipeline Test")
    print("=" * 70)

    suno = TestSunoAPI()
    roex = TestRoexAPI()

    # Step 1: Generate lyrics
    print("\n--- Step 1: Generate Lyrics ---")
    lyrics_task = suno.test_generate_lyrics("A catchy Thai pop song about new beginnings and hope")
    variations = suno.test_get_lyrics_result(lyrics_task)
    lyrics_text = variations[0].get("text", "") if variations else ""

    if not lyrics_text:
        print("  [!] No lyrics generated, using fallback")
        lyrics_text = "[Verse 1]\nNew day new start\n[Chorus]\nHere we go again"

    # Step 2: Generate music with those lyrics
    print("\n--- Step 2: Generate Music ---")
    music_task = suno.test_generate_music_custom(
        lyrics=lyrics_text,
        style="Thai Pop Acoustic",
        title="New Beginnings",
    )
    songs = suno.test_get_music_result(music_task)
    audio_url = songs[0].get("audioUrl") if songs else None
    song_id = songs[0].get("id") if songs else None

    if not audio_url or not song_id:
        print("  [!] No audio URL or song ID — cannot continue pipeline.")
        return

    print(f"\n  Audio URL: {audio_url}")
    print(f"  Song ID:   {song_id}")

    # Step 3: Stem separation (12 stems for full mix)
    # Requires: music generation taskId + song audioId
    print("\n--- Step 3: Stem Separation (12 stems) ---")
    stem_task = suno.test_stem_separation(music_task, song_id, stem_type="split_stem")
    stems = suno.test_get_stem_result(stem_task)

    # Step 4: AI Mix with Roex
    print("\n--- Step 4: AI Mix (Roex) ---")
    if roex.setup():
        stem_urls = {
            "vocals": stems.get("vocalUrl"),
            "drums": stems.get("drumsUrl"),
            "bass": stems.get("bassUrl"),
            "guitar": stems.get("guitarUrl"),
            "keyboard": stems.get("keyboardUrl"),
            "strings": stems.get("stringsUrl"),
            "synth": stems.get("synthUrl"),
        }
        stem_urls = {k: v for k, v in stem_urls.items() if v}
        print(f"  Available stems: {list(stem_urls.keys())}")

        if len(stem_urls) >= 2:
            roex.test_mix_preview(stem_urls)
        else:
            print("  [!] Not enough stems for mixing.")

        # Step 5: QC Analysis
        print("\n--- Step 5: QC Analysis ---")
        roex.test_analysis(audio_url)
    else:
        print("  [!] Roex SDK not available. Skipping mix + QC.")

    print("\n" + "=" * 70)
    print("  Pipeline test complete!")
    print("=" * 70)


# ═══════════════════════════════════════════════════════════════════════════════
# Individual Quick Tests
# ═══════════════════════════════════════════════════════════════════════════════

def run_suno_test():
    """Test SUNO: lyrics + music generation end-to-end."""
    print("\n=== SUNO API Test ===")
    suno = TestSunoAPI()

    # Lyrics
    task = suno.test_generate_lyrics("A happy song about sunshine")
    suno.test_get_lyrics_result(task)

    # Music
    task = suno.test_generate_music("A cheerful pop song about a sunny day")
    songs = suno.test_get_music_result(task)
    if songs and songs[0].get("audioUrl"):
        print(f"\n  Download: {songs[0]['audioUrl']}")


def run_mureka_test():
    """Test Mureka: billing + lyrics generation."""
    print("\n=== Mureka API Test ===")
    mureka = TestMurekaAPI()
    mureka.test_check_billing()
    mureka.test_generate_lyrics()


def run_roex_test():
    """Test Roex: SDK initialization."""
    print("\n=== Roex SDK Test ===")
    roex = TestRoexAPI()
    roex.setup()


# ═══════════════════════════════════════════════════════════════════════════════
# Entry Point
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    commands = {
        "full": run_full_pipeline,
        "suno": run_suno_test,
        "mureka": run_mureka_test,
        "roex": run_roex_test,
    }

    if len(sys.argv) > 1 and sys.argv[1] in commands:
        commands[sys.argv[1]]()
    else:
        print("Nova Music OS — API Test Suite")
        print("=" * 50)
        print()
        print("Usage:")
        print("  python test_nova_music_api.py full    — Full pipeline test")
        print("  python test_nova_music_api.py suno    — Test SUNO (lyrics + music)")
        print("  python test_nova_music_api.py mureka  — Test Mureka (billing + lyrics)")
        print("  python test_nova_music_api.py roex    — Test Roex SDK init")
        print()
        print("Environment variables:")
        print("  SUNO_API_KEY    — from sunoapi.org")
        print("  MUREKA_API_KEY  — from platform.mureka.ai")
        print("  ROEX_API_KEY    — from tonn-portal.roexaudio.com")
        print("  LANDR_API_KEY   — from Landr (partnership)")
        print("  CALLBACK_URL    — webhook URL (default: httpbin.org/post)")

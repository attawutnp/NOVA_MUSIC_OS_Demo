# Nova Music OS — Pricing & Cost Analysis

**Date:** 2026-03-30
**APIs:** Mureka + Roex

---

## 1. Cost per Song (Full Pipeline)

| Step | Service | API | Cost |
|------|---------|-----|------|
| 1 | Lyrics generation | Mureka | $0.009 |
| 2 | Song generation (V8 model) | Mureka | $0.045 |
| 3 | Stem separation | Mureka | $0.060 |
| 4 | Convert MP3 → WAV | Local (pydub) | Free |
| 5 | Upload stems | Roex | Free |
| 6 | **Multitrack Mix (full)** | Roex | **250 credits** |
| 7 | **Mastering (full)** | Roex | **220 credits** |
| 8 | QC Analysis | Roex | 10 credits |
| | | | |
| | **Mureka subtotal** | | **$0.114** |
| | **Roex subtotal** | | **480 credits** |

### Total per Song by Roex Plan

| Roex Plan | $/Credit | Roex Cost | + Mureka | **Total/Song** |
|-----------|----------|-----------|----------|----------------|
| Small ($10 / 1,000 cr) | $0.010 | $4.80 | $0.114 | **$4.91** |
| Medium ($45 / 5,000 cr) | $0.009 | $4.32 | $0.114 | **$4.43** |
| Large ($80 / 10,000 cr) | $0.008 | $3.84 | $0.114 | **$3.95** |

---

## 2. Mureka — Feature Pricing

### Per-Feature Costs

| Feature | Endpoint | Cost | Unit |
|---------|----------|------|------|
| Lyrics generation (full) | `POST /v1/lyrics/generate` | $0.009 | per set |
| Lyrics generation (single line) | `POST /v1/lyrics/extend` | $0.002 | per line |
| Song generation (V8) | `POST /v1/song/generate` | $0.045 | per song |
| Song generation (V7.6) | `POST /v1/song/generate` | $0.030 | per song |
| Song extend | `POST /v1/song/extend` | $0.045 | per extension |
| Instrumental generation | `POST /v1/instrumental/generate` | $0.045 | per track |
| Stem separation | `POST /v1/song/stem` | $0.060 | per song |
| Song describe/analysis | `POST /v1/song/describe` | Free | — |
| Song recognize | `POST /v1/song/recognize` | — | — |
| Text-to-Speech | `POST /v1/tts/generate` | $4.90 | per hour |
| Podcast (2-voice) | `POST /v1/tts/podcast` | $6.90 | per hour |
| File upload | `POST /v1/files/upload` | Free | — |
| Query/poll status | `GET /v1/*/query/{id}` | Free | — |
| Account billing | `GET /v1/account/billing` | Free | — |

### Subscription Plans

| Plan | Price/mo | Concurrent Jobs | Bonus |
|------|----------|-----------------|-------|
| Trial | $30 | 1 | — |
| Basic | $1,000 | 5 | — |
| Business | $3,000 | 15 | +5% bonus credits |
| Standard | $5,000 | 25 | +10% bonus credits |
| Enterprise | $30,000 | 150 | +20% bonus credits |

### Notes
- Credits valid **12 months** from last recharge (any new purchase extends all existing)
- FIFO consumption: paid credits first, then bonus, oldest first
- **Full commercial rights** on all paid API output
- Website memberships (mureka.ai) do NOT transfer to API platform (separate systems)

---

## 3. Roex — Feature Pricing

### Per-Feature Costs

| Feature | Endpoint | Credits | Cost (S/M/L) |
|---------|----------|---------|---------------|
| **Mixing** | | | |
| Mix preview (30s) | `POST /mixpreview` | 0 | **Free** |
| Full mix | `POST /retrievefinalmix` | 250 | $2.50 / $2.25 / $2.00 |
| Mix settings only | `POST /retrievefinalmix` | 125 | $1.25 / $1.13 / $1.00 |
| Processed stems only | `POST /retrievefinalmix` | 50 | $0.50 / $0.45 / $0.40 |
| **Mastering** | | | |
| Master preview (30s) | `POST /masteringpreview` | 0 | **Free** |
| Full master | `POST /retrievefinalmaster` | 220 | $2.20 / $1.98 / $1.76 |
| **Enhancement** | | | |
| Enhance preview | `POST /mixenhancepreview` | 0 | **Free** |
| Full enhance (standard) | `POST /mixenhance` | 250 | $2.50 / $2.25 / $2.00 |
| Full enhance (+ stems) | `POST /mixenhance` | 280 | $2.80 / $2.52 / $2.24 |
| **Analysis & Cleanup** | | | |
| Mix analysis (LUFS, etc.) | `POST /mixanalysis` | 10 | $0.10 / $0.09 / $0.08 |
| Audio cleanup | `POST /audiocleanup` | 10 | $0.10 / $0.09 / $0.08 |
| **Utility** | | | |
| Health check | `GET /health` | 0 | Free |
| File upload | `POST /upload` | 0 | Free |
| Poll/retrieve results | `POST /retrieve*` | 0 | Free |

### Credit Packages (Pre-paid, No Subscription)

| Package | Price | Credits | $/Credit | Savings |
|---------|-------|---------|----------|---------|
| Small | $10 | 1,000 | $0.010 | — |
| Medium | $45 | 5,000 | $0.009 | 10% |
| Large | $80 | 10,000 | $0.008 | 20% |
| **Signup bonus** | **Free** | **1,000** | — | — |

### Notes
- **No subscription** — pay only for what you use
- Credits valid **12 months** from purchase
- Credits deducted only upon **final audio retrieval** (not on preview)
- All 30-second previews are **free** and **unlimited**
- Auto top-up feature available

---

## 4. Volume Estimates

### Songs per Month

| Volume | Mureka | Roex (Small) | Roex (Medium) | Roex (Large) | Total |
|--------|--------|-------------|---------------|-------------|-------|
| 10 songs | $1.14 | $48.00 | $43.20 | $38.40 | **$39.54 – $49.14** |
| 50 songs | $5.70 | $240.00 | $216.00 | $192.00 | **$197.70 – $245.70** |
| 100 songs | $11.40 | $480.00 | $432.00 | $384.00 | **$395.40 – $491.40** |
| 500 songs | $57.00 | $2,400.00 | $2,160.00 | $1,920.00 | **$1,977.00 – $2,457.00** |
| 1,000 songs | $114.00 | $4,800.00 | $4,320.00 | $3,840.00 | **$3,954.00 – $4,914.00** |

### Roex Credits Needed per Month

| Volume | Credits/mo | Packages Needed (Large) | Cost |
|--------|-----------|------------------------|------|
| 10 songs | 4,800 | 1x Medium ($45) | $45 |
| 50 songs | 24,000 | 3x Large ($240) | $240 |
| 100 songs | 48,000 | 5x Large ($400) | $400 |
| 500 songs | 240,000 | 24x Large ($1,920) | $1,920 |

### Recommended Mureka Plan by Volume

| Volume | Min Concurrent | Recommended Plan | Cost |
|--------|---------------|-----------------|------|
| 10 songs/mo | 1 | Trial ($30) | $30/mo |
| 50 songs/mo | 2-3 | Basic ($1,000) | $1,000/mo |
| 100 songs/mo | 5 | Basic ($1,000) | $1,000/mo |
| 500 songs/mo | 10-15 | Business ($3,000) | $3,000/mo |

---

## 5. Preview vs Production Costs

### Preview Mode (Testing/Demo)

| Step | Cost |
|------|------|
| Mureka (lyrics + song + stems) | $0.114 |
| Roex mix preview (30s, free) | Free |
| Roex master preview (30s, free) | Free |
| Roex analysis | $0.08–$0.10 |
| **Total per song (preview)** | **$0.19–$0.21** |

Use preview mode for:
- User preview before committing to full production
- A/B testing different prompts or styles
- Development and QA testing

### Production Mode (Release-quality)

| Step | Cost (Large plan) |
|------|-------------------|
| Mureka (lyrics + song + stems) | $0.114 |
| Roex full mix | $2.00 |
| Roex full master | $1.76 |
| Roex analysis | $0.08 |
| **Total per song (production)** | **$3.95** |

---

## 6. Cost Optimization Tips

1. **Use previews first** — Roex previews are free and unlimited. Only pay for full mix/master after user approval.

2. **Choose the right Mureka model** — V7.6 ($0.03/song) vs V8 ($0.045/song). Use V7.6 for drafts, V8 for final.

3. **Buy Roex Large packs** — $0.008/credit vs $0.010/credit = 20% savings.

4. **Batch processing** — Mureka supports 10 concurrent jobs. Process multiple songs in parallel to maximize throughput.

5. **Cache stems** — If a user wants to remix the same song, reuse the stems. Stem separation ($0.06) only needs to happen once per song.

6. **Skip unnecessary steps** — Not every song needs cleanup ($0.08) or enhancement ($2.00). Only apply when needed.

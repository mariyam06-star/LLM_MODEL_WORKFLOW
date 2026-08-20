# LLM Explorer & Visualizer — Full Technical Documentation

An interactive, in-browser simulator that shows how a Large Language Model turns text into tokens, computes attention, and generates the next word — with every intermediate number (embeddings, Q/K/V, attention weights, logits, probabilities) computed live in the browser and rendered as visual, explorable UI.

---

## 1. What this project is

This is a **React + TypeScript + Vite** single-page application, served by a small **Express** backend. It reimplements a simplified, fully deterministic transformer forward pass in plain TypeScript (no ML framework, no GPU, no real model weights) so that every step — tokenization, embedding lookup, positional encoding, multi-head attention, feed-forward network, softmax sampling — can be inspected, animated, and explained on screen.

It also optionally calls Google's **Gemini API** through the backend to generate a real, model-written architectural explanation of whatever prompt the user typed, with a built-in offline fallback if no API key is configured.

| Aspect | Detail |
|---|---|
| Type | Educational / interactive visualization web app |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS v4 |
| Backend | Express 4, run via `tsx` in dev / bundled with `esbuild` in prod |
| External API | Google Gemini (`@google/genai`), optional |
| Animation | `motion` (Framer Motion successor) |
| PDF export | `jsPDF` + `html2canvas` |
| Package manager | `bun` (has `bun.lock`), npm-compatible |

---

## 2. Project structure

```
LLM_MODEL_WORKFLOW-main/
├── index.html                  Vite entry HTML
├── server.ts                   Express server + Gemini API route + Vite middleware
├── vite.config.ts              Vite build config
├── package.json                Scripts & dependencies
├── tsconfig.json                TypeScript config
├── metadata.json                App metadata (name, description, capabilities)
├── .env.example                 Required environment variables
├── src/
│   ├── main.tsx                 React root mount
│   ├── App.tsx                  Top-level app shell, mode routing, global state
│   ├── index.css                Tailwind entry + global styles
│   ├── types.ts                 All shared TypeScript interfaces/types
│   ├── lib/
│   │   ├── transformerEngine.ts  The core simulated transformer math (574 lines)
│   │   └── vocabulary.ts         Hand-authored vocabulary + semantic vectors + presets
│   └── components/
│       ├── Navbar.tsx              Top navigation, mode switcher, preset picker, dark mode
│       ├── VisualJourney.tsx       Guided step-by-step pipeline walkthrough ("pipeline" mode)
│       ├── PipelineWalkthrough.tsx Alternate/legacy stepped pipeline view
│       ├── GenerationSandbox.tsx   Free-form generation playground ("sandbox" mode)
│       ├── AttentionMatrixView.tsx Multi-head attention matrix heatmap explorer
│       ├── EmbeddingSpaceView.tsx  Embedding space explorer, cosine similarity, vector analogy
│       ├── GeminiInspector.tsx     Calls backend to get a real Gemini-written analysis
│       ├── PdfExportModal.tsx      Exports the current session as a PDF report
│       ├── TokenBadge.tsx          Reusable colored token chip component
│       └── MathFormula.tsx         Reusable formula callout box component
└── assets/.aistudio/            Google AI Studio project metadata (not app code)
```

---

## 3. How to run it

### Prerequisites
- Node.js (or Bun, since `bun.lock` is present)
- Optional: a Gemini API key for live AI-generated analysis (falls back to an offline canned analysis if omitted)

### Setup

```bash
# install dependencies
bun install        # or: npm install

# copy env template and (optionally) add a real key
cp .env.example .env
# edit .env and set GEMINI_API_KEY

# start the dev server (Vite middleware + Express, hot reload)
bun run dev         # or: npm run dev
```

The app serves at **http://localhost:3000**.

### Scripts (`package.json`)

| Script | Purpose |
|---|---|
| `dev` | Runs `server.ts` via `tsx` with Vite in middleware mode (hot reload) |
| `build` | `vite build` (bundles frontend) + `esbuild` bundles `server.ts` → `dist/server.cjs` |
| `start` | Runs the production build (`node dist/server.cjs`) |
| `clean` | Removes `dist/` and `server.js` |
| `lint` | `tsc --noEmit` — type-checks without emitting files |

### Environment variables (`.env.example`)

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Enables live Gemini-powered analysis in the "AI Introspection" tab. Without it, the backend automatically serves a pre-written offline analysis instead. |
| `APP_URL` | Self-referential app URL, auto-injected when deployed on Google AI Studio / Cloud Run. |

---

## 4. Application architecture

### 4.1 High-level data flow

```
User types a prompt
        │
        ▼
tokenizeText(prompt)                 → TokenItem[]
        │
        ▼
runTransformerForwardPass(tokens)    → TransformerLayerState
        │                              (embeddings, Q/K/V, attention matrices,
        │                               FFN activations, normalized outputs)
        ▼
computeNextTokenLogits(tokens, ...)  → CandidateToken[]  (ranked, scored, filtered)
        │
        ▼
sampleNextToken(candidates, config)  → CandidateToken    (the actual next token)
```

This pipeline is recomputed on every keystroke in `App.tsx`, so the entire UI is always a live, reactive function of the current prompt text and the current sampling configuration (temperature, top-k, top-p, repetition penalty).

### 4.2 Global state (`App.tsx`)

`App.tsx` is the single source of truth. It holds:

- `currentMode` — which of the 5 visualizer tabs is active (`pipeline`, `sandbox`, `attention`, `embeddings`, `ai-introspection`)
- `selectedPresetId` / `promptText` — the active example prompt and its text
- `isDarkMode` — toggles a `dark` class on `<html>` (Tailwind dark mode)
- `samplingConfig` — `{ temperature, topK, topP, repetitionPenalty }`
- `isPdfModalOpen` — controls the PDF export modal

On every render it derives:
```ts
const tokens = tokenizeText(promptText);
const layerState = runTransformerForwardPass(tokens);
```
…and passes these down as props to whichever mode component is active. No global state library (Redux/Zustand) is used — everything is plain `useState` lifted to the app root.

### 4.3 The five visualizer modes

| Mode | Component | What it shows |
|---|---|---|
| `pipeline` | `VisualJourney.tsx` | A guided, animated walkthrough of the full pipeline for the current prompt: tokenization → embeddings → attention → FFN → sampling, with confetti on completion. |
| `sandbox` | `GenerationSandbox.tsx` | Freeform generation: repeatedly samples the next token and appends it, using play/pause/step controls, so users can watch autoregressive generation happen one token at a time. |
| `attention` | `AttentionMatrixView.tsx` | An interactive heatmap of the attention matrix for a selectable head and query token, with descriptions of what each of the 4 simulated heads specializes in. |
| `embeddings` | `EmbeddingSpaceView.tsx` | Explore the 16-dimensional semantic embedding space: compute cosine similarity between any two words, and run vector analogies (e.g. king − man + woman ≈ queen). |
| `ai-introspection` | `GeminiInspector.tsx` | Sends the current prompt to the backend `/api/gemini/analyze` endpoint and displays a real (or offline-fallback) Markdown-formatted architectural analysis. |

Shared UI pieces (`TokenBadge`, `MathFormula`) are reused across these modes for visual consistency.

---

## 5. The simulated transformer engine (`src/lib/transformerEngine.ts`)

This file is the mathematical core of the app. It is a **deterministic, hand-coded reimplementation** of transformer internals — not a trained model, but numerically faithful to the real equations, using a hand-built 16-dimensional vocabulary instead of learned weights so that results are fully explainable and reproducible.

### 5.1 Tokenization — `tokenizeText(input)`

- Splits input on a regex (`/\w+|[^\w\s]|\s+/g`) that separates words, punctuation, and whitespace.
- Looks up each token in `VOCABULARY_LIST`; unknown words get a deterministic pseudo-ID via a string hash (`hashString`).
- Also computes real UTF-8 byte arrays per token (`TextEncoder`) and assigns a deterministic display color from a fixed palette — both purely for visualization, mirroring how real BPE tokenizers operate on byte sequences.

### 5.2 Embeddings — `getSemanticEmbedding(text, dim=16)`

- Known vocabulary words return a hand-authored 16-dimensional semantic vector where each dimension has an assigned meaning (documented in `vocabulary.ts`): animacy, humanness, royalty/authority, gender axis, geography, technology, action, abstraction, syntax, negation, magnitude, emotion, language, time, science, and punctuation.
- Unknown words fall back to a deterministic pseudo-embedding generated from a hash of the string passed through `sin()`, then normalized — so the same unknown word always maps to the same vector.

### 5.3 Positional encoding

Two real positional encoding schemes are implemented for educational display:

- **Sinusoidal** — `getSinusoidalPositionalEncoding(pos, dim)` implements the original Transformer paper's formula: `PE(pos, 2i) = sin(pos / 10000^(2i/d))`, `PE(pos, 2i+1) = cos(...)`. This is the one actually used in the forward pass (added to the token embedding).
- **RoPE** — `getRoPEFrequencies(pos, dim)` computes rotary embedding cos/sin frequency pairs, shown for comparison in the UI even though it isn't applied in the main pass.

### 5.4 Vector analogy — `computeVectorAnalogy(A, B, C)`

Computes `vector(A) − vector(B) + vector(C)`, normalizes it, then ranks every vocabulary word by cosine similarity to that target vector, returning the top 5 matches — the classic "king − man + woman ≈ queen" demonstration, computed against the real embedding table.

### 5.5 Full forward pass — `runTransformerForwardPass(tokens, dim=16)`

This is the heart of the engine, producing a `TransformerLayerState` with every intermediate tensor. Configuration: **4 attention heads**, head dimension 4 (16 ÷ 4), FFN expansion to 64 dimensions (4×).

**Step 1 — Embeddings.** Semantic embedding + sinusoidal positional encoding are summed per token to produce `combinedEmbeddings`.

**Step 2 — Multi-head attention.** Each of the 4 heads is *architecturally specialized* (not learned, but scripted) to demonstrate a distinct real-world attention behavior:

| Head | Focus type | Simulated bias |
|---|---|---|
| Head 0 | `causal` | Strongly boosts attention to the immediately preceding token (recency bias) |
| Head 1 | `semantic` | Boosts attention proportional to cosine similarity between token embeddings (e.g. "France" ↔ "capital") |
| Head 2 | `syntactic` | Hand-coded boosts for specific grammatical pairs (e.g. "is" → "capital"/"France", `<=` → `n`, code syntax) |
| Head 3 | `positional` | Boosts attention to token 0 (global anchor / subject tracking) |

For each head, Q/K/V vectors are derived from the combined embedding via simple per-head linear scalings (not a learned weight matrix, but functionally analogous). Attention scores are computed as scaled dot products `(Q·Kᵀ)/√d_k`, a **causal mask** sets all future positions (`j > i`) to `-∞`, the head-specific bias above is added, and a numerically-stable softmax converts scores to weights.

**Step 3 — Multi-head output + residual + LayerNorm.** All 4 heads' weighted value vectors are concatenated back to the full 16 dimensions, added to the input via a residual connection (`x + Attention(x)`), then normalized with a standard LayerNorm (`(x − mean) / √(variance + ε)`).

**Step 4 — Feed-forward network (FFN/MLP).** Expands 16 → 64 dimensions with a GeLU activation (using the tanh approximation from the GPT-2 paper), projects back down 64 → 16, adds a second residual connection, and applies a final LayerNorm. This models the "knowledge retrieval" role of FFN layers described in transformer literature.

The function returns every intermediate tensor (embeddings, positional encodings, Q/K/V per head, raw scores, attention matrices, FFN activations, both normalized outputs) so the UI can visualize any stage.

### 5.6 Next-token logits — `computeNextTokenLogits(tokens, finalHiddenState, config)`

- Base score per vocabulary candidate = cosine similarity between the final hidden state and that word's embedding, scaled by 4.0.
- **Contextual boosting**: a large `if/else` chain hand-tunes logits for the built-in example prompts (e.g. if the prompt contains "capital" + "France" and ends in "is", `"Paris"` gets a large logit boost) — this simulates what a trained model's learned weights would produce, in a fully inspectable way.
- **Repetition penalty**: subtracts a configurable penalty from any token already present in the prompt.
- **Grammar coherence**: penalizes obviously invalid punctuation sequences (e.g. two periods in a row).
- Candidates are sorted, the top 25 are kept, **temperature scaling** (`logit / T`) is applied, softmax converts them to probabilities, and both **top-k** and **top-p (nucleus)** membership flags are computed per candidate along with the running cumulative probability.

### 5.7 Sampling — `sampleNextToken(candidates, config)`

- Filters to only candidates flagged both `isTopK` and `isTopP`.
- If `temperature < 0.15`, picks the top candidate deterministically (greedy decoding).
- Otherwise performs weighted random sampling over the filtered pool, proportional to (renormalized) probability.

---

## 6. Vocabulary & presets (`src/lib/vocabulary.ts`)

- `VOCABULARY_LIST` — roughly 80 hand-authored vocabulary entries, each with a 16-dimensional semantic vector and a category (`noun`, `verb`, `adjective`, `syntax`, `punctuation`, `concept`, `code`). The 16 dimensions are documented inline as: animacy, humanness, royalty, gender axis, geography, technology, action, abstraction, syntax, negation, magnitude, emotion, language, time, science, punctuation.
- `TOKEN_COLOR_PALETTE` — fixed set of colors deterministically assigned to tokens for visual consistency.
- `MODEL_PRESETS` — 5 built-in example prompts, each demonstrating a different capability:

| Preset ID | Prompt | Demonstrates |
|---|---|---|
| `factual-qa` | "The capital of France is" | Factual association → "Paris" |
| `vector-analogy` | "king man woman queen" | Embedding arithmetic (king − man + woman ≈ queen) |
| `transformer-explainer` | "The transformer attention model predicts next" | Self-attention linking related technical terms |
| `code-completion` | `def fibonacci(n): if n <=` | Syntax-aware attention on code |
| `creative-story` | "Once upon a time, there lived a brave knight in a" | Narrative/creative continuation |

---

## 7. Backend (`server.ts`)

A minimal Express server with two responsibilities:

1. **Dev/prod serving.** In development it mounts Vite in middleware mode for hot-module-reload; in production it serves the static `dist/` build and falls back to `index.html` for client-side routing (SPA pattern).
2. **`POST /api/gemini/analyze`** — the only real API route:
   - Accepts `{ prompt, currentTokens }`.
   - If `GEMINI_API_KEY` is set, tries a list of Gemini models in order (`gemini-3.7-flash`, `gemini-flash-latest`, `gemini-3.1-flash-lite`) with a system instruction asking for a Markdown-formatted architectural breakdown of attention behavior on the given prompt, falling through to the next model on failure.
   - If no key is set, or all models fail, returns a **pre-written, well-formatted offline fallback analysis** covering the same three sections (self-attention dynamics, residual stream/FFN, softmax/next-token prediction) so the UI always has something meaningful to show.
   - Also exposes `GET /api/health` for a basic liveness check.

`GeminiInspector.tsx` on the frontend calls this endpoint and renders the returned Markdown with `react-markdown`.

---

## 8. Key UI components

| Component | Responsibility |
|---|---|
| `Navbar.tsx` | Mode tabs, preset dropdown, dark-mode toggle, reset button, PDF export trigger, live token count |
| `TokenBadge.tsx` | Small reusable colored chip rendering a single token (with optional ID, active/focus states, 3 sizes) |
| `MathFormula.tsx` | Reusable card for displaying a formula with title, description, and optional dimension legend |
| `VisualJourney.tsx` | Primary guided pipeline experience — animates through tokenization → embeddings → attention → FFN → sampling stages with `motion`, triggers `canvas-confetti` on completing generation |
| `PipelineWalkthrough.tsx` | Alternate stepped walkthrough UI (forward/back stage navigation) reusing the same engine functions |
| `GenerationSandbox.tsx` | Play/pause/step-driven autoregressive generation loop, sampling one token at a time from `computeNextTokenLogits` + `sampleNextToken` |
| `AttentionMatrixView.tsx` | Head selector + query-token selector + interactive heatmap grid of attention weights, with hover highlighting |
| `EmbeddingSpaceView.tsx` | Word-pair cosine similarity tool and 3-word vector-analogy tool, both backed by `transformerEngine.ts` |
| `GeminiInspector.tsx` | Calls the backend Gemini route, shows loading/error states, renders Markdown response |
| `PdfExportModal.tsx` | Builds a PDF snapshot of the current session using `jsPDF`/`html2canvas` |

---

## 9. Type system overview (`src/types.ts`)

| Type | Purpose |
|---|---|
| `TokenItem` | A single token: id, text, UTF-8 bytes, sequence position, display color |
| `AttentionHeadData` | One attention head's metadata + its full `[query][key]` weight matrix |
| `VectorSlice` | A labeled numeric vector slice (dimension index + values) |
| `TransformerLayerState` | The complete output of one forward pass — every tensor at every stage |
| `CandidateToken` | A scored next-token candidate: raw logit, scaled logit, probability, cumulative probability, top-k/top-p membership flags |
| `SamplingConfig` | `{ temperature, topK, topP, repetitionPenalty }` |
| `ModelPreset` | A built-in example prompt with id, name, category, description, expected continuation |
| `VisualizerMode` | Union of the 5 tab identifiers |
| `PipelineStage` | Union of the 6 named pipeline stages used by the stepped walkthrough |

---

## 10. Design notes & limitations

- **Not a real trained model.** All "learned" behavior (which token attends to which, which word comes next) is hand-scripted using string/keyword matching and a small hand-authored embedding table — this is intentional, since the goal is pedagogical transparency, not generative capability. It will only behave sensibly on the 5 built-in preset prompts and close variants; arbitrary free text will fall back to generic, less meaningful heuristics.
- **Fixed small dimensionality.** Embeddings are 16-dimensional and there are only 4 attention heads (head dim = 4) — chosen so every number can be rendered and read on screen, unlike real models with thousands of dimensions and dozens of heads.
- **Gemini integration is optional and additive.** The "AI Introspection" tab is the only feature that calls out to a real LLM; everything else (tokenization, attention, embeddings, sampling) runs entirely client-side with the deterministic simulator, with no network dependency.
- **Deterministic except for final sampling.** Every stage is deterministic given the input text, except the final `sampleNextToken` step, which does weighted random sampling when temperature ≥ 0.15 (by design, to demonstrate stochastic decoding).

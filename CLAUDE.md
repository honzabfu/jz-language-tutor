# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Single-file PWA language tutor. The entire app lives in **`index.html`** (~2 100 lines) — CSS, HTML, and JS all in one file. No build tool, no npm, no bundler. Deployed to GitHub Pages at `honzabfu.github.io/jz-language-tutor`.

## Development

Open `index.html` directly in a browser — no server needed. For PWA/service-worker behaviour, serve over HTTP:

```bash
python3 -m http.server 8080
# or
npx serve .
```

No lint, no tests, no CI step — changes ship when merged to `main`.

## Architecture

### State

All runtime state is module-level `let` variables at the top of the `<script>` block (~line 730):

- `cfg` — provider, model, apiKey, uiLang, lessonMode, fontSize, ollamaUrl, customUrl, customModel
- `langLevels` — per-language student level map
- `currentLang` / `vocabLang` — active language for chat vs. vocab tab
- `fcQueue`, `fcIdx`, `fcRevealed`, `fcDirection` — flashcard session state
- `chatHistory`, `quizHistory`, `quizQueue`, `quizCurrentWord` — chat/quiz session state

### Persistence (localStorage keys)

| Key | Contents |
|---|---|
| `lt-cfg` | `cfg` object (provider, apiKey, model, etc.) |
| `lt-levels` | `langLevels` map |
| `lt-lang` | last active language |
| `lt-vocab-<lang>` | vocabulary array for each language |
| `lt-tips-<lang>` | saved tips array for each language |

On startup `init()` reads `lt-cfg` into `cfg` via `Object.assign`.

### Providers / LLM calls

All LLM traffic goes through a single `callLLM(messages, onChunk, signal)` function. Provider is selected by `cfg.provider` ∈ `{anthropic, openai, gemini, ollama, custom}`. Model metadata (tiers, capabilities, recommended flag) lives in `MODELS_METADATA` (~line 651).

Anthropic uses streaming SSE; OpenAI/Gemini/Ollama/custom use the OpenAI-compatible `/chat/completions` endpoint. The active request is tracked in `_abortCtrl` — switching views or starting a new request cancels the in-flight call.

### I18N

Two locales — `cs` (Czech) and `en` — in the `I18N` object (~line 759). The active translations object is `t`. Call `applyI18n()` after changing `cfg.uiLang` to re-render all static labels. Dynamic labels are always read as `t.someKey` at render time.

### Views

Five bottom-nav views (`#chat-view`, `#vocab-view`, `#fc-view`, `#quiz-view`, `#settings-view`). Navigation is `navTo(name)` which toggles `.active` on the matching `.view` element.

### SM-2 (spaced repetition)

`newSM2()` and `sm2Update(sm2, q)` implement the SM-2 algorithm. Each vocab word has a `.sm2` field `{interval, reps, ef, due}`. `due` is an ISO date string. Cards are due when `new Date(w.sm2.due) <= today`.

### Flashcards direction

`fcDirection` ∈ `{'normal', 'reverse'}` — defaults to `'reverse'` (Native→Foreign). In `renderFC()`, `_rev = fcDirection === 'reverse'` flips which field is `_front` / `_back`. The speak button always uses `w.word` (target language) regardless of direction.

## Conventions

- HTML structure: `<style>` → `<body>` (views + overlays) → `<script>` (constants → state → i18n → init → per-view functions)
- Functions are grouped by view with banner comments (`// ══ VOCAB VIEW ══`)
- Vocab CRUD: `getVocab(lang)` / `setVocab(lang, arr)` — always read-modify-write the full array
- Settings save: `saveSettings()` reads all `#cfg-*` inputs into `cfg`, then `localStorage.setItem('lt-cfg', JSON.stringify(cfg))`
- Overlays (modals): `.overlay.open` shows the sheet; close by removing `.open`
- The `esc(str)` helper HTML-escapes strings before injecting into `innerHTML`

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

PWA language tutor split into four source files — no build tool, no npm, no bundler. Deployed to GitHub Pages at `honzabfu.github.io/jz-language-tutor`. Current version: **v1.2.0**, PWA cache key: `langtutor-v14`.

| File | Lines | Contents |
|---|---|---|
| `index.html` | ~450 | HTML structure only (views, overlays, nav) |
| `style.css` | ~240 | All CSS |
| `app.js` | ~1630 | All JavaScript logic |
| `i18n.js` | ~5 (long) | `I18N` object with `cs` and `en` locale strings |
| `sw.js` | ~56 | Service worker (cache-first, cache key in line 1) |

## Development

Open `index.html` directly in a browser — no server needed. For PWA/service-worker behaviour, serve over HTTP:

```bash
python3 -m http.server 8080
# or
npx serve .
```

No lint, no tests, no CI step — changes ship when merged to `main`.

## Architecture

### State (`app.js` ~line 86)

- `_abortCtrl` — active `AbortController`; switching views or starting a new LLM request cancels any in-flight call
- `cfg` — persisted settings object (see below)
- `langLevels` — per-language student level map
- `currentLang` / `vocabLang` — active language for chat vs. vocab tab
- `tipsLang` — active language for the tips tab
- `fcQueue`, `fcIdx`, `fcRevealed`, `fcDirection` — flashcard session state
- `chatHistory`, `quizHistory`, `quizQueue`, `quizCurrentWord` — chat/quiz session state

#### `cfg` fields

```js
{
  provider,           // 'anthropic' | 'openai' | 'gemini' | 'ollama' | 'custom'
  model,              // model id string
  apiKey,             // legacy top-level key (migrated into providerSettings on init)
  ollamaUrl,          // legacy (migrated)
  customUrl,          // legacy (migrated)
  customModel,        // legacy (migrated)
  feedbackStyle,      // 'gentle' | 'balanced' | 'strict'
  customInstructions, // string, max 500 chars
  uiLang,             // 'cs' | 'en'
  nativeLang,         // LANG_META key or '' (auto)
  lessonMode,         // bool
  fontSize,           // 'small' | 'medium' | 'large' | 'xl'
  theme,              // 'auto' | 'light' | 'dark'
  defaultView,        // 'chat' | 'vocab' | 'fc' | 'quiz' | 'tips' (default: 'fc')
  providerSettings,   // { [provider]: { apiKey, model, url? } }
}
```

### Persistence (localStorage keys)

| Key | Contents |
|---|---|
| `lt-cfg` | `cfg` object |
| `lt-levels` | `langLevels` map |
| `lt-lang` | last active language |
| `lt-vocab-<lang>` | vocabulary array for each language |
| `lt-tips-<lang>` | saved tips array for each language |

On startup `init()` reads `lt-cfg` into `cfg` via `Object.assign`, migrates legacy per-provider fields into `providerSettings`, then calls `navTo(cfg.defaultView || 'fc')`.

### Providers / LLM calls (`app.js` ~line 1350)

Entry point: `safeLLM(msgs, sys, maxTokens, signal)` dispatches to per-provider async functions:

- `callAnthropicStream` / `callAnthropic` — SSE streaming (Anthropic-native format)
- `callOpenAIStream` / `callOpenAI` — OpenAI-compatible `/chat/completions`
- `callGeminiStream` / `callGemini` — Gemini generateContent
- `callOllamaStream` / `callOllama` — Ollama (OpenAI-compatible)
- `callCustomStream` / `callCustom` — user-configured OpenAI-compatible endpoint

Model metadata (tiers, capabilities, recommended flag) lives in `MODELS_METADATA` (`app.js` line 5).

### I18N (`i18n.js`)

Two locales — `cs` and `en` — in the `I18N` object. The active translations object is `t`. Call `applyI18n()` after changing `cfg.uiLang` to re-render all static labels. Dynamic labels are always read as `t.someKey` at render time.

When adding a new translatable string: add the key to **both** locales in `i18n.js`, update `applyI18n()` in `app.js` to wire the element.

### Views

Six bottom-nav views: `#chat-view`, `#vocab-view`, `#fc-view`, `#quiz-view`, `#tips-view`, `#settings-view`. Navigation via `navTo(name)` (`app.js` line 185) which toggles `.active` on the matching `.view` and `.nav-btn` elements and runs view-specific setup (e.g. `startFlashcards`, `renderVocabList`, `populateSettingsUI`).

### SM-2 (`app.js` ~line 942)

`newSM2()` and `sm2Update(sm2, q)` implement the SM-2 algorithm. Each vocab word has a `.sm2` field `{interval, reps, ef, due}`. `due` is a Unix timestamp (ms). Cards are due when `sm2.due <= Date.now()`.

### Flashcards direction

`fcDirection` ∈ `{'normal', 'reverse'}` — defaults to `'reverse'` (Native→Foreign). In `renderFC()`, `_rev = fcDirection === 'reverse'` flips which field is `_front` / `_back`. The speak button always uses `w.word` (target language) regardless of direction.

## `app.js` section map

| Section banner | Approx. line |
|---|---|
| CONSTANTS & STATE | 1 |
| INIT | 115 |
| NAV | 182 |
| I18N | 198 |
| SETTINGS | 358 |
| VOCAB STORAGE | 590 |
| VOCAB VIEW | 598 |
| SM-2 ALGORITHM | 942 |
| FLASHCARD VIEW | 959 |
| QUIZ VIEW | 1024 |
| CHAT | 1120 |
| SAVED TIPS | 1244 |
| LLM PROVIDERS | 1350 |
| STREAMING PROVIDERS | 1423 |
| PWA INSTALL PROMPT | 1589 |

## Conventions

- **HTML** (`index.html`): views + overlays only; no inline `<style>` or `<script>`
- **Functions** grouped by view with banner comments (`// ══ VOCAB VIEW ══`) in `app.js`
- **Vocab CRUD**: `getVocab(lang)` / `setVocab(lang, arr)` — always read-modify-write the full array
- **Settings save**: `saveSettings()` reads all `#cfg-*` inputs into `cfg`, then `localStorage.setItem('lt-cfg', JSON.stringify(cfg))`
- **Provider settings**: per-provider state lives in `cfg.providerSettings[provider]`; use `_saveProviderSettings(p)` / `_loadProviderSettings(p)` before switching providers
- **Overlays (modals)**: `.overlay.open` shows the sheet; close by removing `.open`
- **XSS safety**: use `esc(str)` helper to HTML-escape strings before injecting into `innerHTML`
- **Service worker cache**: bump the version string in `sw.js` line 1 whenever cached assets change

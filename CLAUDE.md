# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

PWA language tutor split into four source files — no build tool, no npm, no bundler. Deployed to GitHub Pages at `honzabfu.github.io/jz-language-tutor`. Current version: **v1.3.0**, PWA cache key: `langtutor-v18`.

| File | Lines | Contents |
|---|---|---|
| `index.html` | ~470 | HTML structure only (views, overlays, nav) |
| `style.css` | ~240 | All CSS |
| `app.js` | ~1930 | All JavaScript logic |
| `i18n.js` | ~6 (long) | `I18N` object with `cs`, `en`, `es` locale strings |
| `sw.js` | ~56 | Service worker (cache-first, cache key in line 1) |

## Development

Open `index.html` directly in a browser — no server needed. For PWA/service-worker behaviour, serve over HTTP:

```bash
python3 -m http.server 8080
# or
npx serve .
```

No lint, no tests. Deployment is via `.github/workflows/deploy.yml`:

- **`main`** → deploys to `gh-pages` branch root → `honzabfu.github.io/jz-language-tutor/`
- **Any other branch** → deploys to `gh-pages/preview/<branch>/` → `honzabfu.github.io/jz-language-tutor/preview/<branch>/`

Preview SW cache key is patched to `langtutor-preview-<branch>` so it doesn't collide with production cache. Preview folders are deleted automatically when the PR is closed. If an open PR exists for the branch, the bot posts its preview URL as a PR comment.

> **One-time setup:** GitHub Pages must be set to deploy from the `gh-pages` branch (Settings → Pages → Source → Branch: `gh-pages` / `/(root)`). The `gh-pages` branch is created automatically on the first push to `main`.

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
  provider,              // 'anthropic' | 'openai' | 'gemini' | 'ollama' | 'custom'
  model,                 // model id string
  apiKey,                // legacy top-level key (migrated into providerSettings on init)
  ollamaUrl,             // legacy (migrated)
  customUrl,             // legacy (migrated)
  customModel,           // legacy (migrated)
  feedbackStyle,         // 'gentle' | 'balanced' | 'strict'
  customInstructions,    // string, max 500 chars
  uiLang,                // 'cs' | 'en' | 'es'  — see UI_LANGS in app.js
  nativeLang,            // LANG_META key or '' (auto)
  lessonMode,            // bool
  fontSize,              // 'small' | 'medium' | 'large' | 'xl'
  theme,                 // 'auto' | 'light' | 'dark'
  defaultView,           // 'chat' | 'vocab' | 'fc' | 'quiz' | 'tips' (default: 'fc')
  maxTokens,             // number, default 8192
  temperature,           // number 0–1 or null (provider default)
  streamingDisabled,     // bool
  fcSessionSize,         // number 5–50, default 20
  quizSessionSize,       // number 5–30, default 10
  smEasyBonus,           // number 1.0–1.5, default 1.0
  ttsRate,               // number 0.5–1.5, default 0.9
  vocabImportDuplicates, // 'skip' | 'merge' | 'overwrite'
  providerSettings,      // { [provider]: { apiKey, model, url? } }
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
| `lt-onboarded` | `'1'` once onboarding has been shown |
| `lt-backup-last-count` | total vocab count at last backup export |
| `lt-backup-dismissed` | Unix ms timestamp when backup banner was last dismissed |
| `lt-backup-reminder-on` | `'false'` if backup reminder permanently disabled |
| `lt-pwa-dismissed` | `'1'` once PWA install banner has been dismissed |

On startup `init()` reads `lt-cfg` into `cfg` via `Object.assign`, migrates legacy per-provider fields into `providerSettings`, then calls `navTo(cfg.defaultView || 'fc')`.

Keys that have not yet been written are absent from localStorage (treated as their default). The cfg editor (see below) always shows all known keys — absent ones appear as `null`.

### Providers / LLM calls (`app.js` ~line 1350)

Entry point: `safeLLM(msgs, sys, maxTokens, signal)` dispatches to per-provider async functions:

- `callAnthropicStream` / `callAnthropic` — SSE streaming (Anthropic-native format)
- `callOpenAIStream` / `callOpenAI` — OpenAI-compatible `/chat/completions`
- `callGeminiStream` / `callGemini` — Gemini generateContent
- `callOllamaStream` / `callOllama` — Ollama (OpenAI-compatible)
- `callCustomStream` / `callCustom` — user-configured OpenAI-compatible endpoint

Model metadata (tiers, capabilities, recommended flag) lives in `MODELS_METADATA` (`app.js` line 5).

### I18N (`i18n.js`)

Locales — `cs`, `en`, `es` — in the `I18N` object. The active translations object is `t`. Call `applyI18n()` after changing `cfg.uiLang` to re-render all static labels. Dynamic labels are always read as `t.someKey` at render time.

When adding a new translatable string: add the key to **all** locales in `i18n.js`, update `applyI18n()` in `app.js` to wire the element.

#### Adding a new UI language — checklist

1. **`i18n.js`** — add a new locale object (copy `en`, translate all ~150 keys). Pay attention to arrow-function keys with pluralization (`fcDoneDesc`, `fcPendingFn`, `bulkCountFn`, `alertImportDoneFn`, `confirmDeleteLearnedFn`, `confirmDeleteSelectedFn`, `sm2DaysFn`).
2. **`app.js` line 82** — add `{code:'xx', flag:'🏳️', label:'Language name'}` to `UI_LANGS`.
3. **`app.js` line 88** — extend the `uiLang` auto-detection chain: `navigator.language.startsWith('xx')?'xx':…`
4. **`app.js` `UI_LANG_NATIVE_FALLBACK`** — add `xx: 'languagename'` (key into `LANG_META`).
5. **`app.js` `UI_LANG_LOCALE`** — add `xx: 'xx-XX'` (BCP 47 locale tag for `toLocaleDateString`).

No changes needed in `applyI18n()`, `getUiLocale()`, or `getNativeLangName()` — they are locale-agnostic.

### Advanced settings / cfg editor

The **⚠ Zde jsou draci** overlay (`#advanced-settings-overlay`) exposes tuneable parameters (max tokens, temperature, streaming, session sizes, SM-2 bonus, TTS rate, import duplicates). These are saved into `cfg` and persisted in `lt-cfg`.

The **Edit config** button (`openCfgEditor()`) opens a second overlay (`#cfg-editor-overlay`) with a monospace textarea. It calls `_getAllSettings()` which collects all `lt-*` keys defined in `_SETTINGS_KEYS` plus any additional `lt-*` keys currently in localStorage (excluding `lt-vocab-*` and `lt-tips-*`), parsed as JSON where possible. Keys not yet in localStorage appear as `null`.

Saving (`saveCfgEditor()`):
- Iterates the parsed object: `null` → `localStorage.removeItem`, otherwise `localStorage.setItem`
- Keys present before editing but absent from the saved JSON are also removed
- Re-reads `lt-cfg` into `cfg` and calls `applyI18n()` + `populateSettingsUI()`

To add a new persistent non-vocabulary key: add it to `_SETTINGS_KEYS` (`app.js` near `openCfgEditor`).

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
| INIT | 120 |
| NAV | 197 |
| I18N | 214 |
| SETTINGS | 441 |
| VOCAB STORAGE | 835 |
| VOCAB VIEW | 843 |
| SM-2 ALGORITHM | 1196 |
| FLASHCARD VIEW | 1213 |
| QUIZ VIEW | 1291 |
| CHAT | 1386 |
| SAVED TIPS | 1510 |
| LLM PROVIDERS | 1616 |
| STREAMING PROVIDERS | 1696 |
| PWA INSTALL PROMPT | 1870 |

## Conventions

- **HTML** (`index.html`): views + overlays only; no inline `<style>` or `<script>`
- **Functions** grouped by view with banner comments (`// ══ VOCAB VIEW ══`) in `app.js`
- **Vocab CRUD**: `getVocab(lang)` / `setVocab(lang, arr)` — always read-modify-write the full array
- **Settings save**: `saveSettings()` reads all `#cfg-*` inputs into `cfg`, then `localStorage.setItem('lt-cfg', JSON.stringify(cfg))`
- **Provider settings**: per-provider state lives in `cfg.providerSettings[provider]`; use `_saveProviderSettings(p)` / `_loadProviderSettings(p)` before switching providers
- **Overlays (modals)**: `.overlay.open` shows the sheet; close by removing `.open`
- **XSS safety**: use `esc(str)` helper to HTML-escape strings before injecting into `innerHTML`
- **Service worker cache**: bump the version string in `sw.js` line 1 whenever cached assets change

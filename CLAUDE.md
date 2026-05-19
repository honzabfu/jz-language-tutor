# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

PWA language tutor split into ES modules — no build tool, no npm, no bundler. Deployed to GitHub Pages at `honzabfu.github.io/jz-language-tutor`. Current version: **v1.4.0**, PWA cache key: `langtutor-v19`.

| File | Lines | Contents |
|---|---|---|
| `index.html` | ~615 | HTML structure only (views, overlays, nav) — no inline event handlers |
| `style.css` | ~260 | All CSS |
| `i18n.js` | ~900 | `I18N` object with `cs`, `en`, `es` locale strings (exported) |
| `constants.js` | ~126 | MODELS_METADATA, LANG_META, UI_LANGS, UI_LANG_*, esc(), uid(), renderMarkdown() |
| `state.js` | ~69 | Shared mutable `state` object; getLangLevel(), getNativeLangName(), getUiLocale() |
| `dom.js` | ~7 | syncLangSelectors(), autoResize() — breaks circular deps |
| `llm.js` | ~178 | All LLM providers, streaming, safeLLM(), safeLLMStream(), abortPending() |
| `vocab.js` | ~359 | Vocab CRUD, newSM2(), import/export, dictionary, generate, renderVocabList() |
| `tips.js` | ~115 | Saved tips CRUD, renderTipsList(), attachFeedbackCard() |
| `updates.js` | ~243 | applyI18n(), updateModeBadge(), updateInputPlaceholder(), updateEmptyState(), updateApiKeyHint() |
| `flashcard.js` | ~112 | sm2Update(), startFlashcards(), renderFC(), revealFC(), rateFC() |
| `quiz.js` | ~112 | startQuiz(), quizAsk(), quizSend() |
| `chat.js` | ~206 | sendMessage(), appendMsg(), SSE streaming, playWord() |
| `settings.js` | ~498 | populateSettingsUI(), saveSettings(), export/import backup, cfg editor |
| `nav.js` | ~20 | navTo() |
| `app.js` | ~294 | Entry point: init(), addEventListener wiring, PWA install, SW registration |
| `sw.js` | ~70 | Service worker (network-first for JS/HTML, cache key in line 1) |

## Development

Because the app uses ES modules (`<script type="module">`), a local HTTP server is required — browsers block ES module imports over `file://` due to CORS. Serve over HTTP:

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

### State (`state.js`)

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

### Providers / LLM calls (`llm.js`)

Entry point: `safeLLM(msgs, sys, maxTokens, signal)` dispatches to per-provider async functions:

- `callAnthropicStream` / `callAnthropic` — SSE streaming (Anthropic-native format)
- `callOpenAIStream` / `callOpenAI` — OpenAI-compatible `/chat/completions`
- `callGeminiStream` / `callGemini` — Gemini generateContent
- `callOllamaStream` / `callOllama` — Ollama (OpenAI-compatible)
- `callCustomStream` / `callCustom` — user-configured OpenAI-compatible endpoint

Model metadata (tiers, capabilities, recommended flag) lives in `MODELS_METADATA` (`constants.js`).

### I18N (`i18n.js`, `updates.js`)

Locales — `cs`, `en`, `es` — in the exported `I18N` object (`i18n.js`). The active translations object is `state.t`. Call `applyI18n()` (from `updates.js`) after changing `cfg.uiLang` to re-render all static labels. Dynamic labels always read `state.t.someKey` at call time — never destructure `state.t` at module level since it gets replaced on language change.

When adding a new translatable string: add the key to **all** locales in `i18n.js`, update `applyI18n()` in `updates.js` to wire the element.

#### Adding a new UI language — checklist

1. **`i18n.js`** — add a new locale object (copy `en`, translate all ~150 keys). Pay attention to arrow-function keys with pluralization (`fcDoneDesc`, `fcPendingFn`, `bulkCountFn`, `alertImportDoneFn`, `confirmDeleteLearnedFn`, `confirmDeleteSelectedFn`, `sm2DaysFn`).
2. **`constants.js`** — add `{code:'xx', flag:'🏳️', label:'Language name'}` to `UI_LANGS`.
3. **`state.js` line 18** — extend the `uiLang` auto-detection chain: `navigator.language.startsWith('xx')?'xx':…`
4. **`constants.js` `UI_LANG_NATIVE_FALLBACK`** — add `xx: 'languagename'` (key into `LANG_META`).
5. **`constants.js` `UI_LANG_LOCALE`** — add `xx: 'xx-XX'` (BCP 47 locale tag for `toLocaleDateString`).

No changes needed in `applyI18n()`, `getUiLocale()`, or `getNativeLangName()` — they are locale-agnostic.

### Advanced settings / cfg editor

The **⚠ Zde jsou draci** overlay (`#advanced-settings-overlay`) exposes tuneable parameters (max tokens, temperature, streaming, session sizes, SM-2 bonus, TTS rate, import duplicates). These are saved into `cfg` and persisted in `lt-cfg`.

The **Edit config** button (`openCfgEditor()`) opens a second overlay (`#cfg-editor-overlay`) with a monospace textarea. It calls `_getAllSettings()` which collects all `lt-*` keys defined in `_SETTINGS_KEYS` plus any additional `lt-*` keys currently in localStorage (excluding `lt-vocab-*` and `lt-tips-*`), parsed as JSON where possible. Keys not yet in localStorage appear as `null`.

Saving (`saveCfgEditor()`):
- Iterates the parsed object: `null` → `localStorage.removeItem`, otherwise `localStorage.setItem`
- Keys present before editing but absent from the saved JSON are also removed
- Re-reads `lt-cfg` into `cfg` and calls `applyI18n()` + `populateSettingsUI()`

To add a new persistent non-vocabulary key: add it to `_SETTINGS_KEYS` (`settings.js` near `openCfgEditor`).

### Views

Six bottom-nav views: `#chat-view`, `#vocab-view`, `#fc-view`, `#quiz-view`, `#tips-view`, `#settings-view`. Navigation via `navTo(name)` (`nav.js`) which toggles `.active` on the matching `.view` and `.nav-btn` elements and runs view-specific setup (e.g. `startFlashcards`, `renderVocabList`, `populateSettingsUI`).

### SM-2 (`vocab.js`, `flashcard.js`)

`newSM2()` (`vocab.js`) and `sm2Update(sm2, q)` (`flashcard.js`) implement the SM-2 algorithm. Each vocab word has a `.sm2` field `{interval, reps, ef, due}`. `due` is a Unix timestamp (ms). Cards are due when `sm2.due <= Date.now()`.

### Flashcards direction

`fcDirection` ∈ `{'normal', 'reverse'}` — defaults to `'reverse'` (Native→Foreign). In `renderFC()`, `_rev = fcDirection === 'reverse'` flips which field is `_front` / `_back`. The speak button always uses `w.word` (target language) regardless of direction.

## Module dependency graph

```
index.html
  └── app.js (entry point — init, addEventListener wiring, PWA, SW)
        ├── i18n.js        (I18N locale data)
        ├── state.js       (shared state object)
        │     └── constants.js
        ├── updates.js     (applyI18n, updateModeBadge, …)
        │     ├── state.js
        │     ├── constants.js
        │     └── vocab.js
        ├── nav.js         (navTo)
        │     ├── state.js, vocab.js, flashcard.js
        │     ├── quiz.js, settings.js, tips.js, updates.js
        ├── settings.js    (populateSettingsUI, saveSettings, backup)
        │     ├── state.js, constants.js, i18n.js
        │     ├── updates.js, vocab.js, tips.js
        ├── vocab.js       (CRUD, SM-2 init, render, dict, generate)
        │     ├── state.js, constants.js, dom.js, llm.js
        ├── flashcard.js   (sm2Update, startFlashcards, renderFC, …)
        │     ├── state.js, constants.js, vocab.js, dom.js
        ├── quiz.js        (startQuiz, quizSend, …)
        │     ├── state.js, constants.js, llm.js, vocab.js, dom.js
        ├── chat.js        (sendMessage, appendMsg, playWord, …)
        │     ├── state.js, constants.js, llm.js, vocab.js
        │     ├── dom.js, tips.js, updates.js
        ├── tips.js        (CRUD, renderTipsList, attachFeedbackCard)
        │     ├── state.js, constants.js
        ├── llm.js         (safeLLM, safeLLMStream, all providers)
        │     └── state.js, constants.js
        └── dom.js         (syncLangSelectors, autoResize — no deps)
```

### `app.js` structure (entry point, ~294 lines)

| Section | Approx. line |
|---|---|
| Imports | 1 |
| window.* globals (navTo, revealFC, rateFC, playWord, …) | ~20 |
| populateLangSelects() | ~30 |
| init() IIFE | ~40 |
| addEventListener wiring (all views + overlays) | ~100 |
| PWA install prompt | ~240 |
| Service Worker registration | ~285 |

## Conventions

- **HTML** (`index.html`): views + overlays only; no inline `<style>`, `<script>`, or event handler attributes (`onclick`, `onchange`, etc.)
- **Event wiring**: all `addEventListener` calls live in `app.js`; element IDs must exist in `index.html` before wiring
- **Dynamic HTML onclick**: `renderFC()` and `renderVocabList()` generate HTML strings with `onclick="..."` — these call globals exposed as `window.navTo`, `window.revealFC`, `window.rateFC`, `window.playWord` in `app.js`
- **Modules**: each file is a native ES module (`export`/`import`); `app.js` loaded as `<script type="module">`
- **Shared state**: all mutable state lives in the exported `state` object (`state.js`); `const { cfg } = state` is safe at module level (object reference, never reassigned); `state.t` must be read at call time (`const t = state.t`) because it gets replaced on UI language change
- **Vocab CRUD**: `getVocab(lang)` / `setVocab(lang, arr)` (`vocab.js`) — always read-modify-write the full array
- **Settings save**: `saveSettings()` (`settings.js`) reads all `#cfg-*` inputs into `cfg`, then `localStorage.setItem('lt-cfg', JSON.stringify(cfg))`
- **Provider settings**: per-provider state lives in `cfg.providerSettings[provider]`; use `_saveProviderSettings(p)` / `_loadProviderSettings(p)` before switching providers
- **Overlays (modals)**: `.overlay.open` shows the sheet; close by removing `.open`
- **XSS safety**: use `esc(str)` (`constants.js`) to HTML-escape strings before injecting into `innerHTML`
- **Service worker cache**: bump the version string in `sw.js` line 1 whenever cached assets change; add new JS files to the `ASSETS` array

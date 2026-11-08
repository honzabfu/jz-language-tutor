# Maintenance procedures

Procedures that are needed only on a model review or when adding a UI language; moved out of `CLAUDE.md` to keep the always-loaded rules short. `tools/` is not deployed (the Pages workflow copies only `*.html *.js *.css *.json` and `icons/`).

## Model list review

Review roughly **quarterly**. The date of the last review is the comment at the top of `constants.js` — update it in step 5.

1. **Check official sources** (not aggregators): Anthropic models overview, OpenAI `developers.openai.com/api/docs/models` (+ per-model pages for Chat Completions support and reasoning effort levels), Gemini `ai.google.dev/gemini-api/docs/models` + `/pricing` + `/thinking`, `ollama.com/library`. Also look for deprecations of sampling/thinking parameters (cf. #166).
2. **Update `MODELS_METADATA`**: IDs, `costEstimate` (USD per 1M tokens), `recommended`, `minReasoning` (lowest level each model accepts; omit if the model doesn't reason without a parameter). Order matters — the first entry is the default model for new users, so keep the cheapest recommended model first. Drop models the provider no longer recommends for new projects (saved user selections stay available via `rebuildModelList`).
3. **Update texts**: `modelHint*` in all locales of `i18n.js`; README pricing example and the "more expensive alternatives" sentence (cs + en).
4. **Live test**: `node tools/live-models-test.mjs <backup.json> [provider…]` — keys are read from an app backup export, never commit it. Every call must pass (sync + stream, minimal + full reasoning); also eyeball the translations — a model that answers wrongly/incompletely should not be `recommended`.
5. Bump version + SW cache key, update the review date in the `constants.js` comment.

## Adding a new UI language — checklist

1. **`i18n.js`** — add a new locale object (copy `en`, translate all ~150 keys). Pay attention to arrow-function keys with pluralization (`fcDoneDesc`, `fcPendingFn`, `bulkCountFn`, `alertImportDoneFn`, `confirmDeleteLearnedFn`, `confirmDeleteSelectedFn`, `sm2DaysFn`).
2. **`constants.js`** — add `{code:'xx', flag:'🏳️', label:'Language name'}` to `UI_LANGS`.
3. **`state.js`** — in `defaultCfg()` extend the `uiLang` auto-detection chain: `navigator.language.startsWith('xx')?'xx':…`
4. **`constants.js` `UI_LANG_NATIVE_FALLBACK`** — add `xx: 'languagename'` (key into `LANG_META`).
5. **`constants.js` `UI_LANG_LOCALE`** — add `xx: 'xx-XX'` (BCP 47 locale tag for `toLocaleDateString`).

No changes needed in `applyI18n()`, `getUiLocale()`, or `getNativeLangName()` — they are locale-agnostic.

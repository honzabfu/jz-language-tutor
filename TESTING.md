# Testing Language Tutor

## Offline regression tests

Run from the repository root with Node.js 24. No npm installation, API keys or network access is required:

```bash
node tools/review-regressions.test.mjs
```

The suite contains five tests covering:

- Dictionary errors are rendered as text, including an HTML payload.
- Stream error events reject before and after partial text for all five providers.
- Successful streaming, refusal, truncation, callback errors and cancellation.
- Service worker activation deletes only older cache versions belonging to its own scope.
- Quiz language changes, same-language navigation, restarts, cancelled timers and stale responses.

The DOM and network are simulated in this suite. It complements browser checks; it does not verify browser rendering, CORS or live model availability.

## Browser checks

Serve the app over HTTP, for example:

```bash
python3 -m http.server 8080
```

Use a fresh browser profile with synthetic vocabulary and test credentials. Production and previews share the same origin and therefore share localStorage, including settings and API keys; their service worker cache names are isolated by scope. Export important data before testing in a normal profile.

Check the following flows:

1. First launch opens Settings. Each of the six navigation buttons opens its view.
2. Switch between Czech, English and Spanish. Check labels, theme, font size and persistence after reload.
3. Add, edit, search and delete vocabulary. Check tags and text containing HTML characters.
4. Export CSV and import it again, including commas, quotes, multiline notes and formula-like values. Check skip, merge and overwrite duplicate modes.
5. Reveal and rate flashcards, switch direction and filters, and verify that repetition progress survives reload.
6. Exercise dictionary lookup, generated-word selection, chat translation and saved feedback. A simulated HTTP error containing HTML must remain literal text.
7. Start a quiz, answer incorrectly and correctly, then change the active language from another view. Return to the quiz and verify that questions and evaluation use the new language. Also switch views or restart while a request or next-question timer is pending.
8. Export and restore a JSON backup. Check that malformed vocabulary items are filtered out and that config editor changes update the in-memory settings too.
9. Check all views at phone, tablet and desktop widths. The v1.4.12 checks used 375, 768 and 1440 px.

Use controlled API responses to cover HTTP 401/429/5xx, refusals, token limits, stream failures and late responses without depending on a live model. An interrupted chat reply should display an incomplete-response warning.

### Service worker and offline checks

Use the deployed HTTPS site for the complete offline test. The current worker bypasses its asset cache on localhost and on same-host URLs with an explicit port, so a local development server does not exercise production offline behavior.

1. Open the site online, wait for the service worker to activate and confirm that it controls the page. Add a test word and select Vocabulary as the default view.
2. Disable the network in browser developer tools and reload the page. Verify that the application, ES modules and saved word still load.
3. Restore the network before testing an update.
4. On the same origin, activate workers in two distinct scopes. Each must preserve the other's cache and any unrelated cache.
5. Seed an older cache for one scope, then activate an updated worker in that scope. Only that scope's older cache should be removed.

Cache names in v1.4.12 are `langtutor:<service-worker-scope>:v30`. Unknown legacy caches are deliberately preserved. Older clients must receive the updated worker before they stop exhibiting the original cache deletion bug (#174).

## Live AI checks

This separate test makes real, potentially billable requests:

```bash
node tools/live-models-test.mjs /path/to/private-backup.json [provider…]
```

The backup supplies provider credentials. Keep it outside the repository and never commit it or include its contents in logs. See [CLAUDE.md](CLAUDE.md#model-list-review) for the model review procedure. A passing mock test does not establish live authorization, CORS support, model availability or translation quality.

## Verification record: v1.4.12

On **2026-10-25**, after [PR #177](https://github.com/honzabfu/jz-language-tutor/pull/177) was merged as `2a5021ceb688b56fbeecb7db5530d9861d978587`:

| Check | Result | Environment |
|---|---|---|
| Repository regression suite | 5/5 passed | Node.js 24.19.0 |
| Additional provider protocol scenarios | 29/29 passed | Controlled responses for Anthropic, OpenAI, Gemini, Ollama and custom |
| Production browser scenarios | 19/19 passed | Chromium 154, fresh profile, actual deployed assets |
| Unhandled page exceptions | 0 | Chromium production run |
| Production deployment | Successful | GitHub Actions and GitHub Pages |

The additional provider scenarios included streaming and non-streaming responses, split Unicode, a final line without a newline, streaming disabled, truncation, supported refusals, and HTTP 401/429/503. The production scenarios included all major flows listed above, responsive layout, scope isolation, same-scope cache cleanup and a full offline reload.

The additional protocol and Chromium runs were one-off checks; only the five-test regression suite is included in the repository. Their counts are a dated verification record, not an automatically maintained CI result.

Live AI calls were **not tested** because no test credentials were configured. Firefox, Safari, installation on a physical mobile device and audible speech output were not verified.

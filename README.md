# # jz-language-tutor

Standalone single-file language learning app with AI tutor, flashcards (SM-2), quiz mode, and vocabulary management.

## Features

- **Multi-provider LLM** — Anthropic (Claude), OpenAI (GPT), Google (Gemini), Ollama (local)
- **Vocabulary management** — manual entry, CSV/TXT import, per-language sets
- **Flashcards** — SM-2 spaced repetition algorithm
- **Quiz mode** — LLM tests your vocabulary interactively
- **Chat tutor** — real-time grammar feedback, translation on demand
- **Lesson mode** — tutor actively uses your vocabulary in conversation
- **CS/EN UI** — switchable interface language
- **PWA-ready** — add to iOS/Android home screen
- **Zero backend** — single HTML file, all data in localStorage

## Usage

1. Open `index.html` in any modern browser (or deploy to Cloudflare Pages / GitHub Pages)
1. Go to **Settings** → enter your API key for your chosen provider
1. Start chatting, add vocabulary, practice with flashcards

## Providers

|Provider     |API key source              |Notes                                                      |
|-------------|----------------------------|-----------------------------------------------------------|
|Anthropic    |console.anthropic.com       |Requires `anthropic-dangerous-direct-browser-calls` enabled|
|OpenAI       |platform.openai.com/api-keys|Standard bearer token                                      |
|Google Gemini|aistudio.google.com         |Free tier available                                        |
|Ollama       |—                           |Local, no key needed; configure URL in Settings            |

## Backup & restore

Settings → **Export zálohy** — exports a single JSON containing config, all vocabulary (all languages), and SM-2 progress data. Import via **Import zálohy**.

## CSV import format

```
word,translation,optional notes
hola,ahoj,informal greeting
gracias,děkuji
```

Tab-separated also supported. Duplicates are skipped automatically.

## PWA (optional)

To install as a PWA, add these two files alongside `index.html`:

- `manifest.json` (provided in repo)
- `sw.js` (provided in repo)

## Odhadovaná spotřeba tokenů

LLM se volá pouze v **Chatu** a **Kvízu**. Flashcards a správa slovíčk jsou plně lokální (žádné API volání).

### Chat — jedno odeslání zprávy

| Komponenta | Tokeny (vstup) |
|---|---|
| Systémový prompt | ~100 |
| Vocabulary v lesson módu (max 50 slov) | +250–350 |
| Historie konverzace (max 24 zpráv) | 0–1 200 |
| Zpráva uživatele | 10–80 |
| **Odpověď (výstup, max 1 024)** | **150–800** |

Na začátku konverzace: **~300–500 tokenů celkem**.  
Po 10+ zprávách s lesson módem: **~1 500–2 500 tokenů celkem**.

### Quiz — jedno kolo (otázka + vyhodnocení)

| Volání | Vstup | Výstup |
|---|---|---|
| Generování otázky | ~150 | ~80 |
| Vyhodnocení + další otázka | ~200 | ~200 |
| **Celkem** | **~630 tokenů** | |

### Orientační ceny

Příklad pro **claude-sonnet-4-6** ($3/M vstupních, $15/M výstupních tokenů):

| Scénář | Tokeny | Cena |
|---|---|---|
| 1 chatová zpráva | ~700 in + ~350 out | ~$0.007 |
| Hodina aktivního chatu (~50 zpráv) | ~35 000 in + ~17 500 out | ~$0.37 |
| Quiz session (10 kol) | ~3 500 celkem | ~$0.04 |

Gemini 1.5 Flash a GPT-4o-mini jsou výrazně levnější alternativy. Ollama (lokální) je bez poplatků.

> **Tip:** Lesson mód přidává celý seznam slovíček do každého requestu — při velké slovní zásobě (50 slov) zdražuje chat přibližně o 30–40 %.

## Roadmap

- [ ] PWA manifest + service worker
- [ ] Progress statistics (vocabulary growth, accuracy over time)
- [ ] Learning goals with progress bar
- [ ] Tag-based flashcard filtering
- [ ] Dark mode

## License

MIT
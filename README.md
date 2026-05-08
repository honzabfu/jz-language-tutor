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

## Roadmap

- [ ] PWA manifest + service worker
- [ ] Progress statistics (vocabulary growth, accuracy over time)
- [ ] Learning goals with progress bar
- [ ] Tag-based flashcard filtering
- [ ] Dark mode

## License

MIT
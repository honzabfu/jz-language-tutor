# jz-language-tutor

**Česky** | [English below](#english)

---

## Česky

Samostatná jednostránková aplikace pro učení jazyků s AI tutorem, flashcards (SM-2 algoritmus), kvízovým režimem a správou slovní zásoby.

### Hlavní funkce: opakování slovíček

Hlavním smyslem aplikace je **procvičování slovíček, která si sám zadáš**. Funguje to takto:

1. Do aplikace přidáš slovíčka, která se chceš naučit (ručně nebo importem).
2. Aplikace si pamatuje, jak dobře každé slovíčko znáš, a automaticky tě zkouší přesně tehdy, kdy hrozí, že ho zapomeneš — díky algoritmu SM-2 (spaced repetition).
3. Tvá slovíčka jsou také k dispozici v AI tutorovi — v **Lesson módu** je tutor přirozeně zapracovává do konverzace a v **Kvízu** tě z nich přímo zkouší.

### Funkce

- **Flashcards** — SM-2 spaced repetition: karty se ti zobrazují přesně ve chvíli, kdy je potřeba je zopakovat
- **Quiz mód** — AI tě zkouší ze tvých slovíček interaktivně (otázka → odpověď → zpětná vazba)
- **Chat tutor** — konverzace v cílovém jazyce, zpětná vazba ke gramatice, překlady na požádání
- **Lesson mód** — tutor aktivně zapracovává tvá slovíčka do rozhovoru
- **Správa slovní zásoby** — ruční zadávání, import z CSV/TXT, sady per jazyk
- **Více AI poskytovatelů** — Anthropic (Claude), OpenAI (GPT), Google (Gemini), Ollama (lokálně)
- **CS/EN rozhraní** — přepínatelný jazyk aplikace
- **PWA** — lze přidat na domovskou obrazovku iOS/Android
- **Bez backendu** — jediný HTML soubor, vše uloženo v localStorage

### Jak začít

1. Otevři aplikaci na **[honzabfu.github.io/jz-language-tutor](https://honzabfu.github.io/jz-language-tutor/)** — nebo stáhni `index.html` a otevři lokálně v prohlížeči.
2. Získej API klíč:
   - **Google Gemini** — [aistudio.google.com](https://aistudio.google.com) (zdarma)
   - **Anthropic Claude** — [console.anthropic.com](https://console.anthropic.com)
   - **OpenAI** — [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Ollama** — lokální provoz bez klíče, zdarma
3. Přejdi do **Nastavení** → vyber poskytovatele a zadej API klíč.
4. Přejdi do záložky **Slovíčka** → přidej první slovíčka.
5. Procvičuj na záložce **Flashcards** nebo **Quiz**.

### Přidání slovíček

#### Ruční zadání

Na záložce **Slovíčka** klikni na **+** → zadej slovo, překlad a volitelně poznámku.

#### Import ze souboru

Na záložce **Slovíčka** klikni na **⬆ Import** → vlož obsah souboru nebo ho nahraj.

**Formát CSV/TXT** (každý řádek = jedno slovíčko):

```
slovo,překlad,poznámka (volitelná)
hola,ahoj,neformální pozdrav
gracias,děkuji
buenos días,dobré ráno
```

- Oddělovač: čárka nebo tabulátor
- Třetí sloupec (poznámka) je nepovinný
- Prázdné řádky a duplicity jsou automaticky přeskočeny

### Jak vygenerovat importní soubor slovíček pomocí AI

Nejrychlejší způsob, jak získat velké množství slovíček najednou, je nechat je vygenerovat AI. Použij tento prompt (například v Claude.ai, ChatGPT nebo Gemini):

---

**Příklad promptu:**

> Vytvoř seznam 30 nejčastějších španělských sloves pro začátečníky.  
> Formát: každý řádek = `španělské slovo,český překlad,příklad použití`  
> Bez záhlaví, bez číslování, pouze data.

---

Výsledek zkopíruj a vlož do pole **Import** v aplikaci. Pokud chceš slovíčka z konkrétního tématu (jídlo, cestování, práce…), upřesni to v promptu.

**Další příklady promptů:**

```
Vytvoř 20 slovíček na téma "v restauraci" (němčina → čeština).
Formát: německé slovo,překlad do češtiny
```

```
Vypiš 50 nejčastějších anglických přídavných jmen.
Formát: anglické slovo,český překlad,příklad věty
```

### Záloha a obnova

**Nastavení → Export zálohy** — exportuje jeden JSON soubor se vším: nastavením, všemi slovíčky (všechny jazyky) a SM-2 daty.

Obnova: **Nastavení → Import zálohy** → nahraj JSON soubor.

### Formát CSV pro import

```
slovo,překlad,poznámka(volitelné)
hola,ahoj,neformální pozdrav
gracias,děkuji
```

Podporován je i formát s tabulátorem jako oddělovačem. Duplicity jsou přeskočeny automaticky.

### Poskytovatelé AI

| Poskytovatel  | Zdroj API klíče             | Poznámky                                                      |
|---------------|-----------------------------|---------------------------------------------------------------|
| Anthropic     | console.anthropic.com       | Vyžaduje povolení `anthropic-dangerous-direct-browser-calls`  |
| OpenAI        | platform.openai.com/api-keys| Standardní bearer token                                       |
| Google Gemini | aistudio.google.com         | K dispozici bezplatný tier                                    |
| Ollama        | —                           | Lokální, bez klíče; URL nastav v Nastavení                    |

### PWA (volitelné)

Pro instalaci jako PWA přidej k `index.html` tyto dva soubory:

- `manifest.json` (přiložen v repozitáři)
- `sw.js` (přiložen v repozitáři)

### Odhadovaná spotřeba tokenů

LLM se volá pouze v **Chatu** a **Kvízu**. Flashcards a správa slovíček jsou plně lokální — žádná API volání.

#### Chat — jedno odeslání zprávy

| Komponenta                               | Tokeny (vstup) |
|------------------------------------------|----------------|
| Systémový prompt                         | ~100           |
| Slovíčka v lesson módu (max 50 slov)     | +250–350       |
| Historie konverzace (max 24 zpráv)       | 0–1 200        |
| Zpráva uživatele                         | 10–80          |
| **Odpověď (výstup, max 1 024)**          | **150–800**    |

Na začátku konverzace: **~300–500 tokenů celkem**.  
Po 10+ zprávách s lesson módem: **~1 500–2 500 tokenů celkem**.

#### Quiz — jedno kolo (otázka + vyhodnocení)

| Volání                     | Vstup | Výstup |
|----------------------------|-------|--------|
| Generování otázky          | ~150  | ~80    |
| Vyhodnocení + další otázka | ~200  | ~200   |
| **Celkem**                 | **~630 tokenů** |   |

#### Orientační ceny

Příklad pro **claude-sonnet-4-6** ($3/M vstupních, $15/M výstupních tokenů):

| Scénář                          | Tokeny                    | Cena    |
|---------------------------------|---------------------------|---------|
| 1 chatová zpráva                | ~700 in + ~350 out        | ~$0.007 |
| Hodina aktivního chatu (~50 zpráv) | ~35 000 in + ~17 500 out | ~$0.37  |
| Quiz session (10 kol)           | ~3 500 celkem             | ~$0.04  |

Gemini 1.5 Flash a GPT-4o-mini jsou výrazně levnější alternativy. Ollama (lokální) je bez poplatků.

> **Tip:** Lesson mód přidává celý seznam slovíček do každého requestu — při velké slovní zásobě (50 slov) zdražuje chat přibližně o 30–40 %.

### Roadmap

- [ ] Statistiky pokroku (růst slovní zásoby, přesnost v čase)
- [ ] Učební cíle s progress barem
- [ ] Filtrování flashcards podle tagů
- [ ] Tmavý režim

---

## English

<a name="english"></a>

A standalone single-file language learning app with an AI tutor, flashcards (SM-2 algorithm), quiz mode, and vocabulary management.

### Core feature: vocabulary repetition

The primary purpose of this app is **practicing the vocabulary words you enter yourself**. Here's how it works:

1. Add the words you want to learn (manually or by importing a file).
2. The app tracks how well you know each word and quizzes you at exactly the right moment before you forget — using the SM-2 spaced repetition algorithm.
3. Your vocabulary is also available to the AI tutor: in **Lesson mode** the tutor naturally incorporates your words into conversation, and in **Quiz mode** it tests you on them directly.

### Features

- **Flashcards** — SM-2 spaced repetition: cards surface at precisely the right time
- **Quiz mode** — AI tests your vocabulary interactively (question → answer → feedback)
- **Chat tutor** — conversation in the target language, grammar feedback, translations on demand
- **Lesson mode** — tutor actively weaves your vocabulary into the dialogue
- **Vocabulary management** — manual entry, CSV/TXT import, per-language sets
- **Multi-provider LLM** — Anthropic (Claude), OpenAI (GPT), Google (Gemini), Ollama (local)
- **CS/EN UI** — switchable interface language
- **PWA-ready** — add to iOS/Android home screen
- **Zero backend** — single HTML file, all data in localStorage

### Getting started

1. Open the app at **[honzabfu.github.io/jz-language-tutor](https://honzabfu.github.io/jz-language-tutor/)** — or download `index.html` and open it locally in any browser.
2. Get an API key:
   - **Google Gemini** — [aistudio.google.com](https://aistudio.google.com) (free tier)
   - **Anthropic Claude** — [console.anthropic.com](https://console.anthropic.com)
   - **OpenAI** — [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Ollama** — runs locally, no key needed, free
3. Go to **Settings** → select your provider and enter the API key.
4. Go to the **Vocab** tab → add your first words.
5. Practice in the **Flashcards** or **Quiz** tab.

### Adding vocabulary

#### Manual entry

In the **Vocab** tab click **+** → enter the word, its translation, and an optional note.

#### Import from file

In the **Vocab** tab click **⬆ Import** → paste the file contents or upload a file.

**CSV/TXT format** (one word per line):

```
word,translation,note (optional)
hola,hello,informal greeting
gracias,thank you
buenos días,good morning
```

- Separator: comma or tab
- Third column (note) is optional
- Empty lines and duplicates are skipped automatically

### How to generate a vocabulary import file using AI

The fastest way to get a large set of words at once is to have an AI generate them. Use a prompt like the following (in Claude.ai, ChatGPT, Gemini, etc.):

---

**Example prompt:**

> Create a list of the 30 most common Spanish verbs for beginners.  
> Format: one entry per line as `Spanish word,English translation,usage example`  
> No header row, no numbering, data only.

---

Copy the result and paste it into the **Import** field in the app. If you want words from a specific topic (food, travel, work…), add that to the prompt.

**More example prompts:**

```
List 20 vocabulary words on the topic "at a restaurant" (German → English).
Format: German word,English translation
```

```
List the 50 most common English adjectives.
Format: word,translation,example sentence
```

### Backup & restore

**Settings → Export backup** — exports a single JSON file containing everything: config, all vocabulary (all languages), and SM-2 progress data.

Restore: **Settings → Import backup** → load the JSON file.

### CSV import format

```
word,translation,optional notes
hola,hello,informal greeting
gracias,thank you
```

Tab-separated is also supported. Duplicates are skipped automatically.

### Providers

| Provider      | API key source               | Notes                                                         |
|---------------|------------------------------|---------------------------------------------------------------|
| Anthropic     | console.anthropic.com        | Requires `anthropic-dangerous-direct-browser-calls` enabled   |
| OpenAI        | platform.openai.com/api-keys | Standard bearer token                                         |
| Google Gemini | aistudio.google.com          | Free tier available                                           |
| Ollama        | —                            | Local, no key needed; configure URL in Settings               |

### PWA (optional)

To install as a PWA, add these two files alongside `index.html`:

- `manifest.json` (provided in repo)
- `sw.js` (provided in repo)

### Estimated token usage

The LLM is only called in **Chat** and **Quiz**. Flashcards and vocabulary management are fully local — no API calls.

#### Chat — one message sent

| Component                               | Tokens (input) |
|-----------------------------------------|----------------|
| System prompt                           | ~100           |
| Vocabulary in lesson mode (max 50 words)| +250–350       |
| Conversation history (max 24 messages)  | 0–1 200        |
| User message                            | 10–80          |
| **Response (output, max 1 024)**        | **150–800**    |

At conversation start: **~300–500 tokens total**.  
After 10+ messages with lesson mode: **~1 500–2 500 tokens total**.

#### Quiz — one round (question + evaluation)

| Call                        | Input | Output |
|-----------------------------|-------|--------|
| Question generation         | ~150  | ~80    |
| Evaluation + next question  | ~200  | ~200   |
| **Total**                   | **~630 tokens** |   |

#### Indicative pricing

Example for **claude-sonnet-4-6** ($3/M input, $15/M output tokens):

| Scenario                          | Tokens                    | Cost    |
|-----------------------------------|---------------------------|---------|
| 1 chat message                    | ~700 in + ~350 out        | ~$0.007 |
| 1 hour of active chat (~50 msgs)  | ~35 000 in + ~17 500 out  | ~$0.37  |
| Quiz session (10 rounds)          | ~3 500 total              | ~$0.04  |

Gemini 1.5 Flash and GPT-4o-mini are significantly cheaper alternatives. Ollama (local) is free.

> **Tip:** Lesson mode adds your entire vocabulary list to every request — with a large vocabulary (50 words) this increases chat cost by roughly 30–40 %.

### Roadmap

- [ ] Progress statistics (vocabulary growth, accuracy over time)
- [ ] Learning goals with progress bar
- [ ] Tag-based flashcard filtering
- [ ] Dark mode

---

## License

MIT

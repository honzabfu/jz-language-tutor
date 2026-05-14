# jz-language-tutor

**Česky** | [English below](#english)

---

## Česky

Webová/mobilní aplikace pro podporu výuky jazyků s AI tutorem, flashcards (SM-2 algoritmus), kvízovým režimem a správou slovní zásoby.

| | | |
|---|---|---|
| ![Chat](screenshots/cs-chat.png) | ![Slovíčka](screenshots/cs-vocab.png) | ![Generování slovíček](screenshots/cs-generate.png) |
| ![Flashcards](screenshots/cs-flashcards.png) | ![Quiz](screenshots/cs-quiz.png) | ![Nastavení](screenshots/cs-settings.png) |


### Proč tuto aplikaci?

**Oproti jazykovým aplikacím**

Hotové aplikace tě učí svůj slovník — ne tvůj. Pokud se potřebuješ naučit slova ze svého oboru, ze seriálu nebo z knížky, tam tě nepustí. Tato aplikace procvičuje *tvá* slovíčka — nic navíc, nic méně.

**Oproti přímému používání AI chatbotu**

AI chatboty jsou skvělé tutory, ale nemají paměť: příště o tvých slovíčkách nevědí nic a spaced repetition nepodporují. Tato aplikace propojuje *tvůj seznam slovíček* s AI tutorem a SM-2 algoritmem — tutor v Lesson módu aktivně procvičuje přesně ta slova, která ti hrozí zapomenout.

**Cena a soukromí**

Žádný backend, žádný účet, vše lokálně v prohlížeči. Google Gemini je zcela zdarma (15 requestů/min, 1 500/den) — pro běžné procvičování bez jakékoliv platby.

### Hlavní funkce: opakování slovíček

Hlavním smyslem aplikace je **procvičování slovíček, která si sám zadáš**. Funguje to takto:

1. Do aplikace přidáš slovíčka, která se chceš naučit (ručně nebo importem).
2. Aplikace si pamatuje, jak dobře každé slovíčko znáš, a automaticky tě zkouší přesně tehdy, kdy hrozí, že ho zapomeneš — díky algoritmu SM-2 (spaced repetition).
3. Tvá slovíčka jsou také k dispozici v AI tutorovi — v **Lesson módu** je tutor přirozeně zapracovává do konverzace a v **Kvízu** tě z nich přímo zkouší.

### Funkce

- **Flashcards** — SM-2 spaced repetition: karty se ti zobrazují přesně ve chvíli, kdy je potřeba je zopakovat; přepínač směru (Cizí→Mateřský / Mateřský→Cizí)
- **Předčítání slov** — 🔊 poslouchej správnou výslovnost přímo v seznamu slovíček, na flashcardech i v modálním okně; používá webový prohlížečový API bez nutnosti klíče
- **Quiz mód** — AI tě zkouší ze tvých slovíček interaktivně (otázka → odpověď → zpětná vazba)
- **Chat tutor** — konverzace v cílovém jazyce, zpětná vazba ke gramatice, překlady na požádání
- **Lesson mód** — tutor aktivně zapracovává tvá slovíčka do rozhovoru
- **Slovník** — překryvný panel ve správě slovíček; zadáš slovo a LLM vrátí stručný slovníkový záznam (překlady s gramatickými kategoriemi + příklady použití); jedním kliknutím přidáš slovo do svého seznamu
- **Správa slovní zásoby** — ruční zadávání, import z CSV/TXT, generování slovíček přes AI, sady per jazyk
- **Více AI poskytovatelů** — Anthropic (Claude), OpenAI (GPT), Google (Gemini), Ollama (lokálně), vlastní OpenAI-compatible endpoint
- **CS/EN rozhraní** — přepínatelný jazyk celého rozhraní včetně nastavení
- **PWA** — lze přidat na domovskou obrazovku iOS/Android
- **Bez backendu** — žádný server, žádný build, vše uloženo v localStorage

### Jak začít

1. Otevři aplikaci na **[honzabfu.github.io/jz-language-tutor](https://honzabfu.github.io/jz-language-tutor/)** — nebo stáhni celý repozitář a otevři `index.html` lokálně v prohlížeči.
2. Získej API klíč (pro Chat a Quiz; Flashcards a správu slovíček klíč nepotřebuješ):
   - **Google Gemini** — [aistudio.google.com](https://aistudio.google.com) — zdarma s limitem (15 requestů/min, 1 500/den)
   - **Anthropic Claude** — [console.anthropic.com](https://console.anthropic.com)
   - **OpenAI** — [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Ollama** — lokální provoz bez klíče, zcela zdarma
   - **Vlastní provider** — libovolný OpenAI-compatible endpoint (viz níže)
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
- **Pořadí sloupců**: v importním modalu lze přepnout na `Překlad, Cizí jazyk` — hodí se, pokud máš soubory v opačném pořadí sloupců

#### Vyhledání v integrovaném slovníku

Na záložce **Slovíčka** klikni na **📖 Slovník** → zadej slovo (Enter nebo tlačítko Hledat). LLM vrátí stručný slovníkový záznam, například:

```
odvaha:
coraje m, valor m, valentía f
dodat odvahy komu = animar, alentar a algn
```

Tlačítkem **+ Přidat do slovíček** předvyplníš formulář (slovo, překlad, poznámka) a slovíčko jedním krokem uložíš do svého seznamu. Funkce vyžaduje nakonfigurovaný API klíč nebo Ollama.

#### Generování slovíček přímo v aplikaci

Na záložce **Slovíčka** klikni na **✨ Generovat**:

1. Zadej **téma** (např. „cestování", „jídlo", „pracovní slovní zásoba").
2. Vyber **počet slov** (5 / 10 / 20 / 50) a **úroveň** (A1–A2, B1–B2, C1–C2).
3. Klikni na tlačítko:

| Situace | Chování |
|---------|---------|
| API klíč je nastaven | Nakonfigurovaný LLM vygeneruje slovíčka; zobrazí se náhled se zaškrtávacími políčky — vyber, která chceš importovat, a potvrď. |
| Bez API klíče | Aplikace zkopíruje připravený prompt do schránky. Vlož ho do externího AI nástroje (ChatGPT, Claude.ai…), výsledné CSV pak importuj tlačítkem **⬆ Import**. |

### Generování slovíček přes externí AI nástroj

Pokud API klíč nemáš, nebo chceš větší kontrolu nad promptem, použij libovolný AI nástroj (Claude.ai, ChatGPT, Gemini…):

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

### Kolik slovíček přidávat?

Flashcards a správa slovní zásoby jsou zcela zdarma — žádná AI volání. Při používání **Chat** a **Quiz** módů ale platí:

> **Upozornění:** V Lesson módu se celý seznam slovíček odesílá s každou zprávou. Čím více slovíček, tím vyšší spotřeba tokenů a cena. Doporučujeme mít aktivně procvičovaných **20–50 slovíček** a zbytek archivovat exportem.

### Ukládání dat a více zařízení

Veškerá data (slovíčka, nastavení, SM-2 progress) jsou uložena **výhradně v lokálním úložišti prohlížeče** (localStorage). Data se nepřenášejí mezi zařízeními ani prohlížeči automaticky.

Při používání více zařízení (telefon + počítač apod.):

1. Na původním zařízení: **Nastavení → Export zálohy** → stáhni JSON soubor.
2. Na novém zařízení: **Nastavení → Import zálohy** → nahraj stejný JSON soubor.

### Záloha a obnova

**Nastavení → Export zálohy** — exportuje jeden JSON soubor se vším: nastavením, všemi slovíčky (všechny jazyky) a SM-2 daty.

Obnova: **Nastavení → Import zálohy** → nahraj JSON soubor.

### Co funguje bez API klíče

| Funkce                    | Bez klíče              | S klíčem |
|---------------------------|------------------------|----------|
| Správa slovíčků           | ✅                     | ✅       |
| Flashcards (SM-2)         | ✅                     | ✅       |
| Předčítání (🔊)           | ✅                     | ✅       |
| Import/export zálohy      | ✅                     | ✅       |
| Generování slovíček       | ⚡ kopíruje prompt     | ✅       |
| Slovník                   | ❌                     | ✅       |
| Chat tutor                | ❌                     | ✅       |
| Quiz mód                  | ❌                     | ✅       |

> Výjimka: **Ollama** (lokální) a **vlastní provider** nevyžadují klíč — stačí URL.  
> **Předčítání** používá Web Speech API prohlížeče (bez připojení k internetu), takže funguje vždy.

### Poskytovatelé AI

| Poskytovatel  | Zdroj API klíče              | Poznámky                                                      |
|---------------|------------------------------|---------------------------------------------------------------|
| Anthropic     | console.anthropic.com        | Vyžaduje povolení `anthropic-dangerous-direct-browser-calls`; při problémech zkontroluj CORS chyby v konzoli prohlížeče (F12), ad blocker nebo firewall |
| OpenAI        | platform.openai.com/api-keys | Standardní bearer token                                       |
| Google Gemini | aistudio.google.com          | **Zdarma** s limitem (15 req/min, 1 500/den); bez kreditů     |
| Ollama        | —                            | Lokální, bez klíče; URL nastav v Nastavení                    |
| Vlastní       | závisí na provideru          | Libovolný OpenAI-compatible endpoint                          |

> **Míchání jazyků a jiné zvláštnosti chování** (např. část věty v jiném jazyce, neočekávaný styl odpovědi) jsou záležitostí zvoleného AI modelu — aplikace toto chování nemůže přímo ovlivnit. Pokud ti konkrétní model nevyhovuje, zkus jiný model nebo jiného poskytovatele.

### Vlastní / Custom provider

V Nastavení vyber **Vlastní (OpenAI-compatible)** a zadej:

- **API URL** — základní URL endpointu (bez `/chat/completions`), např.:
  - `https://openrouter.ai/api/v1` — [OpenRouter](https://openrouter.ai) (přístup k desítkám modelů)
  - `https://api.groq.com/openai/v1` — [Groq](https://groq.com) (velmi rychlé inference, free tier)
  - `http://localhost:1234/v1` — [LM Studio](https://lmstudio.ai) (lokální GUI pro modely)
  - Jakýkoliv jiný OpenAI-compatible server
- **Model** — název modelu přesně tak, jak ho endpoint očekává (např. `meta-llama/llama-3.3-70b-instruct`)
- **API klíč** — pokud ho endpoint vyžaduje (volitelné)

### Odhadovaná spotřeba tokenů

LLM se volá v **Chatu**, **Kvízu** a **Slovníku**. Flashcards a správa slovíček jsou plně lokální — žádná API volání.

#### Chat — jedno odeslání zprávy

| Komponenta                               | Tokeny (vstup) |
|------------------------------------------|----------------|
| Systémový prompt                         | ~100           |
| Slovíčka v lesson módu (max 50 slov)     | +250–350       |
| Historie konverzace (max 24 zpráv)       | 0–1 200        |
| Zpráva uživatele                         | 10–80          |
| **Odpověď (výstup, max 8 192)**          | **150–800**    |

Na začátku konverzace: **~300–500 tokenů celkem**.  
Po 10+ zprávách s lesson módem: **~1 500–2 500 tokenů celkem**.

#### Quiz — jedno kolo (otázka + vyhodnocení)

| Volání                     | Vstup | Výstup |
|----------------------------|-------|--------|
| Generování otázky          | ~150  | ~80    |
| Vyhodnocení + další otázka | ~200  | ~200   |
| **Celkem**                 | **~630 tokenů** |   |

#### Slovník — jedno vyhledání

| Komponenta                               | Tokeny (vstup) |
|------------------------------------------|----------------|
| Systémový prompt                         | ~30            |
| Dotaz na slovo                           | ~80            |
| **Odpověď (výstup, max 4 096)**          | **~100–150**   |

Celkem: **~200–260 tokenů na jedno vyhledání.**

#### Orientační ceny

Příklad pro **gemini-2.5-flash** ($0,50/M vstupních, $1,50/M výstupních tokenů):

| Scénář                          | Tokeny                    | Cena     |
|---------------------------------|---------------------------|----------|
| 1 chatová zpráva                | ~700 in + ~350 out        | ~$0,001  |
| Hodina aktivního chatu (~50 zpráv) | ~35 000 in + ~17 500 out | ~$0,04   |
| Quiz session (10 kol)           | ~3 500 celkem             | ~$0,003  |
| 1 vyhledání ve slovníku         | ~110 in + ~150 out        | ~$0,0003 |

Claude Sonnet a GPT-4o jsou výrazně dražší alternativy. Ollama (lokální) je bez poplatků.

> **Tip:** Lesson mód přidává celý seznam slovíček do každého requestu — při velké slovní zásobě (50 slov) zdražuje chat přibližně o 30–40 %.

### Roadmap

- [ ] Statistiky pokroku (růst slovní zásoby, přesnost v čase)
- [ ] Učební cíle s progress barem
- [ ] Filtrování flashcards podle tagů
- [ ] Tmavý režim
- [x] Refaktoring do oddělených souborů (`style.css`, `app.js`, `i18n.js`) — bez build nástroje, jen `<link>`/`<script src>`; zlepší udržovatelnost i18n a navigaci v kódu

---

## English

<a name="english"></a>

A Web/Mobile language learning app with an AI tutor, flashcards (SM-2 algorithm), quiz mode, and vocabulary management.

| | | |
|---|---|---|
| ![Chat](screenshots/en-chat.png) | ![Vocabulary](screenshots/en-vocab.png) | ![Generate vocabulary](screenshots/en-generate.png) |
| ![Flashcards](screenshots/en-flashcards.png) | ![Quiz](screenshots/en-quiz.png) | ![Settings](screenshots/en-settings.png) |


### Why this app?

**vs. language learning apps**

Off-the-shelf apps teach you their vocabulary — not yours. If you need words from your field of work, a TV series, or a book you're reading, they can't help. This app drills *your* words — nothing more, nothing less.

**vs. using an AI chat directly**

AI chatbots are great tutors but have no memory: next session they know nothing about your vocabulary and don't support spaced repetition. This app connects *your word list* to an AI tutor and the SM-2 algorithm — in Lesson mode the tutor actively works the words you're most at risk of forgetting into the conversation.

**Cost and privacy**

No backend, no account, everything local in the browser. Google Gemini is completely free (15 req/min, 1 500/day) — enough for regular practice with no payment at all.

### Core feature: vocabulary repetition

The primary purpose of this app is **practicing the vocabulary words you enter yourself**. Here's how it works:

1. Add the words you want to learn (manually or by importing a file).
2. The app tracks how well you know each word and quizzes you at exactly the right moment before you forget — using the SM-2 spaced repetition algorithm.
3. Your vocabulary is also available to the AI tutor: in **Lesson mode** the tutor naturally incorporates your words into conversation, and in **Quiz mode** it tests you on them directly.

### Features

- **Flashcards** — SM-2 spaced repetition: cards surface at precisely the right time; direction toggle (Foreign→Native / Native→Foreign)
- **Pronunciation** — 🔊 hear correct pronunciation directly in the vocabulary list, on flashcards, and in the word modal; uses native browser web speech API with no API key needed
- **Quiz mode** — AI tests your vocabulary interactively (question → answer → feedback)
- **Chat tutor** — conversation in the target language, grammar feedback, translations on demand
- **Lesson mode** — tutor actively weaves your vocabulary into the dialogue
- **Dictionary** — overlay panel inside the Vocabulary tab; type any word and the LLM returns a concise dictionary entry (translations with grammatical categories + usage examples); add the word to your list in one click
- **Vocabulary management** — manual entry, CSV/TXT import, in-app AI generation, per-language sets
- **Multi-provider LLM** — Anthropic (Claude), OpenAI (GPT), Google (Gemini), Ollama (local), custom OpenAI-compatible endpoint
- **CS/EN UI** — switchable interface language including all settings
- **PWA-ready** — add to iOS/Android home screen
- **Zero backend** — no server, no build step, all data in localStorage

### Getting started

1. Open the app at **[honzabfu.github.io/jz-language-tutor](https://honzabfu.github.io/jz-language-tutor/)** — or download the full repository and open `index.html` locally in any browser.
2. Get an API key (required for Chat and Quiz only; Flashcards and vocabulary management work without one):
   - **Google Gemini** — [aistudio.google.com](https://aistudio.google.com) — free with limits (15 req/min, 1 500/day)
   - **Anthropic Claude** — [console.anthropic.com](https://console.anthropic.com)
   - **OpenAI** — [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Ollama** — runs locally, no key needed, completely free
   - **Custom provider** — any OpenAI-compatible endpoint (see below)
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
- **Column order**: the import modal lets you switch to `Translation, Foreign word` — useful if your CSV files have the columns in reverse order

#### Built-in dictionary lookup

In the **Vocab** tab click **📖 Dictionary** → type a word (press Enter or click Look up). The LLM returns a concise dictionary entry, for example:

```
odvaha:
coraje m, valor m, valentía f
dodat odvahy komu = animar, alentar a algn
```

Click **+ Add to vocabulary** to pre-fill the word form (word, translation, note) and save it to your list in one step. Requires a configured API key or Ollama.

#### In-app AI generation

In the **Vocab** tab click **✨ Generate**:

1. Enter a **topic** (e.g. "travel", "food", "workplace vocabulary").
2. Choose the **word count** (5 / 10 / 20 / 50) and **level** (A1–A2, B1–B2, C1–C2).
3. Click the button:

| Situation | Behaviour |
|-----------|-----------|
| API key is configured | The configured LLM generates the words; a preview with checkboxes appears — select the words you want and confirm. |
| No API key | The app copies a ready-made prompt to the clipboard. Paste it into an external AI tool (ChatGPT, Claude.ai…), then import the resulting CSV with the **⬆ Import** button. |

### Generating vocabulary via an external AI tool

If you don't have an API key, or want more control over the prompt, use any AI tool (Claude.ai, ChatGPT, Gemini…):

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

### How many words should I add?

Flashcards and vocabulary management are completely free — no AI calls. For **Chat** and **Quiz** modes:

> **Note:** In Lesson mode, your entire vocabulary list is sent with every message. More words = more tokens = higher cost. We recommend keeping **20–50 actively practiced words** and archiving the rest via export.

### Data storage and multiple devices

All data (vocabulary, settings, SM-2 progress) is stored **exclusively in the browser's local storage** (localStorage). Data is not synced between devices or browsers automatically.

When using multiple devices (phone + computer etc.):

1. On the original device: **Settings → Export backup** → download the JSON file.
2. On the new device: **Settings → Import backup** → load the same JSON file.

### Backup & restore

**Settings → Export backup** — exports a single JSON file containing everything: config, all vocabulary (all languages), and SM-2 progress data.

Restore: **Settings → Import backup** → load the JSON file.

### What works without an API key

| Feature                  | No key                 | With key |
|--------------------------|------------------------|----------|
| Vocabulary management    | ✅                     | ✅       |
| Flashcards (SM-2)        | ✅                     | ✅       |
| Pronunciation (🔊)       | ✅                     | ✅       |
| Backup import/export     | ✅                     | ✅       |
| Vocabulary generation    | ⚡ copies prompt       | ✅       |
| Dictionary               | ❌                     | ✅       |
| Chat tutor               | ❌                     | ✅       |
| Quiz mode                | ❌                     | ✅       |

> Exception: **Ollama** (local) and **custom provider** don't require a key — just a URL.  
> **Pronunciation** uses the browser's native Web Speech API (no internet required), so it always works.

### Providers

| Provider      | API key source               | Notes                                                         |
|---------------|------------------------------|---------------------------------------------------------------|
| Anthropic     | console.anthropic.com        | Requires `anthropic-dangerous-direct-browser-calls` enabled; if it fails check for CORS errors in the browser console (F12), ad blocker, or firewall |
| OpenAI        | platform.openai.com/api-keys | Standard bearer token                                         |
| Google Gemini | aistudio.google.com          | **Free** with limits (15 req/min, 1 500/day); no credits needed |
| Ollama        | —                            | Local, no key needed; configure URL in Settings               |
| Custom        | depends on provider          | Any OpenAI-compatible endpoint                                |

> **Language mixing and other unexpected behaviours** (e.g. part of a sentence in a different language, unexpected response style) are a characteristic of the selected AI model — the app cannot directly control this behaviour. If a particular model doesn't suit you, try a different model or provider.

### Custom provider

In Settings select **Custom (OpenAI-compatible)** and fill in:

- **API URL** — base URL of the endpoint (without `/chat/completions`), e.g.:
  - `https://openrouter.ai/api/v1` — [OpenRouter](https://openrouter.ai) (access to dozens of models)
  - `https://api.groq.com/openai/v1` — [Groq](https://groq.com) (very fast inference, free tier)
  - `http://localhost:1234/v1` — [LM Studio](https://lmstudio.ai) (local GUI for models)
  - Any other OpenAI-compatible server
- **Model** — model name exactly as the endpoint expects (e.g. `meta-llama/llama-3.3-70b-instruct`)
- **API key** — if required by the endpoint (optional)

### Estimated token usage

The LLM is called in **Chat**, **Quiz**, and **Dictionary**. Flashcards and vocabulary management are fully local — no API calls.

#### Chat — one message sent

| Component                               | Tokens (input) |
|-----------------------------------------|----------------|
| System prompt                           | ~100           |
| Vocabulary in lesson mode (max 50 words)| +250–350       |
| Conversation history (max 24 messages)  | 0–1 200        |
| User message                            | 10–80          |
| **Response (output, max 8 192)**        | **150–800**    |

At conversation start: **~300–500 tokens total**.  
After 10+ messages with lesson mode: **~1 500–2 500 tokens total**.

#### Quiz — one round (question + evaluation)

| Call                        | Input | Output |
|-----------------------------|-------|--------|
| Question generation         | ~150  | ~80    |
| Evaluation + next question  | ~200  | ~200   |
| **Total**                   | **~630 tokens** |   |

#### Dictionary — one lookup

| Component                               | Tokens (input) |
|-----------------------------------------|----------------|
| System prompt                           | ~30            |
| Word query                              | ~80            |
| **Response (output, max 4 096)**        | **~100–150**   |

Total: **~200–260 tokens per lookup.**

#### Indicative pricing

Example for **gemini-2.5-flash** ($0.50/M input, $1.50/M output tokens):

| Scenario                          | Tokens                    | Cost     |
|-----------------------------------|---------------------------|----------|
| 1 chat message                    | ~700 in + ~350 out        | ~$0.001  |
| 1 hour of active chat (~50 msgs)  | ~35 000 in + ~17 500 out  | ~$0.04   |
| Quiz session (10 rounds)          | ~3 500 total              | ~$0.003  |
| 1 dictionary lookup               | ~110 in + ~150 out        | ~$0.0003 |

Claude Sonnet and GPT-4o are significantly more expensive alternatives. Ollama (local) is free.

> **Tip:** Lesson mode adds your entire vocabulary list to every request — with a large vocabulary (50 words) this increases chat cost by roughly 30–40 %.

### Roadmap

- [ ] Progress statistics (vocabulary growth, accuracy over time)
- [ ] Learning goals with progress bar
- [ ] Tag-based flashcard filtering
- [ ] Dark mode
- [x] Refactor into separate files (`style.css`, `app.js`, `i18n.js`) — no build tool, just `<link>`/`<script src>`; improves i18n maintainability and code navigation

---

## License

MIT

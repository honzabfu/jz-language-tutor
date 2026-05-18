# jz-language-tutor

**Česky** | [English below](#english)

---

## Česky

Webová/mobilní aplikace pro podporu výuky jazyků s AI tutorem, flashcards (SM-2 algoritmus), kvízovým režimem a správou slovní zásoby.

| | | |
|---|---|---|
| ![Chat](screenshots/cs-chat.png) | ![Slovíčka](screenshots/cs-vocab.png) | ![Generování slovíček](screenshots/cs-generate.png) |
| ![Flashcards](screenshots/cs-flashcards.png) | ![Kvíz](screenshots/cs-quiz.png) | ![Nastavení](screenshots/cs-settings.png) |


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

- **Flashcards** — SM-2 spaced repetition: karty se ti zobrazují přesně ve chvíli, kdy je potřeba je zopakovat; přepínač směru (Cizí→Mateřský / Mateřský→Cizí); filtr karet: **Dnes** (výchozí — nová + splatná), **Vše**, **Nová** (ještě neprocvičená), **Obtížná** (nízký easiness factor)
- **Předčítání slov** — 🔊 poslouchej správnou výslovnost přímo v seznamu slovíček, na flashcardech i v modálním okně; používá webový prohlížečový API bez nutnosti klíče
- **Kvíz mód** — AI tě zkouší ze tvých slovíček interaktivně (otázka → odpověď → zpětná vazba)
- **Chat tutor** — konverzace v cílovém jazyce, zpětná vazba ke gramatice, překlady na požádání
- **Lesson mód** — tutor aktivně zapracovává tvá slovíčka do rozhovoru
- **Slovník** — překryvný panel ve správě slovíček; zadáš slovo a LLM vrátí stručný slovníkový záznam (překlady s gramatickými kategoriemi + příklady použití); jedním kliknutím přidáš slovo do svého seznamu
- **Správa slovní zásoby** — ruční zadávání, import z CSV/TXT (s podporou tagů), generování slovíček přes AI (včetně automatického přiřazení tagů), sady per jazyk; tagy se zobrazují jako chipy v seznamu a jsou prohledávatelné
- **Více AI poskytovatelů** — Anthropic (Claude), OpenAI (GPT), Google (Gemini), Ollama (lokálně), vlastní OpenAI-compatible endpoint
- **CS/EN/ES rozhraní** — přepínatelný jazyk celého rozhraní (čeština, angličtina, španělština); jazyk UI je nezávislý na mateřském jazyce
- **Mateřský jazyk** — nastavitelný samostatně bez ohledu na jazyk UI; výběr z 32 jazyků; určuje jazyk překladů ve všech AI funkcích (chat, slovník, kvíz, generování slovíček); výchozí hodnota se odvozuje z jazyka UI
- **Vlastní instrukce pro tutora** — volný text (max 500 znaků) přidaný do systémového promptu; personalizuje styl a zaměření tutora, např. „Always explain grammar rules when correcting" (doporučujeme psát anglicky)
- **Výchozí záložka** — nastavitelná v Nastavení (Chat / Slovíčka / Flashcards / Kvíz / Uložené); výchozí je Flashcards
- **PWA** — lze přidat na domovskou obrazovku iOS/Android
- **Bez backendu** — žádný server, žádný build, vše uloženo v localStorage

### Jak začít

1. Otevři aplikaci na **[honzabfu.github.io/jz-language-tutor](https://honzabfu.github.io/jz-language-tutor/)** — nebo stáhni celý repozitář a otevři `index.html` lokálně v prohlížeči.
2. Získej API klíč (pro Chat a Kvíz; Flashcards a správu slovíček klíč nepotřebuješ):
   - **Google Gemini** — [aistudio.google.com](https://aistudio.google.com) — zdarma s limitem (15 requestů/min, 1 500/den)
   - **Anthropic Claude** — [console.anthropic.com](https://console.anthropic.com)
   - **OpenAI** — [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Ollama** — lokální provoz bez klíče, zcela zdarma
   - **Vlastní provider** — libovolný OpenAI-compatible endpoint (viz níže)
3. Přejdi do **Nastavení** → vyber poskytovatele → zadej API klíč → klikni **↻ Načíst modely** → vyber model. Nastavení providera (klíč, model) se ukládá automaticky ihned po změně.
4. Přejdi do záložky **Slovíčka** → přidej první slovíčka.
5. Procvičuj na záložce **Flashcards** nebo **Kvíz**.

### Přidání slovíček

#### Ruční zadání

Na záložce **Slovíčka** klikni na **+** → zadej slovo, překlad, volitelně poznámku a tagy (čárkou oddělené, např. `pozdravy, B1`).

#### Import ze souboru

Na záložce **Slovíčka** klikni na **⬆ Import** → vlož obsah souboru nebo ho nahraj.

**Formát CSV/TXT** (každý řádek = jedno slovíčko):

```
slovo,překlad,poznámka,tagy
hola,ahoj,neformální pozdrav,pozdravy|A1
gracias,děkuji,,zdvořilost
buenos días,dobré ráno
```

- Oddělovač: čárka nebo tabulátor
- Třetí sloupec (poznámka) a čtvrtý sloupec (tagy) jsou nepovinné
- Více tagů v jednom poli odděl znakem `|` (pipe), např. `pozdravy|A1|běžná mluva`
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

Flashcards a správa slovní zásoby jsou zcela zdarma — žádná AI volání. Při používání **Chat** a **Kvíz** módů ale platí:

> **Upozornění:** V Lesson módu se celý seznam slovíček odesílá s každou zprávou. Čím více slovíček, tím vyšší spotřeba tokenů a cena. Doporučujeme mít aktivně procvičovaných **20–50 slovíček** a zbytek archivovat exportem.

### Ukládání dat a více zařízení

Veškerá data (slovíčka, nastavení, SM-2 progress) jsou uložena **výhradně v lokálním úložišti prohlížeče** (localStorage). Data se nepřenášejí mezi zařízeními ani prohlížeči automaticky.

Při používání více zařízení (telefon + počítač apod.):

1. Na původním zařízení: **Nastavení → Export zálohy** → stáhni JSON soubor.
2. Na novém zařízení: **Nastavení → Import zálohy** → nahraj stejný JSON soubor.

### Záloha a obnova

**Nastavení → Export zálohy** — exportuje jeden JSON soubor se vším: nastavením (včetně pokročilých nastavení providera), všemi slovíčky (všechny jazyky) a SM-2 daty.

Obnova: **Nastavení → Import zálohy** → nahraj JSON soubor.

**Kompatibilita záloh:**
- Záloha z nové verze → stará aplikace: neznámá pole jsou ignorována, ostatní obnoveno správně.
- Záloha ze starší verze → nová aplikace: chybějící nová pole (proxy URL, Azure endpoint) se nastaví na výchozí hodnoty (prázdné = přímé API).

**Ukázka struktury záložního souboru:**

```json
{
  "version": 2,
  "exported": "2025-05-17T10:00:00.000Z",
  "cfg": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "providerSettings": {
      "anthropic": { "apiKey": "sk-ant-…", "model": "claude-haiku-4-5", "proxyUrl": "https://my-worker.workers.dev" },
      "openai": {
        "apiKey": "sk-…", "model": "gpt-4o-mini",
        "endpointUrl": "https://myresource.openai.azure.com/openai/deployments/gpt4mini/chat/completions?api-version=2024-05-01-preview",
        "authHeader": "api-key"
      },
      "gemini": { "apiKey": "AIza…", "model": "gemini-2.5-flash", "endpointUrl": "" }
    },
    "feedbackStyle": "balanced",
    "uiLang": "cs"
  },
  "langLevels": { "spanish": "intermediate" },
  "vocab": {
    "spanish": [
      { "word": "hola", "translation": "ahoj", "sm2": { "interval": 7, "ef": 2.5, "due": 1747000000000, "reps": 3 } }
    ]
  },
  "tips": {}
}
```

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
| Kvíz mód                  | ❌                     | ✅       |

> Výjimka: **Ollama** (lokální) a **vlastní provider** nevyžadují klíč — stačí URL.  
> **Předčítání** používá Web Speech API prohlížeče (bez připojení k internetu), takže funguje vždy.

### Poskytovatelé AI

| Poskytovatel  | Zdroj API klíče              | Poznámky                                                      |
|---------------|------------------------------|---------------------------------------------------------------|
| Anthropic     | console.anthropic.com        | ⚠ Přímé volání blokováno CORS z GitHub Pages — přejdi na Gemini/OpenAI nebo nastav proxy URL (viz Pokročilá nastavení níže) |
| OpenAI        | platform.openai.com/api-keys | Standardní bearer token; Azure OpenAI přes Pokročilá nastavení |
| Google Gemini | aistudio.google.com          | **Zdarma** s limitem (15 req/min, 1 500/den); Vertex AI přes Pokročilá nastavení |
| Ollama        | —                            | Lokální; URL nastav v Nastavení; API klíč volitelný (pro `OLLAMA_API_KEY` nebo reverse proxy) |
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

### Pokročilá nastavení providera

Providery Anthropic, OpenAI a Gemini nabízejí volitelná **Pokročilá nastavení** — zaškrtávací políčko v Nastavení → LLM Poskytovatel. Výchozí stav (prázdné pole / políčko nezaškrtnuté) odpovídá přímému volání příslušného API. Pokud má provider uloženou pokročilou hodnotu, sekce se otevře automaticky.

#### Anthropic — proxy URL (řeší CORS z GitHub Pages)

Anthropic API blokuje přímé volání z GitHub Pages. Řešení: Cloudflare Worker jako proxy.

**`worker.js`** — nasazení přes [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create. Free tier: 100 000 req/den.

```js
const TARGET = 'https://api.anthropic.com/v1/messages';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }
    const response = await fetch(TARGET, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
    });
    const headers = new Headers(response.headers);
    for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
    return new Response(response.body, { status: response.status, headers });
  },
};
```

Nastavení: Provider `Anthropic` → Pokročilé → **Proxy URL**: `https://<worker>.workers.dev`

#### OpenAI — Azure OpenAI

Provider `OpenAI` → Pokročilé:
- **API URL**: `https://<resource>.openai.azure.com/openai/deployments/<deployment>/chat/completions?api-version=2024-05-01-preview`
- **Auth header**: `api-key (Azure)`
- **API klíč**: Azure API klíč (Azure AI Foundry → Deployments)

#### Gemini — Vertex AI

Provider `Google Gemini` → Pokročilé → **API URL**: základní URL Vertex AI endpointu; aplikace automaticky připojí `/models/<model>:generateContent`.

#### Azure AI Foundry — Claude modely

Azure AI Foundry umožňuje provozovat Claude modely přes Anthropic-nativní formát. Provider `Anthropic` → Pokročilé → **Proxy URL**: Azure AI Foundry endpoint → **API klíč**: Azure AI Foundry klíč.

### Odhadovaná spotřeba tokenů

LLM se volá v **Chatu**, **Kvízu**, **Slovníku** a při **Generování slovíček**. Flashcards a ruční správa slovíček jsou plně lokální — žádná API volání.

#### Chat — jedno odeslání zprávy

| Komponenta                               | Tokeny (vstup) |
|------------------------------------------|----------------|
| Systémový prompt                         | ~100–225       |
| Vlastní instrukce (pokud nastaveny)      | +0–125         |
| Slovíčka v lesson módu (max 50 slov)     | +250–350       |
| Historie konverzace (max 24 zpráv)       | 0–1 200        |
| Zpráva uživatele                         | 10–80          |
| **Odpověď (výstup, max 8 192)**          | **150–800**    |

Na začátku konverzace: **~300–500 tokenů celkem**.  
Po 10+ zprávách s lesson módem: **~1 500–2 500 tokenů celkem**.

#### Kvíz — jedno kolo (otázka + vyhodnocení)

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

#### Generování slovíček — jedno volání

| Počet slov | Vstup | Výstup (JSON) | Celkem  |
|------------|-------|---------------|---------|
| 5          | ~100  | ~200–300      | ~300–400 |
| 10         | ~100  | ~400–600      | ~500–700 |
| 20         | ~100  | ~800–1 200    | ~900–1 300 |
| 50         | ~100  | ~2 000–3 000  | ~2 100–3 100 |

Maximální výstupní budget: **8 192 tokenů** (pro ≤ 40 slov), případně `počet × 200` pro 50 slov.

> **GPT-5 modely (reasoning):** Tyto modely interně „přemýšlí" — tokeny spotřebované na reasoning se počítají do stejného budgetu jako viditelná odpověď. Proto je budget nastaven výrazně výše (8 192), aby po odečtení reasoning tokenů (~2 000–3 000) zbylo dost místa pro samotná slovíčka.

#### Orientační ceny

Příklad pro **gemini-2.5-flash** ($0,50/M vstupních, $1,50/M výstupních tokenů):

| Scénář                              | Tokeny                    | Cena      |
|-------------------------------------|---------------------------|-----------|
| 1 chatová zpráva                    | ~700 in + ~350 out        | ~$0,001   |
| Hodina aktivního chatu (~50 zpráv)  | ~35 000 in + ~17 500 out  | ~$0,04    |
| Kvíz session (10 kol)               | ~3 500 celkem             | ~$0,003   |
| 1 vyhledání ve slovníku             | ~110 in + ~150 out        | ~$0,0003  |
| Generování 10 slovíček              | ~100 in + ~500 out        | ~$0,0009  |
| Generování 50 slovíček              | ~100 in + ~2 500 out      | ~$0,004   |

Claude Sonnet a GPT-5 jsou výrazně dražší alternativy. Ollama (lokální) je bez poplatků.

> **Tip:** Lesson mód přidává celý seznam slovíček do každého requestu — při velké slovní zásobě (50 slov) zdražuje chat přibližně o 30–40 %.

### Roadmap

- [ ] Statistiky pokroku (růst slovní zásoby, přesnost v čase)
- [ ] Učební cíle s progress barem
- [x] Španělština jako třetí jazyk rozhraní (CS/EN/ES)
- [x] Pokročilá nastavení LLM — overlay „Here Be Dragons": max. tokeny, teplota, přepínač streamingu
- [x] Onboarding banner pro nové uživatele — průvodce prvním nastavením
- [x] Proxy URL / endpoint URL override pro Anthropic, OpenAI a Gemini (řeší CORS, Azure, Vertex AI)
- [x] Větší kroky velikosti písma (předchází auto-zoomu na iOS); volitelné škálování podle systémového písma
- [x] Filtrování flashcards — výběr podle SM-2 stavu: Dnes (výchozí), Vše, Nová, Obtížná
- [x] Tmavý režim — přepínač Světlý / Tmavý / Automaticky (systém) v Nastavení
- [x] Refaktoring do oddělených souborů (`style.css`, `app.js`, `i18n.js`) — bez build nástroje, jen `<link>`/`<script src>`; zlepší udržovatelnost i18n a navigaci v kódu
- [x] Tagování slovíček — zobrazení jako chipy v seznamu, prohledávatelnost, import/export CSV (4. sloupec s `|`), automatické generování tagů přes LLM
- [x] Oprava limitu tokenů při generování slovíček — zvýšený výstupní budget zabraňuje chybě „odpověď zkrácena" i u verbose modelů
- [x] Dynamické načítání modelů — tlačítko „Načíst modely" stáhne aktuální seznam přímo z API providera (Anthropic, OpenAI, Gemini, Ollama); statický seznam slouží jako fallback; Ollama načítá automaticky po přepnutí providera; volitelný API klíč pro Ollama (OLLAMA_API_KEY / reverse proxy)
- [x] Mateřský jazyk — nastavitelný nezávisle na jazyce UI; výběr z 32 jazyků; překlady ve všech AI funkcích (chat, slovník, kvíz, generování slovíček) se řídí tímto nastavením
- [x] Vlastní instrukce pro tutora — volný text (max 500 znaků) přidaný do systémového promptu; živý čítač znaků; hint pro psaní v angličtině
- [x] Výchozí záložka — nastavitelná v Nastavení; výchozí hodnota Flashcards

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

No backend, no account, everything local in the browser. Google Gemini is completely free (15 req/min, 1,500/day) — enough for regular practice with no payment at all.

### Core feature: vocabulary repetition

The primary purpose of this app is **practicing the vocabulary words you enter yourself**. Here's how it works:

1. Add the words you want to learn (manually or by importing a file).
2. The app tracks how well you know each word and quizzes you at exactly the right moment before you forget — using the SM-2 spaced repetition algorithm.
3. Your vocabulary is also available to the AI tutor: in **Lesson mode** the tutor naturally incorporates your words into conversation, and in **Quiz mode** it tests you on them directly.

### Features

- **Flashcards** — SM-2 spaced repetition: cards surface at precisely the right time; direction toggle (Foreign→Native / Native→Foreign); card filter: **Today** (default — new + due), **All**, **New** (never reviewed), **Hard** (low easiness factor)
- **Pronunciation** — 🔊 hear correct pronunciation directly in the vocabulary list, on flashcards, and in the word modal; uses the browser's native Web Speech API with no API key needed
- **Quiz mode** — AI tests your vocabulary interactively (question → answer → feedback)
- **Chat tutor** — conversation in the target language, grammar feedback, translations on demand
- **Lesson mode** — tutor actively weaves your vocabulary into the dialogue
- **Dictionary** — overlay panel inside the Vocabulary tab; type any word and the LLM returns a concise dictionary entry (translations with grammatical categories + usage examples); add the word to your list in one click
- **Vocabulary management** — manual entry, CSV/TXT import (with tag support), in-app AI generation (with automatic tag assignment), per-language sets; tags are displayed as chips in the word list and are searchable
- **Multi-provider LLM** — Anthropic (Claude), OpenAI (GPT), Google (Gemini), Ollama (local), custom OpenAI-compatible endpoint
- **CS/EN/ES UI** — switchable interface language (Czech, English, Spanish); UI language is independent of native language
- **Native language setting** — configurable independently of the UI language; choose from 32 languages; determines the translation language in all AI features (chat, dictionary, quiz, vocabulary generation); defaults to the UI language if not set
- **Custom tutor instructions** — freeform text (max 500 chars) appended to the system prompt; personalise tutor style and focus, e.g. "Always explain grammar rules when correcting" (writing in English gives best results)
- **Default tab** — configurable in Settings (Chat / Vocab / Flashcards / Quiz / Saved tips); defaults to Flashcards
- **PWA-ready** — add to iOS/Android home screen
- **Zero backend** — no server, no build step, all data in localStorage

### Getting started

1. Open the app at **[honzabfu.github.io/jz-language-tutor](https://honzabfu.github.io/jz-language-tutor/)** — or download the full repository and open `index.html` locally in any browser.
2. Get an API key (required for Chat and Quiz only; Flashcards and vocabulary management work without one):
   - **Google Gemini** — [aistudio.google.com](https://aistudio.google.com) — free with limits (15 req/min, 1,500/day)
   - **Anthropic Claude** — [console.anthropic.com](https://console.anthropic.com)
   - **OpenAI** — [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Ollama** — runs locally, no key needed, completely free
   - **Custom provider** — any OpenAI-compatible endpoint (see below)
3. Go to **Settings** → select your provider → enter your API key → click **↻ Load models** → select a model. Provider settings (key, model) save automatically as you change them.
4. Go to the **Vocab** tab → add your first words.
5. Practice in the **Flashcards** or **Quiz** tab.

### Adding vocabulary

#### Manual entry

In the **Vocab** tab click **+** → enter the word, its translation, an optional note, and optional tags (comma-separated, e.g. `greetings, A1`).

#### Import from file

In the **Vocab** tab click **⬆ Import** → paste the file contents or upload a file.

**CSV/TXT format** (one word per line):

```
word,translation,note,tags
hola,hello,informal greeting,greetings|A1
gracias,thank you,,politeness
buenos días,good morning
```

- Separator: comma or tab
- Third column (note) and fourth column (tags) are optional
- Separate multiple tags with `|` (pipe), e.g. `greetings|A1|informal`
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

**Settings → Export backup** — exports a single JSON file containing everything: config (including advanced provider settings), all vocabulary (all languages), and SM-2 progress data.

Restore: **Settings → Import backup** → load the JSON file.

**Backup compatibility:**
- New backup → old app: unknown fields are ignored; everything else restores correctly.
- Old backup → new app: missing new fields (proxy URL, Azure endpoint) default to empty (= direct API).

**Example backup structure:**

```json
{
  "version": 2,
  "exported": "2025-05-17T10:00:00.000Z",
  "cfg": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "providerSettings": {
      "anthropic": { "apiKey": "sk-ant-…", "model": "claude-haiku-4-5", "proxyUrl": "https://my-worker.workers.dev" },
      "openai": {
        "apiKey": "sk-…", "model": "gpt-4o-mini",
        "endpointUrl": "https://myresource.openai.azure.com/openai/deployments/gpt4mini/chat/completions?api-version=2024-05-01-preview",
        "authHeader": "api-key"
      },
      "gemini": { "apiKey": "AIza…", "model": "gemini-2.5-flash", "endpointUrl": "" }
    },
    "feedbackStyle": "balanced",
    "uiLang": "en"
  },
  "langLevels": { "spanish": "intermediate" },
  "vocab": {
    "spanish": [
      { "word": "hola", "translation": "hello", "sm2": { "interval": 7, "ef": 2.5, "due": 1747000000000, "reps": 3 } }
    ]
  },
  "tips": {}
}
```

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
| Anthropic     | console.anthropic.com        | ⚠ Direct calls blocked by CORS on GitHub Pages — switch to Gemini/OpenAI or set a proxy URL (see Advanced settings below) |
| OpenAI        | platform.openai.com/api-keys | Standard bearer token; Azure OpenAI available via Advanced settings |
| Google Gemini | aistudio.google.com          | **Free** with limits (15 req/min, 1,500/day); Vertex AI via Advanced settings |
| Ollama        | —                            | Local; configure URL in Settings; API key optional (for `OLLAMA_API_KEY` or reverse proxy) |
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

### Advanced provider settings

Anthropic, OpenAI, and Gemini providers offer optional **Advanced settings** — a checkbox in Settings → LLM Provider. The default state (empty / unchecked) means a direct call to the provider API. If a provider already has an advanced value saved, the section opens automatically.

#### Anthropic — proxy URL (fixes CORS on GitHub Pages)

The Anthropic API blocks direct browser calls from GitHub Pages. Solution: deploy a Cloudflare Worker as a proxy.

**`worker.js`** — deploy via [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create. Free tier: 100 000 req/day.

```js
const TARGET = 'https://api.anthropic.com/v1/messages';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }
    const response = await fetch(TARGET, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
    });
    const headers = new Headers(response.headers);
    for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
    return new Response(response.body, { status: response.status, headers });
  },
};
```

Settings: Provider `Anthropic` → Advanced → **Proxy URL**: `https://<worker>.workers.dev`

#### OpenAI — Azure OpenAI

Provider `OpenAI` → Advanced:
- **API URL**: `https://<resource>.openai.azure.com/openai/deployments/<deployment>/chat/completions?api-version=2024-05-01-preview`
- **Auth header**: `api-key (Azure)`
- **API key**: your Azure API key (find it in Azure AI Foundry → Deployments)

#### Gemini — Vertex AI

Provider `Google Gemini` → Advanced → **API URL**: Vertex AI base URL; the app automatically appends `/models/<model>:generateContent`.

#### Azure AI Foundry — Claude models

Azure AI Foundry can host Claude models using the native Anthropic API format. Provider `Anthropic` → Advanced → **Proxy URL**: your Azure AI Foundry endpoint → **API key**: your Azure AI Foundry key.

### Estimated token usage

The LLM is called in **Chat**, **Quiz**, **Dictionary**, and **Vocabulary generation**. Flashcards and manual vocabulary management are fully local — no API calls.

#### Chat — one message sent

| Component                               | Tokens (input) |
|-----------------------------------------|----------------|
| System prompt                           | ~100–225       |
| Custom instructions (if set)            | +0–125         |
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

#### Vocabulary generation — one call

| Word count | Input | Output (JSON)  | Total       |
|------------|-------|----------------|-------------|
| 5          | ~100  | ~200–300       | ~300–400    |
| 10         | ~100  | ~400–600       | ~500–700    |
| 20         | ~100  | ~800–1 200     | ~900–1 300  |
| 50         | ~100  | ~2 000–3 000   | ~2 100–3 100 |

Maximum output budget: **8 192 tokens** (for ≤ 40 words), or `count × 200` for 50 words.

> **GPT-5 models (reasoning):** These models think internally — tokens spent on reasoning count toward the same budget as the visible response. The budget is therefore set substantially higher (8 192) so that after deducting reasoning tokens (~2 000–3 000) there is still enough room for the actual vocabulary JSON.

#### Indicative pricing

Example for **gemini-2.5-flash** ($0.50/M input, $1.50/M output tokens):

| Scenario                              | Tokens                    | Cost      |
|---------------------------------------|---------------------------|-----------|
| 1 chat message                        | ~700 in + ~350 out        | ~$0.001   |
| 1 hour of active chat (~50 msgs)      | ~35 000 in + ~17 500 out  | ~$0.04    |
| Quiz session (10 rounds)              | ~3 500 total              | ~$0.003   |
| 1 dictionary lookup                   | ~110 in + ~150 out        | ~$0.0003  |
| Generate 10 words                     | ~100 in + ~500 out        | ~$0.0009  |
| Generate 50 words                     | ~100 in + ~2 500 out      | ~$0.004   |

Claude Sonnet and GPT-5 are significantly more expensive alternatives. Ollama (local) is free.

> **Tip:** Lesson mode adds your entire vocabulary list to every request — with a large vocabulary (50 words) this increases chat cost by roughly 30–40 %.

### Roadmap

- [ ] Progress statistics (vocabulary growth, accuracy over time)
- [ ] Learning goals with progress bar
- [x] Spanish as third UI language (CS/EN/ES)
- [x] Advanced LLM settings — "Here Be Dragons" overlay: max tokens, temperature, streaming toggle
- [x] First-run onboarding banner guiding new users through initial setup
- [x] Proxy URL / endpoint URL override for Anthropic, OpenAI, and Gemini (fixes CORS, enables Azure, Vertex AI)
- [x] Larger font size steps (prevents iOS auto-zoom); optional system font size scaling
- [x] Flashcard filter — SM-2 based: Today (default), All, New, Hard
- [x] Dark mode — Light / Dark / Auto (system) toggle in Settings
- [x] Refactor into separate files (`style.css`, `app.js`, `i18n.js`) — no build tool, just `<link>`/`<script src>`; improves i18n maintainability and code navigation
- [x] Word tagging — chips displayed in the word list, searchable, CSV import/export (4th column with `|`), automatic tag generation via LLM
- [x] Fix token limit in vocabulary generation — increased output budget prevents "response truncated" errors with verbose models
- [x] Dynamic model loading — "Load models" button fetches the current list directly from the provider API (Anthropic, OpenAI, Gemini, Ollama); static list used as fallback; Ollama auto-fetches on provider switch; optional API key for Ollama (OLLAMA_API_KEY / reverse proxy)
- [x] Native language setting — configurable independently of the UI language; 32 languages available; translation target in chat, dictionary, quiz and vocabulary generation follows this setting
- [x] Custom tutor instructions — freeform text (max 500 chars) appended to the system prompt; live character counter; hint to write in English for best results
- [x] Default tab — configurable in Settings; defaults to Flashcards

---

## License

MIT

# ArcadaTube – frontend för föreläsningsvideor

Examensarbete i informationsteknik vid Arcada.
**Författare:** Max Roos · **Handledare:** Dennis Biström

> *Utveckling av en modern frontend för föreläsningsvideor med fokus på användarcentrerad design, prestandaoptimering och rollbaserad funktionalitet i React.*

Det här repot innehåller både artefakten (prototypen och senare React-applikationen) och dokumentationen av hur den har tagits fram. README-filen är en löpande processbeskrivning och ska kunna användas som underlag för det skriftliga arbetet, främst kapitel 3 (Teknisk implementation) och 4 (Utvärdering).

---

## Innehåll

1. [Status](#status)
2. [Kom igång](#kom-igång)
3. [Projektstruktur](#projektstruktur)
4. [Metod och process](#metod-och-process)
5. [Fas 1 – Tre designprototyper](#fas-1--tre-designprototyper)
6. [Fas 2 – Val av design](#fas-2--val-av-design)
7. [Fas 3 – Implementation i React](#fas-3--implementation-i-react-planerad)
8. [Processlogg](#processlogg)
9. [AI-användning](#ai-användning)
10. [Referenser](#referenser)

---

## Status

| Fas | Innehåll | Status |
|---|---|---|
| 0 | Forskningsplan | ✅ Klar (27.4.2026) |
| 1 | Tre klickbara designprototyper (A, B, C) | ✅ Klar (2.10.2026) |
| 2 | Val av design | ✅ Klar (27.10.2026): handledaren valde prototyp A, **ArcadaTube**. Se [fas 2](#fas-2--val-av-design). |
| 3 | Implementation av ArcadaTube i React | ⏳ Nästa steg |
| 4 | Prestandamätning (Core Web Vitals, React Profiler) och tillgänglighetsgranskning | ⬜ Planerad |

---

## Kom igång

### Köra lokalt

Kräver PHP 8 (samma miljö som skolans server):

```bash
php -S localhost:8000 router.php
```

Öppna sedan <http://localhost:8000>. Startsidan länkar till prototypen.

> **Varför `router.php`?** PHP:s inbyggda utvecklingsserver stöder inte HTTP Range-anrop. Webbläsare behöver dem för att kunna spola i en video, och utan dem hoppar videon tillbaka till 0:00. Routern levererar videofilerna med stöd för Range (`206 Partial Content`). På en riktig webbserver (Apache/nginx) behövs den inte.

### Publicera på skolans PHP-server

Prototypen består av statiska filer (HTML, CSS och JavaScript) och har inget byggsteg:

1. Ladda upp `index.html` och mappen `prototyper/` (inklusive `prototyper/shared/media/`) till webbservern.
2. Kontrollera att `.mp4` serveras med `Content-Type: video/mp4`. Det gör Apache som standard.
3. `router.php`, `tools/` och `docs/` behöver inte laddas upp.

### Återställa demodata

All data (rollval, tittarhistorik, sparade videor och ändringar i lärarvyn) sparas i webbläsarens `localStorage`. Knappen **Återställ demodata** på startsidan (och längst ned i Studio) nollställer den.

### Generera om demovideorna

```bash
python tools/generate_demo_media.py
```

Kräver Node.js, Python 3 med Pillow samt ffmpeg. Se [Demovideor](#demovideor).

---

## Projektstruktur

```
├── index.html                  Startsida som presenterar prototypen
├── router.php                  Utvecklingsrouter (Range-stöd för video)
├── prototyper/
│   ├── shared/                 Data, spelare och hjälpfunktioner (delades av A, B och C i fas 1)
│   │   ├── mock-data.js        Kurser, lärare, föreläsningar, kapitel och transkription
│   │   ├── common.js           Datamodell, lagring, routing och hjälpfunktioner
│   │   ├── player.js           Den egenutvecklade videospelaren
│   │   ├── player.css          Spelarens grundutseende (temas via CSS-variabler)
│   │   ├── base.css            Tillgänglighet, miniatyrer och notiser
│   │   └── media/              Genererade demovideor (v1–v10, demo)
│   └── a-klassisk/             Prototyp A – ArcadaTube (vald design)
├── tools/
│   └── generate_demo_media.py  Skapar demovideorna från mock-datan
└── docs/
    └── utvarderingsplan.md     Planerade användartester för fas 2 (genomfördes inte, se fas 2)
```

Prototyp B (`b-kursrum/`) och C (`c-fokus/`) raderades 27.10.2026 efter designvalet, se [fas 2](#fas-2--val-av-design). Mappen `a-klassisk/` har behållit sitt namn så att sökvägarna i dokumentationen från fas 1 fortfarande stämmer. React-applikationen får en egen mappstruktur i fas 3.

---

## Metod och process

Arbetet följer **Design Science Research (DSR)**, där en artefakt utvecklas och utvärderas iterativt (Hevner m.fl., 2004). Processmodellen av Peffers m.fl. (2007) delar in arbetet i sex aktiviteter. Tabellen visar hur de motsvarar faserna i projektet:

| DSR-aktivitet (Peffers m.fl., 2007) | I det här projektet |
|---|---|
| 1. Identifiera problem och motivera | Forskningsplanen: Arcada saknar ett modernt gränssnitt för föreläsningsvideor som fungerar för både studenter och lärare på alla enheter. |
| 2. Definiera mål för lösningen | Forskningsplanens konkreta mål: modulär frontend, admin-dashboard, egen videospelare, responsiv design. Utvärderas genom prestanda, användbarhet och kognitiv belastning. |
| 3. Design och utveckling | **Iteration 1:** tre alternativa designprototyper (fas 1). **Iteration 2:** React-implementation av vald design (fas 3). |
| 4. Demonstration | Fas 1–2: prototyperna presenterades för handledaren. Fas 3–4: React-versionen publiceras på skolans server. |
| 5. Utvärdering | Fas 2 (val av design, gjordes som expertbedömning av handledaren i stället för de planerade användartesterna) och fas 4 (prestanda, användbarhet, tillgänglighet). |
| 6. Kommunikation | Det skriftliga examensarbetet och denna dokumentation. |

Designprocessen är **användarcentrerad (UCD)**: användarna involveras tidigt, och designen väljs utifrån empiriska data i stället för utvecklarens antaganden (Interaction Design Foundation, 2021a).

> **Avvikelse från planen (27.10.2026):** Designvalet gjordes av handledaren utan de planerade användartesterna. Användarna har därför ännu inte involverats, och designen valdes på teoretiska och praktiska grunder snarare än på empiriska data. Se [fas 2](#fas-2--val-av-design) för motivering och konsekvenser.

### Varför tre alternativ i stället för ett?

Att ta fram flera parallella designförslag och jämföra dem ger bättre slutresultat än att förfina ett enda förslag (Dow m.fl., 2010). Testpersoner har också lättare att ge konkret kritik när de har något att jämföra med (Tohidi m.fl., 2006). Därför börjar projektet med tre medvetet olika designriktningar. Var och en bygger på en egen hypotes om vad som ger bäst användbarhet och lägst kognitiv belastning.

I slutändan valdes designen genom en expertbedömning i stället för användartester (se fas 2). De tre alternativen var ändå underlaget för beslutet: handledaren valde mellan tre konkreta, klickbara förslag.

---

## Fas 1 – Tre designprototyper

**Datum:** 2.10.2026

> Prototyp B och C raderades ur repot 27.10.2026 efter designvalet (fas 2). Koden fanns inte i versionshanteringen och går därför inte att återställa. Beskrivningarna nedan finns kvar som dokumentation av designfasen.

### Syfte

Att ta fram tre klickbara högupplösta prototyper som representerar olika designfilosofier. Prototyperna ska vara tillräckligt realistiska för uppgiftsbaserade användartester på både dator och mobil, i både student- och lärarroll.

### Teknikval för prototyperna

Prototyperna är skrivna i vanlig HTML, CSS och JavaScript, **inte i React**. Det är ett medvetet val:

- **Engångsprototyper (throwaway prototyping).** Endast en av designerna ska byggas vidare. Att bygga alla tre i React skulle innebära mycket arbete på kod som kastas.
- **Inget byggsteg.** Filerna fungerar direkt på skolans PHP-server och kan ändras snabbt mellan testomgångar.
- **Fokus på design, inte teknik.** Utvärderingen i fas 2 gäller gränssnittet. Frågorna om React (forskningsfråga 1 och 2) besvaras i fas 3–4.

Koden är ändå uppdelad i återanvändbara delar (datamodell, spelare och vyer) som motsvarar den planerade komponentstrukturen i React. Det underlättar övergången.

### Kontrollerade variabler

För att jämförelsen ska mäta just designen är följande **identiskt** i alla tre prototyper:

| Gemensamt | Fil |
|---|---|
| Innehåll: 4 kurser, 10 föreläsningar, kapitel och transkription | `shared/mock-data.js` |
| Videospelarens funktioner och tangentbordsgenvägar | `shared/player.js` |
| Datamodell och beteende (spara, återuppta, utkast/publicerad, uppladdning) | `shared/common.js` |
| Demovideor (samma längd och innehåll) | `shared/media/` |

Det som **skiljer** är informationsarkitektur, navigering, layout, visuell stil och vilka stödfunktioner som lyfts fram.

### Prototyp A – Klassisk

- **Idé:** Följer den välkända modellen från stora videoplattformar: sökfält i toppen, sidomeny med kurser, rutnät av videokort, och en ”Nästa”-lista bredvid spelaren.
- **Hypotes:** Användare förväntar sig att en webbplats fungerar som de de redan känner till (*Jakob’s Law*, Yablonski, 2020). Igenkänning ger låg inlärningströskel och hög effektivitet från första besöket.
- **Studentvy:** Filtrering på kurs med chips, ”Fortsätt titta”, sparade videor, kapitellista under videon och automatisk uppspelning av nästa video.
- **Lärarvy (”Studio”):** Översiktskort med nyckeltal, en tabell över alla föreläsningar och en modal dialog för uppladdning och redigering (dra och släpp fil, kapitel som text).
- **Möjlig risk:** Formatet uppmuntrar till att ”zappa” mellan videor snarare än att följa en kurs i ordning.

### Prototyp B – Kursrum

- **Idé:** Föreläsningarna är organiserade som i en lärplattform: **kurs → vecka → föreläsning**, med framstegsindikatorer per föreläsning och kurs.
- **Hypotes:** Tydlig struktur och stöd för aktivt lärande minskar den kognitiva belastningen vid långa föreläsningar. Uppdelning i segment (*segmenting principle*, Mayer, 2009) och möjligheten att anteckna gör det lättare att ta till sig innehållet. Studier av MOOC-videor visar också att engagemanget sjunker markant för långa videor (Guo m.fl., 2014). Det talar för att tydliga kapitel är viktiga när föreläsningarna är 30–50 minuter långa.
- **Studentvy:** Kursöversikt med framsteg, moduler som går att fälla ihop, brödsmulor, föregående/nästa föreläsning. Bredvid spelaren finns en panel med tre flikar:
  - **Kapitel** med framstegsindikator per kapitel.
  - **Transkription** som följer videon, är sökbar och där man kan klicka på en rad för att hoppa dit.
  - **Anteckningar** med tidsstämpel. Videon pausas automatiskt medan man skriver.
- **Lärarvy (”Kurshantering”):** Föreläsningar grupperade per vecka, ändring av ordningen med knappar (inte dra och släpp, se WCAG 2.5.7), statistik över hur stor del av videon studenterna i genomsnitt ser, och en sidopanel med en strukturerad kapitelredigerare.
- **Möjlig risk:** Fler element på skärmen samtidigt kan i sig öka belastningen, särskilt på små skärmar.

### Prototyp C – Fokus

- **Idé:** En mobil-först app-upplevelse med mörkt tema, flikfält i nederkant (där tummen når), stora tryckytor och minimalt antal element.
- **Hypotes:** Färre samtidiga element och *progressiv visning* (information visas först när den behövs) ger lägre kognitiv belastning, särskilt på mobil. Arbetsminnet har begränsad kapacitet, och onödig *extern* belastning från gränssnittet tar kapacitet från själva lärandet (Sweller, 1988; Interaction Design Foundation, 2021b).
- **Studentvy:** Ett stort ”Fortsätt”-kort på startsidan och kapitel som en horisontell remsa med förlopp. **Fokusläget** döljer allt utom videon och kapitlen. Dubbeltryck till vänster eller höger i videon spolar ±10 s. Beskrivningen döljs bakom ”Mer om föreläsningen”. Ljust och mörkt tema finns.
- **Lärarvy (”Studio”):** Videokort med nyckeltal och en **uppladdningsguide i tre steg** (Video → Information → Publicera) med sammanfattning före publicering.
- **Möjlig risk:** På stora skärmar kan layouten upplevas som gles, och lärare som hanterar många videor kan sakna en tabellöversikt.

### Funktionsjämförelse

| Funktion | A Klassisk | B Kursrum | C Fokus |
|---|:-:|:-:|:-:|
| Sök | Toppfält | Toppfält | Egen flik, direktsök |
| Navigering | Sidomeny | Toppmeny + brödsmulor | Flikfält (nederkant/vänster) |
| Kursstruktur (vecka/modul) | Filter | ✅ Primär struktur | Filter i sök |
| Framsteg per kurs | – | ✅ | – |
| Kapitel | Lista under video | Panel med förlopp | Horisontell remsa med förlopp |
| Transkription (sökbar, följer videon) | – | ✅ | – |
| Tidsstämplade anteckningar | – | ✅ | – |
| Spara till senare | ✅ | – | ✅ |
| Fokusläge | – | – | ✅ |
| Dubbeltryck för att spola | – | – | ✅ |
| Mörkt tema | – | – | ✅ (standard) |
| Uppladdning | Dialog | Sidopanel | Guide i 3 steg |
| Kapitelredigering | Text | Strukturerad editor | Text |
| Ändra ordning på föreläsningar | – | ✅ | – |

### Den gemensamma videospelaren

Spelaren (`shared/player.js`) är egenutvecklad ovanpå HTML5-elementet `<video>` och utgör grunden för forskningsfråga 2:

- Kapitelmarkörer i tidslinjen och en förhandsvisning som visar tid och kapitelnamn när man hovrar.
- **Återupptar** där användaren slutade (sparas var 4:e sekund och vid paus).
- Textning genererad från transkriptionen (på/av med knapp eller `c`).
- Uppspelningshastighet 0,75–2× med ett tillgängligt menymönster.
- ±10 s och ±5 s, hopp till 0–90 % med sifferknapparna, helskärm och ljud.
- Kontrollerna döljs efter 2,6 s under uppspelning men visas när spelaren har tangentbordsfokus.
- Valfri gesthantering (dubbeltryck) som bara var aktiverad i prototyp C. Den är avstängd i ArcadaTube men finns kvar i koden (`opts.gestures`) som kandidat inför React-versionen.
- Tidslinjen är en ARIA-`slider` med `aria-valuetext` (t.ex. ”12:30 av 45:34, kapitel: useState”).

Utseendet styrs via CSS-variabler (`--ap-accent`, `--ap-radius` m.fl.). Därför såg spelaren olika ut i varje prototyp medan funktionerna var desamma.

### Demovideor

Föreläsningsvideorna är genererade bildspel. Varje kapitel visas som en bild med kurs, föreläsning, kapitelrubrik och stödpunkter, plus en löpande klocka. Det finns tre skäl till detta:

1. **Realistiska längder.** Videorna är 28–52 minuter långa. Det motsvarar riktiga föreläsningar och är relevant för forskningsfråga 2 (*långa videor*).
2. **Verifierbar kapitelnavigering.** Vid ett hopp till ett kapitel syns rätt kapitelrubrik i bilden. Testledaren kan alltså se att funktionen fungerar.
3. **Inga externa beroenden.** Videorna ligger på samma server, och med 1 bild/s blir alla tio videor sammanlagt cirka 15 MB.

Generatorn läser `mock-data.js`, så videorna och datan hålls synkroniserade.

### Tillgänglighet (WCAG 2.2) i prototyperna

Tillgängligheten har varit med från början i stället för att läggas till i efterhand (forskningsfråga 3). Åtgärder som är gjorda i alla tre prototyper:

| Kriterium (W3C, 2023) | Åtgärd |
|---|---|
| 1.2.2 Textning (förinspelad), nivå A | Textning från transkriptionen kan slås på och av. |
| 1.3.1 Information och relationer, A | Semantisk HTML (`header`, `nav`, `main`, `aside`, rubriknivåer, tabeller med `caption`/`scope`, `fieldset`/`legend`). |
| 2.1.1 Tangentbord, A | All funktionalitet går att nå med tangentbord, inklusive tidslinjen (piltangenter, Home/End, PageUp/PageDown). |
| 2.4.1 Hoppa över block, A | En länk med texten ”Hoppa till innehållet” finns på alla sidor. |
| 2.4.3 Fokusordning, A | Vid sidbyte flyttas fokus till sidans `h1`. Dialoger använder `<dialog>` och `showModal()`, vilket fångar fokus. |
| 2.4.7 Synligt fokus, AA | En tydlig fokusram på 3 px via `:focus-visible`. |
| 2.5.7 Dragrörelser, AA (*ny i 2.2*) | Tidslinjen fungerar med klick och tangenter. Ordningen ändras med knappar i stället för dra och släpp. Filuppladdning fungerar också med klick. |
| 2.5.8 Målstorlek (minimum), AA (*ny i 2.2*) | Alla interaktiva element (utom länkar i löptext) är minst 24×24 px enligt kravet. De flesta är 40–52 px. |
| 3.3.1 Identifiering av fel, A | Formulären visar felmeddelanden i text (`role="alert"`, `aria-invalid`). |
| 4.1.2 Namn, roll, värde, A | Ikonknappar har `aria-label`. Växlingsknappar använder `aria-pressed`. Flikar följer WAI-ARIA-mönstret för tabs. Statusmeddelanden visas via `aria-live`. |
| (2.3.3, AAA) | `prefers-reduced-motion` stänger av animationer. |

**Kända brister att åtgärda i React-versionen:**

- **2.1.4 Kortkommandon med ett tecken (A):** Spelarens genvägar (`k`, `j`, `l`, `m`, `f`, `c`) är globala enteckensgenvägar. WCAG kräver att de går att stänga av, ändra eller att de bara är aktiva när komponenten har fokus. Det här är ett konkret exempel på en konflikt mellan bekväma genvägar och tillgänglighet. Det är relevant att diskutera i arbetet.
- **1.4.3 Kontrast (AA)** är inte uppmätt systematiskt ännu. Det görs med axe/Lighthouse i fas 4.
- Ingen test med skärmläsare (NVDA/VoiceOver) är gjord ännu.

### Problem som uppstod och hur de löstes

Dokumenteras eftersom de är relevanta för kapitlet om implementation:

| Problem | Orsak | Lösning |
|---|---|---|
| Videorna gick inte att ladda (HTTP 403). | De öppna exempelvideorna från en extern tjänst var inte längre tillgängliga. | Videorna genereras lokalt med `tools/generate_demo_media.py`, vilket ger ett mindre beroende av externa tjänster. |
| Det gick inte att spola, och videon hoppade tillbaka till 0:00. | PHP:s inbyggda server stöder inte HTTP Range-anrop (svarar `200` i stället för `206`). | `router.php` levererar video med Range-stöd. Upptäcktes genom automatiska webbläsartester. |
| JavaScript-fel vid snabba sidbyten. | Videohändelser (`timeupdate`, `pause`) kom asynkront efter att vyn redan hade bytts ut. | Spelaren ignorerar alla callbacks efter `destroy()`. Samma problem uppstår i React om effekter inte städas upp, vilket blir en lärdom inför fas 3 (`useEffect` cleanup). |
| Fältet ”Titel” lästes inte från formuläret. | `form.title` pekar på formulärets eget `title`-attribut, inte på fältet med `name="title"`. | Fältet hämtas med `querySelector`. |
| Sidhuvudet bröts på mobilen. | Ett flex-element med standardvärdet `min-width: auto` krympte inte. | `min-width: 0` på sökfältet. |

### Verifiering

Prototyperna testades automatiskt i Chrome (headless, via Puppeteer) i två storlekar: desktop 1440×900 och mobil 390×844 med touch. Testet gick igenom 26 vyer och interaktioner per storlek, bland annat rollbyte, uppladdningsdialog, flikar, anteckningar, fokusläge och uppladdningsguide. Resultat:

- Inga JavaScript-fel.
- Ingen horisontell scroll på mobil.
- Återupptagning och kapitelhopp ger rätt tidpunkt i alla tre prototyper.

Safari/iOS och Firefox är **inte** testade ännu. Det ingår i kompatibilitetstesterna i forskningsplanen.

### Kända begränsningar (avsiktliga)

- Ingen backend, enligt avgränsningen i forskningsplanen. Data finns i `localStorage` per webbläsare.
- En uppladdad fil går bara att spela upp under den aktuella sessionen (objekt-URL). Efter omladdning används demovideon.
- Statistiken (visningar, ”sett i snitt”) är simulerad.
- Rollbytet är en knapp, inte en inloggning. Det räcker för att testa rollbaserade vyer.

---

## Fas 2 – Val av design

- **Datum:** 27.10.2026
- **Beslut:** Prototyp A, **ArcadaTube** (i fas 1 kallad ”Klassisk”), blir grunden för React-implementationen. Prototyp B (Kursrum) och C (Fokus) läggs ned.
- **Beslutsfattare:** Handledaren, Dennis Biström.

### Motivering

Handledarens motivering, återgiven av författaren: YouTube har en igenkännbar design, och därför finns det ingen anledning att ”uppfinna hjulet på nytt” (*reinvent the wheel*).

Motiveringen stämmer med den hypotes som prototyp A byggde på redan i fas 1, och den går att förankra i teorin:

- **Jakob’s Law.** Användare tillbringar större delen av sin tid på andra webbplatser och förväntar sig att en ny webbplats fungerar som dem de redan känner till (Yablonski, 2020). En stor del av målgruppen kan antas vara van vid YouTube.
- **Konsekvens och standarder.** En av Nielsens tio heuristiker säger att man ska följa etablerade konventioner för plattformen och branschen, så att användaren inte behöver undra om olika ord eller handlingar betyder samma sak (Nielsen, 1994).
- **Kognitiv belastning.** Ett välbekant gränssnitt bör kräva mindre av arbetsminnet än ett nytt, eftersom användaren inte behöver lära sig navigeringen från början. Mer kapacitet blir då kvar för själva föreläsningen (Sweller, 1988). Det här är ett resonemang, inte ett uppmätt resultat.
- **Konventioner som redan finns i prototypen.** Kapitlen anges som rader med tidsstämpel (”0:00 Introduktion”), på samma sätt som YouTube skapar kapitel från tidsstämplar i videobeskrivningen. Även förloppsstapeln på miniatyrer, ”Nästa”-listan och automatisk uppspelning följer YouTubes mönster.

Den risk som noterades för prototyp A i fas 1 kvarstår: formatet kan uppmuntra till att ”zappa” mellan videor i stället för att följa en kurs i ordning. Prototypen motverkar det delvis redan, eftersom ”Nästa”-listan alltid visar nästa föreläsning i samma kurs först (`upNext()` i `shared/common.js`). Frågan bör följas upp i React-versionen.

### Avvikelse från utvärderingsplanen

Användartesterna i [docs/utvarderingsplan.md](docs/utvarderingsplan.md) (6–9 studenter och 2–3 lärare som skulle testa alla tre prototyperna med SUS och Raw TLX) **genomfördes inte**. Designen valdes i stället genom en expertbedömning. Det får följande konsekvenser för arbetet:

1. **Begränsning att diskutera.** Valet bygger inte på empiriska data från användare. Hypoteserna bakom B (struktur och aktivt lärande) och C (färre element, progressiv visning) prövades aldrig. Det bör nämnas som en begränsning i diskussionskapitlet.
2. **Hur valet kan beskrivas i DSR-termer.** Inom DSR kan utvärdering ske både *ex ante*, alltså innan artefakten är byggd, och *ex post*, när den finns (Venable m.fl., 2016). Valet mellan prototyperna kan beskrivas som en formativ ex ante-utvärdering gjord av en expert. Den summativa utvärderingen görs ex post på React-versionen i fas 4.
3. **Fördel.** Den tid som var avsatt för testerna (cirka 40 minuter per deltagare plus analys) kan läggas på implementationen och på utvärderingen i fas 4.
4. **Förslag, att stämma av med handledaren:** Uppgifterna (S1–S6, L1–L4) och enkäterna (SEQ, SUS, Raw TLX) i utvärderingsplanen kan återanvändas på React-versionen i fas 4. Användarna blir då ändå involverade, och SUS-resultatet kan jämföras med det vanliga riktvärdet 68 (Bangor m.fl., 2008) i stället för med andra prototyper.

### Funktioner från B och C som kandidater

Följande funktioner fanns i B eller C men inte i A. Inget är beslutat. Listan är ett underlag för diskussion med handledaren. Kolumnen om YouTube visar vilka som passar handledarens motivering, alltså finns på YouTube redan.

| Funktion | Fanns i | Finns på YouTube? | Kommentar |
|---|:-:|---|---|
| Sökbar transkription som följer videon | B | Ja (”Visa transkription”) | Texten finns redan i mock-datan, och textningen bygger på den. |
| Dubbeltryck för att spola ±10 s | C | Ja (mobilappen) | Finns redan i spelaren men är avstängt. |
| Mörkt tema | C | Ja | |
| Ändra ordning på föreläsningar | B | Ja (spellistor) | |
| Fokusläge | C | Delvis (bioläge) | |
| Framsteg per kurs | B | Nej | A visar framsteg per video på miniatyrerna. |
| Tidsstämplade anteckningar | B | Nej | |
| Strukturerad kapitelredigerare | B | Nej | YouTube använder tidsstämplar i text, precis som A. |

### Ändringar i repot efter beslutet

- Mapparna `prototyper/b-kursrum/` och `prototyper/c-fokus/` raderades. De fanns inte i versionshanteringen, så koden kan inte återställas och det går inte heller att ta nya skärmdumpar av B och C. Beskrivningarna i fas 1 finns kvar.
- Kod i `shared/` som ArcadaTube inte använde togs bort: funktionerna för anteckningar (`notes`, `addNote`, `deleteNote`) och `greeting`. Dubbeltrycket i spelaren behölls (se tabellen ovan). Kommentarerna i koden uppdaterades.
- Startsidan (`index.html`) presenterar nu bara ArcadaTube. Knappen **Återställ demodata** rensar inte längre inställningar som bara B och C använde.
- Prototypmärket nere till höger säger ”till översikten” i stället för ”byt prototyp”.
- [docs/utvarderingsplan.md](docs/utvarderingsplan.md) markerades som ej genomförd. Den sparas som dokumentation av den ursprungliga metoden.

**Kontroll:** Startsidan och prototypens vyer (startsida, sök, videosida och Studio) laddades i Chrome (headless) via PHP-servern utan JavaScript-fel, och videofilerna levereras fortfarande med Range-stöd (`206`).

---

## Fas 3 – Implementation i React (planerad)

Preliminär plan för implementationen av ArcadaTube:

- **Verktyg:** Vite och React. Routing med React Router.
- **Från prototyp till komponenter:** `player.js` → `<VideoPlayer>` med en egen hook (`useVideoPlayer`). `common.js` → datalager med mock-API. Rollen hanteras via React Context. Prototypens vyer i `a-klassisk/app.js` motsvarar ungefär följande komponenter och routes:

  | Prototyp A (`app.js`) | React (preliminärt) | Route |
  |---|---|---|
  | Sidhuvud i `index.html` (logotyp, sök, rollväljare) | `<TopBar>`, `<SearchForm>`, `<RoleSwitch>` | – |
  | `renderSidebar()` | `<Sidebar>` | – |
  | `card()`, `rowCard()`, `AT.thumb()` | `<VideoCard>`, `<VideoRow>`, `<Thumbnail>` | – |
  | `viewHome()` | `HomePage` (kursfilter som query-parameter) | `/` |
  | `viewSearch()` | `SearchPage` | `/sok?q=` |
  | `viewList()` | `HistoryPage`, `SavedPage` | `/historik`, `/sparade` |
  | `viewWatch()` | `WatchPage` med `<VideoPlayer>`, `<ChapterList>`, `<UpNext>` | `/watch/:id` |
  | `viewStudio()`, `openDialog()` | `StudioPage`, `<VideoDialog>` (laddas med `React.lazy`) | `/studio` |
  | `AT.toast()` | `<Toaster>` | – |
- **Prestanda (forskningsfråga 1 och 2):**
  - Videons tid uppdateras ungefär fyra gånger per sekund. Tidsberoende delar (tidslinje, aktivt kapitel, transkription) isoleras så att inte hela vyn renderas om. Det görs med `memo`, separata komponenter och refs, och mäts med React Profiler.
  - Lärarvyerna laddas med `React.lazy` (*koddelning per roll*), så att studenter inte laddar ned admin-koden. Det ger effekt på LCP.
  - Miniatyrer i CSS och reserverat bildförhållande (`aspect-ratio`) ger låg CLS.
- **Mätning:** Core Web Vitals (LCP, CLS, INP) med Lighthouse och `web-vitals`, samt React Profiler.
- **Driftsättning på PHP-servern:** `npm run build` → ladda upp `dist/`. Med React Routers `BrowserRouter` behövs en `.htaccess` som skickar alla sökvägar till `index.html`. Alternativt används `HashRouter` som i prototyperna.

---

## Processlogg

| Datum | Aktivitet | Resultat / beslut |
|---|---|---|
| 27.4.2026 | Forskningsplan | Ämne, forskningsfrågor, metod (DSR) och avgränsning (endast frontend, mock-data). |
| 2.10.2026 | Fas 1: designprototyper | Tre prototyper (A Klassisk, B Kursrum, C Fokus) med gemensam datamodell och spelare. |
| 2.10.2026 | Teknikbeslut | Prototyper i vanilla JS (engångsprototyper, inget byggsteg). React först efter att designen valts. |
| 2.10.2026 | Demovideor | Externa exempelvideor fungerade inte (403). Lokala videor genereras i stället (28–52 min, cirka 15 MB). |
| 2.10.2026 | Lokal server | `router.php` skapades för Range-stöd i PHP:s utvecklingsserver. |
| 2.10.2026 | Verifiering | Automatiska webbläsartester på desktop och mobil, inga fel. |
| 2.10.2026 | Utvärderingsplan | Testupplägg, uppgifter och enkäter för fas 2 (`docs/utvarderingsplan.md`). |
| 27.10.2026 | Fas 2: val av design | Handledaren valde prototyp A, **ArcadaTube**. Motivering: YouTube har en igenkännbar design, så det finns ingen orsak att ”uppfinna hjulet på nytt”. De planerade användartesterna genomfördes inte. |
| 27.10.2026 | Städning av repot | Prototyp B och C raderades (fanns inte i versionshanteringen). Oanvänd kod togs bort ur `shared/`. Startsidan presenterar bara ArcadaTube. Kontrollerat i Chrome utan fel. |
| 27.10.2026 | Utvärderingsplanen | Markerad som ej genomförd. Förslag: återanvänd uppgifterna och enkäterna på React-versionen i fas 4 (stäms av med handledaren). |
| | *Fas 3: React-implementation* | *Fylls i* |

---

## AI-användning

Prototyperna, demovideogeneratorn, testskripten och utkastet till denna dokumentation togs fram med stöd av AI-assistenten Claude Code (Anthropic). Författaren har stått för problemformulering, forskningsfrågor, designriktningar, granskning och beslut, och står för utvärderingen. Den användning som beskrivs här bör redovisas i examensarbetet i enlighet med Arcadas riktlinjer, på samma sätt som i forskningsplanen.

Designvalet i fas 2 gjordes av handledaren. Städningen av repot och dokumentationen av beslutet gjordes med stöd av Claude Code.

---

## Referenser

Bangor, A., Kortum, P. T., & Miller, J. T. (2008). An empirical evaluation of the System Usability Scale. *International Journal of Human–Computer Interaction, 24*(6), 574–594. https://doi.org/10.1080/10447310802205776

Brooke, J. (1996). SUS: A “quick and dirty” usability scale. I P. W. Jordan, B. Thomas, B. A. Weerdmeester & I. L. McClelland (Red.), *Usability evaluation in industry* (s. 189–194). Taylor & Francis.

Dow, S. P., Glassco, A., Kass, J., Schwarz, M., Schwartz, D. L., & Klemmer, S. R. (2010). Parallel prototyping leads to better design results, more divergence, and increased self-efficacy. *ACM Transactions on Computer-Human Interaction, 17*(4), Artikel 18. https://doi.org/10.1145/1879831.1879836

Google. (2024). *Web Vitals: Essential metrics for a healthy site.* https://web.dev/vitals/

Guo, P. J., Kim, J., & Rubin, R. (2014). How video production affects student engagement: An empirical study of MOOC videos. I *Proceedings of the First ACM Conference on Learning @ Scale* (s. 41–50). ACM. https://doi.org/10.1145/2556325.2566239

Hart, S. G., & Staveland, L. E. (1988). Development of NASA-TLX (Task Load Index): Results of empirical and theoretical research. *Advances in Psychology, 52*, 139–183. https://doi.org/10.1016/S0166-4115(08)62386-9

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75–105.

Interaction Design Foundation. (2021a). *User centered design.* https://www.interaction-design.org/literature/topics/user-centered-design

Interaction Design Foundation. (2021b). *Cognitive load.* https://www.interaction-design.org/literature/topics/cognitive-load

Mayer, R. E. (2009). *Multimedia learning* (2:a uppl.). Cambridge University Press.

Nielsen, J. (1994). *10 usability heuristics for user interface design* (uppdaterad 2024). Nielsen Norman Group. https://www.nngroup.com/articles/ten-usability-heuristics/

Nielsen Norman Group. (2020). *Usability 101: Introduction to usability.* https://www.nngroup.com/articles/usability-101-introduction-to-usability/

Peffers, K., Tuunanen, T., Rothenberger, M. A., & Chatterjee, S. (2007). A design science research methodology for information systems research. *Journal of Management Information Systems, 24*(3), 45–77. https://doi.org/10.2753/MIS0742-1222240302

React. (2025). *React documentation.* https://react.dev/

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257–285. https://doi.org/10.1207/s15516709cog1202_4

Tohidi, M., Buxton, W., Baecker, R., & Sellen, A. (2006). Getting the right design and the design right: Testing many is better than one. I *Proceedings of the SIGCHI Conference on Human Factors in Computing Systems* (s. 1243–1252). ACM. https://doi.org/10.1145/1124772.1124960

Venable, J., Pries-Heje, J., & Baskerville, R. (2016). FEDS: A framework for evaluation in design science research. *European Journal of Information Systems, 25*(1), 77–89. https://doi.org/10.1057/ejis.2014.36

W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2.* https://www.w3.org/TR/WCAG22/

W3C. (2024). *ARIA Authoring Practices Guide (APG).* https://www.w3.org/WAI/ARIA/apg/

Yablonski, J. (2020). *Laws of UX: Using psychology to design better products & services.* O’Reilly Media.

> Referenser som tillkommit utöver forskningsplanen (Bangor m.fl., Brooke, Dow m.fl., Guo m.fl., Hart & Staveland, Hevner m.fl., Mayer, Nielsen, Peffers m.fl., Sweller, Tohidi m.fl., Venable m.fl., Yablonski) bör kontrolleras mot originalkällan innan de används i det slutliga arbetet.

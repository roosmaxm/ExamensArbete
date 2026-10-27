# Utvärderingsplan – fas 2: val av design

> **Status: Genomfördes inte.** Handledaren valde prototyp A (ArcadaTube) 27.10.2026 utan användartester, och prototyp B och C har raderats. Planen sparas som dokumentation av den ursprungliga metoden. Uppgifterna och enkäterna kan återanvändas för att utvärdera React-versionen i fas 4. Se README, avsnittet ”Fas 2 – Val av design”.

Detta dokument beskriver hur de tre prototyperna (A Klassisk, B Kursrum, C Fokus) utvärderas för att välja vilken design som byggs vidare i React. Planen är skriven för att kunna användas direkt vid testtillfällena och som metodbeskrivning i examensarbetet.

## 1. Syfte och frågor

**Syfte:** Att jämföra de tre designerna med avseende på de tre kriterier som forskningsplanen utvärderar:

| Kriterium | Mått i denna fas |
|---|---|
| Effektivitet | Andel lyckade uppgifter, tid per uppgift, antal felklick |
| Användarnöjdhet | SUS (System Usability Scale) och SEQ (Single Ease Question) |
| Kognitiv belastning | NASA-TLX i förenklad form (Raw TLX), självskattning |

**Frågor som ska besvaras:**

1. Vilken prototyp ger högst användbarhet och lägst kognitiv belastning för **studenter**?
2. Vilken prototyp gör administrationen effektivast för **lärare**?
3. Vilka enskilda funktioner från de andra prototyperna bör föras över till den valda designen?

Prestanda (Core Web Vitals) mäts inte i denna fas. Prototyperna är inte byggda i React, så sådana mätningar skulle inte säga något om slutprodukten. De görs i fas 4.

## 2. Upplägg

- **Design:** *Within-subjects*. Varje deltagare testar alla tre prototyperna.
- **Ordningseffekter:** Ordningen balanseras med en latinsk kvadrat, så att varje prototyp kommer först, i mitten och sist lika många gånger. Annars kommer den prototyp som testas sist att gynnas av att deltagaren redan lärt sig innehållet.
- **Deltagare:**
  - **Studenter:** 6 (helst 9). Testar på **mobiltelefon**, eftersom mobil tillgänglighet är ett uttalat fokus i forskningsplanen.
  - **Lärare:** 2–3. Testar lärarrollen på **dator**, där administration typiskt görs. De gör gärna också studentuppgifterna.
  - Fem till åtta deltagare per grupp brukar räcka för att hitta de flesta användbarhetsproblemen i kvalitativa tester (Nielsen, 2000). Med så få deltagare kan resultaten däremot inte generaliseras statistiskt. De redovisas beskrivande (median/medelvärde) och tolkas tillsammans med de kvalitativa iakttagelserna.
- **Pilottest:** 1 person före de egentliga testerna, för att kontrollera att uppgifterna är begripliga och att tidsåtgången rimlig (cirka 40 min per deltagare).

### Testordning (latinsk kvadrat)

| Deltagare | 1:a | 2:a | 3:e |
|---|---|---|---|
| S1, S7, L1 | A | B | C |
| S2, S8, L2 | B | C | A |
| S3, S9, L3 | C | A | B |
| S4 | A | C | B |
| S5 | B | A | C |
| S6 | C | B | A |

## 3. Förberedelser

- [ ] Prototyperna publicerade på skolans server och testade på en mobil (Android och iPhone om möjligt).
- [ ] Samtyckesblankett (se avsnitt 7).
- [ ] Protokollmall utskriven eller som kalkylark (se avsnitt 8).
- [ ] Tidtagning (stoppur eller skärminspelning, om deltagaren samtycker).
- [ ] **Tryck på ”Återställ demodata” på startsidan före VARJE prototyp.** Prototyperna delar lagring i webbläsaren, så en video som laddas upp i A syns annars också i B och C.

## 4. Genomförande (per deltagare, cirka 40 min)

1. **Introduktion (3 min):** Förklara syftet. Det är prototyperna som testas, inte deltagaren. Be deltagaren tänka högt (*think aloud*). Videorna är bildspel som platshållare.
2. **Samtycke** och bakgrundsfrågor (2 min): ålder (intervall), studieprogram/roll, hur ofta deltagaren tittar på inspelade föreläsningar.
3. **För varje prototyp i tilldelad ordning (cirka 10 min per prototyp):**
   1. Återställ demodata. Öppna prototypen på startsidan.
   2. Låt deltagaren utforska fritt i 1 minut.
   3. Uppgifterna (avsnitt 5) läses upp en i taget. Notera lyckad/delvis/misslyckad, tid och felklick. Efter varje uppgift besvaras **SEQ**.
   4. Efter alla uppgifter: **SUS** och **Raw TLX**.
4. **Avslutande intervju (5 min):** rangordning och öppna frågor (avsnitt 6.4).

Testledaren hjälper inte till under uppgifterna. Om deltagaren fastnar längre än 3 minuter noteras uppgiften som misslyckad och man går vidare.

## 5. Uppgifter

Uppgifterna går att lösa i alla tre prototyper, så att resultaten är jämförbara.

### Studentuppgifter (roll: Student)

| # | Uppgift (läses upp) | Lyckad när … | Mäter |
|---|---|---|---|
| S1 | ”Hitta föreläsningen om tillgänglighet och WCAG och börja titta från kapitlet *Nyheter i WCAG 2.2*.” | Videon spelas inom kapitel 3 i ”Tillgänglighet och WCAG 2.2”. | Sök, kapitelnavigering |
| S2 | ”Du har tidigare börjat titta på en föreläsning i kursen Webbutveckling med React. Fortsätt titta där du slutade.” | ”State och hooks” spelas från cirka 19:00. | Återupptagning, startsida |
| S3 | ”Slå på textning och ändra uppspelningshastigheten till 1,5 gånger.” | Textning på och hastighet 1,5×. | Spelarkontroller |
| S4 | ”Spola tillbaka 10 sekunder.” | Tiden har minskat med cirka 10 s, oavsett metod. | Spelarkontroller, mobilgester |
| S5 | ”Tänk dig att du har tittat klart på den här föreläsningen. Gå vidare till nästa föreläsning i samma kurs.” *(fortsätter från S2)* | ”Föreläsning 3: Prestanda” är öppnad. | Kursflöde, navigering |
| S6 | ”Hur många föreläsningar finns det i kursen Databaser och SQL?” | Svaret är 2. | Informationsarkitektur, överblick |

### Läraruppgifter (roll: Lärare)

| # | Uppgift (läses upp) | Lyckad när … | Mäter |
|---|---|---|---|
| L1 | ”Lägg upp en ny föreläsning som heter *Föreläsning 4: Routing* i kursen Webbutveckling med React, vecka 4. Den ska inte synas för studenterna ännu.” | Föreläsningen finns med status Utkast, rätt kurs och vecka. | Uppladdningsflöde |
| L2 | ”Föreläsningen *Kognitiv belastning i gränssnitt* är klar. Gör den synlig för studenterna.” | Status Publicerad. | Redigering, status |
| L3 | ”Lägg till ett kapitel som heter *Sammanfattning* vid 35:00 i föreläsningen *Användarcentrerad design i praktiken*.” | Kapitlet syns som markör på tidslinjen. | Kapitelredigering |
| L4 | ”Vilken av dina publicerade föreläsningar tittar studenterna minst färdigt på?” | Svaret är ”Föreläsning 3: Prestanda” (57 %). | Statistik, överblick |

## 6. Enkäter

### 6.1 SEQ – efter varje uppgift (Sauro & Dumas, 2009)

> *Hur svår eller lätt var uppgiften?*
> 1 = Mycket svår … 7 = Mycket lätt

### 6.2 SUS – efter varje prototyp (Brooke, 1996)

Skala 1–5 (1 = Instämmer inte alls, 5 = Instämmer helt).

1. Jag tror att jag skulle vilja använda den här tjänsten ofta.
2. Jag tyckte att tjänsten var onödigt komplicerad.
3. Jag tyckte att tjänsten var lätt att använda.
4. Jag tror att jag skulle behöva hjälp av en tekniskt kunnig person för att kunna använda tjänsten.
5. Jag tyckte att de olika funktionerna i tjänsten hängde väl ihop.
6. Jag tyckte att det fanns för mycket inkonsekvens i tjänsten.
7. Jag tror att de flesta skulle lära sig att använda tjänsten mycket snabbt.
8. Jag tyckte att tjänsten var mycket krånglig att använda.
9. Jag kände mig mycket säker när jag använde tjänsten.
10. Jag behövde lära mig mycket innan jag kunde komma igång med tjänsten.

**Poängberäkning:** För udda påståenden räknas (svar − 1), för jämna (5 − svar). Summan multipliceras med 2,5, vilket ger 0–100. Ett genomsnitt kring 68 brukar anses ligga på medelnivå, och över cirka 80 räknas som bra (Bangor m.fl., 2008).

> Översättningen ovan är gjord för detta arbete. Om en validerad svensk version av SUS används ska den källan anges i stället.

### 6.3 Raw TLX – kognitiv belastning, efter varje prototyp (Hart, 2006)

Varje fråga besvaras på en skala 0–100 i steg om 5 (0 = mycket låg, 100 = mycket hög).

| Dimension | Fråga |
|---|---|
| Mental ansträngning | Hur mentalt krävande var uppgifterna? |
| Fysisk ansträngning | Hur fysiskt krävande var uppgifterna (t.ex. tryck, scrollning)? |
| Tidspress | Hur stressad kände du dig av tempot? |
| Prestation | Hur misslyckad kände du dig med att lösa uppgifterna? *(0 = helt lyckad)* |
| Ansträngning | Hur hårt behövde du arbeta för att nå ditt resultat? |
| Frustration | Hur irriterad, stressad eller osäker kände du dig? |

**Raw TLX** = medelvärdet av de sex svaren (lägre = lägre upplevd belastning). Den förenklade varianten utan parvisa viktningar används ofta inom användbarhetsforskning (Hart, 2006).

### 6.4 Avslutande frågor

1. Rangordna de tre prototyperna från bäst till sämst. Varför hamnade den första överst?
2. Fanns det något i en annan prototyp som du saknade i din favorit?
3. Vad var mest förvirrande?
4. *(Studenter)* Skulle du använda transkription och anteckningar (B) eller fokusläget (C)? I vilka situationer?
5. *(Lärare)* Hur ofta laddar du upp föreläsningar? Vilket uppladdningsflöde passade bäst?

## 7. Etik och dataskydd

- Deltagandet är frivilligt och kan avbrytas när som helst.
- Inga namn sparas i resultaten. Deltagarna får koder (S1–S9, L1–L3).
- Skärminspelning görs endast med uttryckligt samtycke, och inspelningarna raderas när arbetet har godkänts.
- Prototyperna samlar inte in några data. Allt sparas lokalt i testenhetens webbläsare och återställs efter varje test.
- Hanteringen följer Arcadas riktlinjer för forskningsetik och GDPR.

## 8. Protokollmall

Ett kalkylark med en rad per deltagare, prototyp och uppgift:

| deltagare | roll | enhet | ordning | prototyp | uppgift | resultat (1/0,5/0) | tid (s) | felklick | SEQ | kommentar |
|---|---|---|---|---|---|---|---|---|---|---|
| S1 | student | mobil | ABC | A | S1 | 1 | 42 | 1 | 6 | Letade i menyn först |

Ett andra kalkylark med en rad per deltagare och prototyp:

| deltagare | prototyp | SUS (0–100) | RTLX (0–100) | rang (1–3) |
|---|---|---|---|---|

## 9. Analys och beslutsregel

1. **Kvantitativt (beskrivande):** Per prototyp och roll beräknas andel lyckade uppgifter, mediantid per uppgift, medelvärde för SEQ, SUS och RTLX samt medelrang.
2. **Kvalitativt:** Iakttagelser från tänka högt-protokollet och intervjun grupperas i teman, till exempel ”hittade inte”, ”missförstod ikon” eller ”uppskattade funktion”. Varje problem klassas efter allvarlighetsgrad.
3. **Beslut:** Den prototyp som har högst SUS och högst andel lyckade uppgifter för **studenterna** väljs som grund, eftersom studenterna är den största användargruppen. Vid jämnt resultat avgör RTLX och sedan medelrangen. Lärarnas resultat avgör vilket **adminflöde** som används. Det kan komma från en annan prototyp än studentvyn.
4. Funktioner från de andra prototyperna som flera deltagare efterfrågar (fråga 6.4.2) förs in i kravlistan för React-versionen.
5. Resultat och beslut dokumenteras i `README.md` under fas 2 och i processloggen.

## Referenser

Bangor, A., Kortum, P. T., & Miller, J. T. (2008). An empirical evaluation of the System Usability Scale. *International Journal of Human–Computer Interaction, 24*(6), 574–594. https://doi.org/10.1080/10447310802205776

Brooke, J. (1996). SUS: A “quick and dirty” usability scale. I P. W. Jordan, B. Thomas, B. A. Weerdmeester & I. L. McClelland (Red.), *Usability evaluation in industry* (s. 189–194). Taylor & Francis.

Hart, S. G. (2006). NASA-Task Load Index (NASA-TLX); 20 years later. *Proceedings of the Human Factors and Ergonomics Society Annual Meeting, 50*(9), 904–908. https://doi.org/10.1177/154193120605000909

Nielsen, J. (2000). *Why you only need to test with 5 users.* Nielsen Norman Group. https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/

Sauro, J., & Dumas, J. S. (2009). Comparison of three one-question, post-task usability questionnaires. I *Proceedings of the SIGCHI Conference on Human Factors in Computing Systems* (s. 1599–1608). ACM. https://doi.org/10.1145/1518701.1518946

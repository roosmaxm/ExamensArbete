/*
 * Mock-data för ArcadaTube (prototyp A).
 * Enligt avgränsningen i forskningsplanen finns ingen backend – allt innehåll
 * simuleras här. I fas 1 delades datan av prototyp A, B och C så att en
 * jämförelse endast skulle mäta skillnader i design, inte i innehåll.
 *
 * Videofilerna i shared/media/ är genererade bildspel (platshållare) med
 * kapitelrubriker, så att kapitelnavigeringen går att verifiera visuellt.
 * Byt "media" mot en riktig föreläsningsinspelning för att testa med äkta
 * innehåll (uppdatera då även "duration" i sekunder).
 */
window.ARCADA_DATA = {
  // Lokala demovideor (genereras med tools/generate_demo_media.py).
  // "demo" används för nya uppladdningar som saknar egen fil.
  sources: {
    demo: { src: '../shared/media/demo.mp4', duration: 300 }
  },

  teachers: [
    { id: 't1', name: 'Anna Lindholm' },
    { id: 't2', name: 'Mikko Virtanen' },
    { id: 't3', name: 'Sara Ek' }
  ],

  // Den inloggade läraren i lärarvyn
  currentTeacherId: 't1',

  courses: [
    { id: 'c1', code: 'IT-2041', name: 'Webbutveckling med React', teacherId: 't1', color: '#3b5bdb',
      description: 'Komponentbaserad frontend-utveckling, state management och prestandaoptimering.' },
    { id: 'c2', code: 'IT-2023', name: 'Människa–datorinteraktion', teacherId: 't1', color: '#c2255c',
      description: 'Användarcentrerad design, tillgänglighet och utvärdering av gränssnitt.' },
    { id: 'c3', code: 'IT-1032', name: 'Databaser och SQL', teacherId: 't2', color: '#2b8a3e',
      description: 'Relationsmodellen, normalisering och frågespråket SQL.' },
    { id: 'c4', code: 'IT-1045', name: 'Algoritmer och datastrukturer', teacherId: 't3', color: '#d9480f',
      description: 'Analys av algoritmer, sortering, sökning och grundläggande datastrukturer.' }
  ],

  videos: [
    {
      id: 'v1', courseId: 'c1', week: 1, order: 1, media: '../shared/media/v1.mp4', duration: 2297, status: 'publicerad',
      title: 'Föreläsning 1: Komponenter och JSX', short: 'Komponenter & JSX',
      teacherId: 't1', published: '2026-09-01', views: 412,
      stats: { avgPct: 78, completions: 151 },
      description: 'Vi går igenom kursens upplägg och bygger våra första React-komponenter. Fokus på hur JSX översätts till JavaScript och hur props används för att sätta ihop större gränssnitt av små delar.',
      chapters: [
        { title: 'Introduktion till kursen', lines: ['Välkommen till kursen Webbutveckling med React.', 'Idag går vi igenom upplägget och de första grunderna.'] },
        { title: 'Vad är en komponent?', lines: ['En komponent är en funktion som returnerar gränssnitt.', 'Tänk på komponenter som byggklossar som kan återanvändas.'] },
        { title: 'JSX under huven', lines: ['JSX ser ut som HTML men är egentligen JavaScript.', 'Varje element översätts till ett anrop som skapar ett objekt.'] },
        { title: 'Props och komposition', lines: ['Props är komponentens indata och ska inte ändras inuti komponenten.', 'Genom komposition bygger vi stora vyer av små delar.'] }
      ]
    },
    {
      id: 'v2', courseId: 'c1', week: 2, order: 1, media: '../shared/media/v2.mp4', duration: 2734, status: 'publicerad',
      title: 'Föreläsning 2: State och hooks', short: 'State & hooks',
      teacherId: 't1', published: '2026-09-08', views: 356,
      stats: { avgPct: 64, completions: 98 },
      description: 'Hur React håller reda på data som förändras över tid. Vi introducerar useState och useEffect och diskuterar vanliga fallgropar.',
      chapters: [
        { title: 'Repetition', lines: ['Förra veckan pratade vi om komponenter och props.', 'Idag ska vi göra komponenterna interaktiva.'] },
        { title: 'useState', lines: ['useState returnerar ett värde och en funktion för att uppdatera det.', 'När state ändras renderar React om komponenten.'] },
        { title: 'useEffect och sidoeffekter', lines: ['Sidoeffekter är allt som sker utanför renderingen.', 'Beroendelistan styr när effekten körs på nytt.'] },
        { title: 'Vanliga misstag', lines: ['Ett vanligt misstag är att mutera state direkt.', 'Ett annat är att glömma beroenden i useEffect.'] }
      ]
    },
    {
      id: 'v3', courseId: 'c1', week: 3, order: 1, media: '../shared/media/v3.mp4', duration: 3121, status: 'publicerad',
      title: 'Föreläsning 3: Prestanda – memo, lazy och Suspense', short: 'Prestanda i React',
      teacherId: 't1', published: '2026-09-15', views: 288,
      stats: { avgPct: 57, completions: 61 },
      description: 'Varför renderar React om, och när spelar det roll? Vi mäter med React Profiler och optimerar med memoization och koddelning.',
      chapters: [
        { title: 'Varför renderar React om?', lines: ['En komponent renderas om när dess state eller props ändras.', 'Även föräldrar som renderas om påverkar sina barn.'] },
        { title: 'React.memo och useMemo', lines: ['Memoization sparar resultatet av en beräkning.', 'Men memoization har också en kostnad och ska användas med eftertanke.'] },
        { title: 'Koddelning med lazy', lines: ['Med lazy laddas en komponent först när den behövs.', 'Det minskar storleken på den första nedladdningen.'] },
        { title: 'Mätning med Profiler', lines: ['Profiler visar hur lång tid varje rendering tar.', 'Mät alltid innan du optimerar.'] },
        { title: 'Sammanfattning', lines: ['Optimera där mätningen visar att det behövs.', 'Nästa vecka tittar vi på routing.'] }
      ]
    },
    {
      id: 'v4', courseId: 'c2', week: 1, order: 1, media: '../shared/media/v4.mp4', duration: 2478, status: 'publicerad',
      title: 'Användarcentrerad design i praktiken', short: 'Användarcentrerad design',
      teacherId: 't1', published: '2026-09-02', views: 233,
      stats: { avgPct: 71, completions: 88 },
      description: 'UCD-processen steg för steg: från att förstå användaren till att utvärdera prototyper tillsammans med riktiga användare.',
      chapters: [
        { title: 'UCD-processen', lines: ['Användarcentrerad design sätter användarens behov i centrum.', 'Processen är iterativ och upprepas tills lösningen fungerar.'] },
        { title: 'Personas', lines: ['En persona är en fiktiv men realistisk användare.', 'Personas hjälper teamet att fatta beslut för rätt målgrupp.'] },
        { title: 'Prototyper på olika nivåer', lines: ['Lågupplösta prototyper är snabba och billiga att ändra.', 'Högupplösta prototyper passar för användartester.'] },
        { title: 'Utvärdering med användare', lines: ['Låt användaren lösa uppgifter medan du observerar.', 'Kombinera observation med enkäter som SUS.'] }
      ]
    },
    {
      id: 'v5', courseId: 'c2', week: 2, order: 1, media: '../shared/media/v5.mp4', duration: 2135, status: 'publicerad',
      title: 'Tillgänglighet och WCAG 2.2', short: 'WCAG 2.2',
      teacherId: 't1', published: '2026-09-09', views: 301,
      stats: { avgPct: 69, completions: 102 },
      description: 'Vad innebär det att en webbplats är tillgänglig? Vi går igenom POUR-principerna och nyheterna i WCAG 2.2.',
      chapters: [
        { title: 'Varför tillgänglighet?', lines: ['Tillgänglighet gynnar alla användare, inte bara vissa.', 'I EU är det dessutom ett lagkrav för många tjänster.'] },
        { title: 'POUR-principerna', lines: ['Innehållet ska vara möjligt att uppfatta, hantera, förstå och robust.', 'Varje riktlinje i WCAG hör till en av de fyra principerna.'] },
        { title: 'Nyheter i WCAG 2.2', lines: ['WCAG 2.2 lägger till krav på synligt fokus och målstorlek.', 'Dragrörelser ska också kunna ersättas med enkla klick.'] },
        { title: 'Testverktyg', lines: ['Automatiska verktyg hittar ungefär en tredjedel av problemen.', 'Testa alltid också med tangentbord och skärmläsare.'] }
      ]
    },
    {
      id: 'v6', courseId: 'c2', week: 3, order: 1, media: '../shared/media/v6.mp4', duration: 1682, status: 'utkast',
      title: 'Kognitiv belastning i gränssnitt', short: 'Kognitiv belastning',
      teacherId: 't1', published: '2026-09-16', views: 0,
      stats: { avgPct: 0, completions: 0 },
      description: 'Arbetsminnets begränsningar och hur gränssnitt kan designas för att minska onödig belastning.',
      chapters: [
        { title: 'Arbetsminnet', lines: ['Arbetsminnet kan bara hålla ett fåtal saker samtidigt.', 'Därför ska gränssnitt inte kräva att användaren minns för mycket.'] },
        { title: 'Tre typer av belastning', lines: ['Man brukar skilja på inneboende, extern och relevant belastning.', 'Design kan framför allt minska den externa belastningen.'] },
        { title: 'Designmönster som avlastar', lines: ['Progressiv visning döljer det som inte behövs just nu.', 'Igenkänning är lättare än att komma ihåg.'] }
      ]
    },
    {
      id: 'v7', courseId: 'c3', week: 1, order: 1, media: '../shared/media/v7.mp4', duration: 2659, status: 'publicerad',
      title: 'Relationsmodellen och normalisering', short: 'Normalisering',
      teacherId: 't2', published: '2026-09-03', views: 198,
      stats: { avgPct: 61, completions: 55 },
      description: 'Tabeller, nycklar och relationer. Vi normaliserar en databas steg för steg till tredje normalformen.',
      chapters: [
        { title: 'Tabeller och nycklar', lines: ['En relation består av rader och kolumner.', 'Primärnyckeln identifierar varje rad unikt.'] },
        { title: 'Första normalformen', lines: ['Varje cell ska innehålla ett enda värde.', 'Upprepade grupper flyttas till egna tabeller.'] },
        { title: 'Andra och tredje normalformen', lines: ['Alla attribut ska bero på hela nyckeln.', 'Och på ingenting annat än nyckeln.'] },
        { title: 'När bryter man mot reglerna?', lines: ['Ibland denormaliserar man för prestandans skull.', 'Det ska alltid vara ett medvetet beslut.'] }
      ]
    },
    {
      id: 'v8', courseId: 'c3', week: 2, order: 1, media: '../shared/media/v8.mp4', duration: 2016, status: 'publicerad',
      title: 'SQL-joins steg för steg', short: 'SQL-joins',
      teacherId: 't2', published: '2026-09-10', views: 176,
      stats: { avgPct: 66, completions: 49 },
      description: 'INNER, LEFT, RIGHT och FULL JOIN förklarade med exempel och visualiseringar.',
      chapters: [
        { title: 'Varför joins?', lines: ['Data som är normaliserad ligger i flera tabeller.', 'Med joins sätter vi ihop den igen.'] },
        { title: 'INNER JOIN', lines: ['INNER JOIN returnerar bara rader som matchar i båda tabellerna.', 'Det är den vanligaste typen av join.'] },
        { title: 'LEFT och RIGHT JOIN', lines: ['LEFT JOIN behåller alla rader från den vänstra tabellen.', 'Saknade värden blir NULL.'] }
      ]
    },
    {
      id: 'v9', courseId: 'c4', week: 1, order: 1, media: '../shared/media/v9.mp4', duration: 2343, status: 'publicerad',
      title: 'Tidskomplexitet och Big O', short: 'Big O',
      teacherId: 't3', published: '2026-09-04', views: 267,
      stats: { avgPct: 59, completions: 70 },
      description: 'Hur mäter man hur effektiv en algoritm är? Introduktion till asymptotisk analys och Big O-notation.',
      chapters: [
        { title: 'Att mäta effektivitet', lines: ['Körtid i sekunder beror på datorn.', 'Därför räknar vi istället antalet steg.'] },
        { title: 'Big O-notation', lines: ['Big O beskriver hur tiden växer med indatats storlek.', 'Konstanter och lägre termer ignoreras.'] },
        { title: 'Vanliga komplexitetsklasser', lines: ['Konstant, logaritmisk, linjär och kvadratisk tid.', 'Skillnaden blir enorm för stora indata.'] }
      ]
    },
    {
      id: 'v10', courseId: 'c4', week: 2, order: 1, media: '../shared/media/v10.mp4', duration: 2840, status: 'publicerad',
      title: 'Sortering: från bubblesort till quicksort', short: 'Sorteringsalgoritmer',
      teacherId: 't3', published: '2026-09-11', views: 221,
      stats: { avgPct: 54, completions: 47 },
      description: 'Vi jämför enkla och effektiva sorteringsalgoritmer och analyserar deras tidskomplexitet.',
      chapters: [
        { title: 'Bubblesort', lines: ['Bubblesort jämför grannar och byter plats vid behov.', 'Enkel att förstå men långsam för stora listor.'] },
        { title: 'Insertion sort', lines: ['Insertion sort bygger upp en sorterad del element för element.', 'Den är snabb för nästan sorterade listor.'] },
        { title: 'Mergesort', lines: ['Mergesort delar listan i halvor och sorterar dem rekursivt.', 'Den har alltid tidskomplexiteten n log n.'] },
        { title: 'Quicksort', lines: ['Quicksort väljer ett pivotelement och partitionerar listan.', 'I praktiken är den ofta snabbast.'] }
      ]
    }
  ],

  // Simulerad tittarhistorik (sekunder) så att "Fortsätt titta" har innehåll vid första besöket
  seedProgress: { v1: 2297, v2: 1140, v5: 1480, v7: 600 }
};

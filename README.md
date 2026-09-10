# Spørgeskema om AI og IT

Interaktiv spørgeskema-app til AU-afgangsprojekt i informationsteknologi.

## Formål

Appen skal indsamle data om, hvordan almindelige IT-brugere bruger AI, hvordan AI har ændret deres måde at løse opgaver på, hvilke fordele og ulemper de oplever, samt hvordan AI bruges i forbindelse med arbejde og IT-sikkerhed.

Appen er bygget som et beslutningstræ. Respondenten ser kun relevante spørgsmål, og forskellige svar kan føre til forskellige spørgeruter.

## Status

Den aktuelle version indeholder:

- mobilvenligt design inspireret af Microsoft Forms og Google Forms
- ét spørgsmål ad gangen
- tydelige radio-knapper ved ét muligt svar
- afkrydsningsfelter ved flere svar
- "Andet" med tilhørende tekstfelt på multi-choice-spørgsmål
- næste- og tilbagefunktion
- dynamisk forgreningslogik
- diskret fremdriftsindikator, som tilpasser sig den aktuelle rute
- baggrundsspørgsmål
- AI-kendskab og AI-brug
- AI-brugergren
- arbejds- og IT-sikkerhedsgren
- kort ikke-brugergren
- registrering af IT-profil til en senere ekstra IT-faglig gren
- ingen ekstern datalagring endnu

Den endelige IT-faglige gren er bevidst ikke bygget endnu. Den tilføjes først, når de konkrete spørgsmål er godkendt.

## Filstruktur

```text
Sporgeskema/
├── .github/workflows/pages.yml # GitHub Pages deployment
├── index.html                  # Appens HTML og hovedlayout
├── styles.css                  # Design og mobiltilpasning
├── questions.js                # Spørgsmål, svarmuligheder og forgreninger
├── app.js                      # App-motor, navigation og state
├── README.md                   # Dokumentation
└── MASTERPROMPT.md             # Masterprompt til videre udvikling
```

## Spørgsmål og beslutningstræ

Spørgsmålene ligger centralt i `questions.js` som JavaScript-objekter.

Et simpelt spørgsmål ser sådan ud:

```js
age: {
  number: 1,
  section: "Baggrund",
  text: "Hvad er din alder?",
  type: "single",
  options: [
    { value: "under30", label: "Under 30 år" },
    { value: "30to49", label: "30–49 år" },
    { value: "50plus", label: "50 år eller derover" }
  ],
  next: "gender"
}
```

Forgreninger beskrives som data i stedet for hardcodede funktioner:

```js
next: {
  byAnswer: {
    yes: "itProfile",
    no: "finish",
    dontKnow: "finish"
  }
}
```

Det gør beslutningstræet lettere at læse, teste og ændre.

## Flere svar og "Andet"

Et multi-choice-spørgsmål bruger:

```js
type: "multi"
```

En fri svarmulighed markeres med:

```js
{ value: "other", label: "Andet", other: true }
```

App-motoren viser derefter automatisk et tekstfelt, når brugeren markerer denne mulighed. Næste-knappen aktiveres først, når tekstfeltet indeholder et svar.

Muligheder som logisk ikke bør kombineres med andre svar, eksempelvis "Ved ikke" eller "Ingen særlige problemer", kan markeres:

```js
{ value: "dontKnow", label: "Ved ikke", exclusive: true }
```

## Aktuelt flow

Hovedflowet er:

```text
Alder
→ Køn
→ Bor i Danmark
→ Kendskab til AI
   ├─ Nej / Ved ikke → afslutning
   └─ Ja
      → IT-profil
      → Bruger AI?
         ├─ Nej → kort ikke-brugergren → afslutning
         └─ Ja/sjældent
            → anvendelse af AI
            → AI-værktøjer
            → ændrede arbejdsmetoder
            → fordele
            → problemer/ulemper
            → AI på arbejde
               ├─ Nej / arbejder ikke → afslutning
               └─ Ja
                  → arbejdsopgaver
                  → arbejdsoplysninger
                  → databevidsthed
                  → regler på arbejdspladsen
                  → information om tilladt AI-brug
                  → afslutning
```

Spørgsmål 10, 16 og 19 vises kun, når et tidligere svar gør dem relevante.

## Fremdriftsindikator

Da respondenter kan få forskellige ruter, bruger appen ikke et fast samlet antal spørgsmål. I stedet beregner den den længste sandsynlige resterende rute ud fra de svar, der allerede er givet.

Når en forgrening bliver afgjort, justeres den estimerede længde automatisk.

## Arkitektur

Frontend er ren HTML, CSS og JavaScript. Det gør løsningen enkel, gennemsigtig og velegnet til GitHub Pages.

Appen er opdelt i fire logiske lag:

1. **Præsentation** – `index.html` og `styles.css`
2. **Spørgeskemadata** – `questions.js`
3. **Navigation og state** – `app.js`
4. **Datalagring** – tilføjes senere som separat lag

## Datamodel

Svar bruger stabile tekniske feltnavne, fx:

```json
{
  "age": "50plus",
  "gender": "male",
  "denmark": "yes",
  "aiKnowledge": "yes",
  "itProfile": "professional",
  "aiUse": "daily",
  "aiUses": ["writing", "excel", "programming"]
}
```

Frie "Andet"-svar holdes separat fra de faste kategorier, så data senere kan analyseres rent.

## Sikkerhed

GitHub Pages er en offentlig statisk frontend. Derfor må adgangsnøgler, passwords, Microsoft Graph-tokens eller andre hemmeligheder aldrig ligge i JavaScript-koden eller repositoryet.

Appen må heller aldrig bede respondenten om at skrive konkrete følsomme data, kundedata, adgangskoder eller fortrolige oplysninger.

Når ekstern lagring tilføjes, bør svar sendes via HTTPS til en sikker mellemservice.

Mulige løsninger:

- Microsoft Power Automate eller Azure Function til Excel/OneDrive
- Google Apps Script eller anden backend til Google Sheets
- Supabase, Firebase eller en lille serverless database/API

Den endelige løsning vælges først, når spørgeskemaets datamodel er fastlagt.

## GitHub Pages

Appen deployes automatisk fra `main` via GitHub Actions og er beregnet til:

`https://ronnykisbye.github.io/Sporgeskema/`

## Videre udvikling

Næste større trin er:

1. modtage og tilføje den godkendte IT-faglige gren
2. teste alle ruter på mobil, tablet og pc
3. gennemgå ordlyd og svartid
4. fastlægge datamodel og eksportfelter
5. vælge sikker datalagring
6. tilføje eventuel samtykke- og privatlivstekst
7. afprøve analysedata i Excel, Power BI eller Python

## Afgangsprojekt og AI-assisteret programmering

Projektet kan bruges som dokumenteret eksempel på AI-assisteret programmering. Git-historikken, README-filen og masterprompten bør derfor bevares, så udviklingsprocessen kan beskrives og reproduceres i afgangsprojektet.

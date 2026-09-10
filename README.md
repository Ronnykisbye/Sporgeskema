# Spørgeskema om AI og IT

Interaktiv spørgeskema-app til AU-afgangsprojekt i informationsteknologi.

## Formål

Appen skal indsamle data om, hvordan almindelige IT-brugere bruger AI, hvordan AI har ændret deres måde at løse opgaver på, og hvilken betydning udviklingen kan have for programmering, databaser, automatisering og IT-sikkerhed.

Appen er bygget som et beslutningstræ. Respondenten ser kun relevante spørgsmål, og forskellige svar kan føre til forskellige spørgeruter.

## Status

Dette er første fungerende prototype.

Den indeholder:

- mobilvenligt design inspireret af Microsoft Forms og Google Forms
- ét spørgsmål ad gangen
- tydelige radio-knapper ved ét muligt svar
- understøttelse af afkrydsningsfelter ved flere svar
- næste- og tilbagefunktion
- fleksibel forgreningslogik
- de første baggrundsspørgsmål
- AI-kendskab og AI-brug
- forberedte knudepunkter til senere grene
- ingen ekstern lagring endnu

## Filstruktur

```text
Sporgeskema/
├── index.html      # Appens HTML og hovedlayout
├── styles.css      # Design og mobiltilpasning
├── questions.js    # Spørgsmål, svarmuligheder og forgreninger
├── app.js          # App-motor, navigation og state
├── README.md       # Dokumentation
└── MASTERPROMPT.md # Masterprompt til videre udvikling
```

## Sådan er spørgsmål gemt

Spørgsmålene ligger centralt i `questions.js` som JavaScript-objekter.

Eksempel:

```js
age: {
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

En forgrening kan også bruge en funktion:

```js
next: (answers) => answers.aiKnowledge === "yes"
  ? "aiUse"
  : "nonUserReasonPlaceholder"
```

Denne model gør det muligt at ændre spørgsmål og beslutningstræ uden at ændre appens brugerflade eller navigationsmotor.

## Arkitektur

Frontend er ren HTML, CSS og JavaScript. Det gør løsningen enkel, gennemsigtig og velegnet til GitHub Pages.

Appen er opdelt i tre lag:

1. **Præsentation** – `index.html` og `styles.css`
2. **Spørgeskemadata** – `questions.js`
3. **Logik og navigation** – `app.js`

Databehandling skal senere være et fjerde, separat lag.

## Sikker datalagring senere

GitHub Pages er en statisk frontend. Derfor må adgangsnøgler, passwords, Microsoft Graph-tokens eller andre hemmeligheder aldrig ligge i JavaScript-koden.

En senere løsning bør sende svar via HTTPS til en sikker mellemservice, som derefter gemmer data.

Mulige løsninger:

- Microsoft Power Automate eller Azure Function til Excel/OneDrive
- Google Apps Script eller anden backend til Google Sheets
- Supabase, Firebase eller en lille serverless database/API

Hvis Excel på OneDrive vælges, er en mellemservice baseret på Microsoft 365 en naturlig løsning. Den endelige løsning vælges først, når spørgeskemaet og datamodellen er fastlagt.

## Dataprincip

Svar bør senere gemmes med stabile tekniske feltnavne i stedet for kun spørgsmålets tekst. Eksempel:

```json
{
  "age": "50plus",
  "gender": "male",
  "denmark": "yes",
  "itBackground": "yes",
  "aiKnowledge": "yes",
  "aiUse": "daily"
}
```

Det gør analyse i Excel, Power BI, Python eller statistikprogrammer langt lettere.

## GitHub Pages

Når GitHub Pages er aktiveret for `main`-branchen og rodmappen, vil appen normalt være tilgængelig på:

`https://ronnykisbye.github.io/Sporgeskema/`

## Videre udvikling

De næste naturlige trin er:

1. færdiggøre spørgeskemaets spørgsmål og beslutningstræ
2. tilføje flere-svar-spørgsmål
3. gennemgå neutral formulering og rækkefølge
4. beregne forventet svartid for hver hovedrute
5. vælge datalagring
6. tilføje samtykke/privatlivstekst efter behov
7. teste på Android, iPhone, tablet og pc
8. eksportere data i et analysevenligt format

## Afgangsprojekt og AI-assisteret programmering

Projektet kan bruges som dokumenteret eksempel på AI-assisteret programmering. Det er derfor en fordel at bevare Git-historikken, README-filen og masterprompten, så udviklingsprocessen kan beskrives og reproduceres i afgangsprojektet.

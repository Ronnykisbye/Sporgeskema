# Spørgeskema om AI og IT

Interaktiv spørgeskema-app til AU-afgangsprojekt i informationsteknologi.

## Formål

Appen skal indsamle data om, hvordan almindelige IT-brugere bruger AI, hvordan AI har ændret deres måde at løse opgaver på, hvilke fordele og ulemper de oplever, samt hvordan AI bruges i forbindelse med arbejde og IT-sikkerhed.

Appen er bygget som et beslutningstræ. Respondenten ser kun relevante spørgsmål, og forskellige svar kan føre til forskellige spørgeruter.

## Status

Den aktuelle version indeholder:

- mobilvenligt design inspireret af Microsoft Forms og Google Forms
- ét spørgsmål ad gangen
- radio-knapper ved ét svar
- afkrydsningsfelter ved flere svar
- "Andet" med tekstfelt ved multi-choice
- Næste/Tilbage samt dynamisk "Afslut" på sidste relevante spørgsmål
- dynamisk fremdriftsindikator
- baggrundsspørgsmål, AI-brugergren, arbejds-/sikkerhedsgren og kort ikke-brugergren
- opdateret spørgsmål 5, 8 og 12 efter specifikationen 10. september 2026
- lokal autosave i browseren med anonymt sessions-id
- oprydning af gamle gren-svar, hvis respondenten går tilbage og ændrer rute
- forberedte, men endnu ikke aktive, IT-spørgsmål 23, 24, 28, 29 og 30
- ingen central cloud-lagring endnu

Den IT-faglige ekstragren aktiveres først, når de manglende spørgsmål 21, 22, 25–27 og 31 er leveret. Appen opfinder ikke de manglende led.

## Filstruktur

```text
Sporgeskema/
├── .github/workflows/pages.yml # GitHub Pages deployment
├── index.html                  # Appens HTML og hovedlayout
├── styles.css                  # Design og mobiltilpasning
├── questions.js                # Spørgsmål, svarmuligheder og forgreninger
├── storage.js                  # Lokal autosave og senere backend-adapter
├── app.js                      # App-motor, navigation og state
├── README.md                   # Dokumentation
└── MASTERPROMPT.md             # Masterprompt til videre udvikling
```

## Centrale spørgeændringer

Spørgsmål 5 har nu tre profiler:

1. ingen særlig IT-faglig baggrund
2. interesse/noget erfaring med IT, men ikke professionelt IT-arbejde
3. IT-faglig uddannelse og/eller professionelt IT-arbejde

Kun den sidste profil skal senere åbne den ekstra IT-faglige gren.

Spørgsmål 8 bruger nu tydeligt formuleringerne "AI-funktioner i Word", "AI-funktioner i Excel" og "AI-funktioner i Outlook / e-mail", så almindelig brug af programmerne ikke fejlagtigt tælles som AI-brug.

Spørgsmål 12 bruger den neutrale formulering: "Det kan være svært at vurdere, hvornår jeg kan stole på svarene" og bevarer "Jeg kan blive for afhængig af AI".

## Beslutningstræ og datakvalitet

Spørgsmål ligger centralt i `questions.js`. Forgreninger beskrives som data, fx:

```js
next: {
  byAnswer: {
    yes: "itProfile",
    no: "finish",
    dontKnow: "finish"
  }
}
```

Når en respondent går tilbage og ændrer et svar, sletter appen svar fra den gamle, ikke længere relevante gren. Det forhindrer skjulte og modstridende data i den senere eksport.

## Multi-choice og "Andet"

Multi-choice bruger `type: "multi"`.

Fri tekst markeres med:

```js
{ value: "other", label: "Andet", other: true }
```

Appen viser automatisk et tekstfelt, og brugeren kan ikke fortsætte med "Andet" markeret uden at skrive noget.

Eksklusive svar som "Ved ikke" eller "Ingen særlige problemer" kan markeres med `exclusive: true`.

## Autosave

`storage.js` indeholder lagringslaget.

I udviklingsversionen gemmes en anonym kladde i browserens `localStorage` efter hvert ændret svar. Et anonymt sessions-id følger kladden.

Dette beskytter mod tab ved fx genindlæsning på samme enhed, men er **ikke** central dataindsamling. Hvis respondenten lukker browseren, kan forskeren ikke hente kladden fra en anden enhed eller server.

Når cloud-backend vælges, skal `storage.js` ændres til at sende autosave via HTTPS til en sikker mellemservice. Frontend må aldrig indeholde API-nøgler eller andre hemmeligheder.

## Afslutning og resultatmail

Den endelige afslutningstekst er forberedt i `questions.js`, men må først vises som "registreret", når en central backend faktisk har bekræftet, at besvarelsen er gemt.

Efter en bekræftet central gemning skal appen senere kunne vise et separat frivilligt valg om at modtage en kort opsummering af resultatet. E-mailadressen skal gemmes separat fra spørgeskemabesvarelsen og uden kobling til sessions-id eller svar.

I den nuværende udviklingsversion indsamles der derfor ikke e-mailadresser.

## Forberedt IT-faglig gren

Specifikationen indeholder allerede indhold til spørgsmål 23, 24, 28, 29 og 30. De ligger i `pendingITQuestions` i `questions.js`, men er ikke koblet ind i den aktive spørgerute.

Det skyldes, at spørgsmål 21, 22, 25, 26, 27 og 31 endnu ikke er leveret. Når de kommer, kan hele IT-grenen bygges uden at gætte på indhold eller forgreninger.

## Sikkerhed

GitHub Pages er en offentlig statisk frontend. Derfor må adgangsnøgler, passwords, Microsoft Graph-tokens eller andre hemmeligheder aldrig ligge i JavaScript-koden eller repositoryet.

Appen må heller aldrig bede respondenten skrive konkrete følsomme data, kundedata, adgangskoder eller fortrolige oplysninger.

Mulige senere backend-løsninger:

- Microsoft Power Automate eller Azure Function til Excel/OneDrive
- Google Apps Script til Google Sheets
- Supabase/Firebase/serverless API

## GitHub Pages

Appen deployes automatisk fra `main` via GitHub Actions:

`https://ronnykisbye.github.io/Sporgeskema/`

## Kvalitetssikring

Efter ændringer skal følgende kontrolleres:

1. alle aktive `next`-referencer peger på eksisterende spørgsmål eller `finish`
2. korte og lange ruter afsluttes korrekt
3. sidste relevante knap hedder `Afslut`
4. Tilbage følger den valgte rute
5. ændring af tidligere svar fjerner gamle gren-data
6. radio/checkbox/Andet-felter fungerer korrekt
7. autosave kaldes efter svarændringer
8. GitHub Pages-workflowet gennemfører uden fejl
9. offentligt link testes efter deployment

## Afgangsprojekt og AI-assisteret programmering

Projektet kan bruges som dokumenteret eksempel på AI-assisteret programmering. Git-historik, README og MASTERPROMPT skal derfor bevares, så udviklingsproces, beslutninger, sikkerhed og kvalitetssikring kan dokumenteres.
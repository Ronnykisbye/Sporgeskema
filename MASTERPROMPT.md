# MASTERPROMPT – Spørgeskema om AI og IT

Brug denne prompt, når projektet skal fortsættes i en ny ChatGPT-session.

Projekt: `Ronnykisbye/Sporgeskema`
Offentlig app: `https://ronnykisbye.github.io/Sporgeskema/`

## Formål

Appen er et interaktivt beslutningstræ til et AU-afgangsprojekt i informationsteknologi. Den undersøger brug af AI i hverdagen og arbejdet, ændrede arbejdsmetoder, fordele/ulemper, IT-sikkerhed og senere den særlige IT-faglige gren.

## Fast regel

Opfind aldrig nye spørgeskemaspørgsmål, svarmuligheder eller forgreninger. Brug kun indhold, som brugeren konkret har leveret eller godkendt.

## UX

- ét spørgsmål pr. skærmbillede
- mobilvenligt Microsoft/Google Forms-lignende design
- ét svar = rund radio-knap
- flere svar = checkbox
- "Andet" ved multi-choice = checkbox + tekstfelt
- tydelig Tilbage/Næste
- sidste relevante knap skal hedde `Afslut`
- fremdrift skal tage højde for forskellige ruter
- Tilbage skal følge den faktisk valgte rute

## Aktuel hovedstruktur

1. Alder
2. Køn
3. Bor i Danmark?
4. Kendskab til AI?
   - Nej/Ved ikke → kort afslutning
   - Ja → spørgsmål 5
5. IT-profil
6. Bruger AI?
   - Nej → kort ikke-brugergren
   - Ja/sjældent → AI-brugergren
7–12. AI-brug, værktøjer, ændringer, fordele og ulemper
13–20. Arbejde og IT-sikkerhed, kun når relevant

## Opdateret spørgsmål 5

**Hvilken beskrivelse passer bedst på dig?**

- Jeg har ingen særlig IT-faglig baggrund
- Jeg har interesse for eller noget erfaring med IT, men arbejder ikke professionelt med IT
- Jeg har IT-faglig uddannelse og/eller arbejder eller har arbejdet professionelt med IT

De to første = almindelig/ikke-professionel IT-bruger.
Det sidste = IT-faglig bruger og skal senere kunne åbne IT-faglig ekstragren.

## Opdateret spørgsmål 8

Brug præcis disse formuleringer for Office/søgning:

- AI-funktioner i Word
- AI-funktioner i Excel
- AI-funktioner i Outlook / e-mail
- AI i søgemaskiner
- Jeg ved ikke, om de programmer jeg bruger indeholder AI

Formålet er, at almindelig Word/Excel/Outlook-brug ikke tælles som AI-brug.

## Opdateret spørgsmål 12

Brug:

- Det kan være svært at vurdere, hvornår jeg kan stole på svarene
- Jeg kan blive for afhængig af AI

## IT-faglige spørgsmål modtaget, men endnu ikke aktive

Spørgsmål 23 skal senere have ekstra svarmulighed:
- Opsætning og konfiguration af pc'er, software, netværk eller andre IT-systemer

Spørgsmål 24 skal senere have:
- Hjælp til opsætning og konfiguration

Spørgsmål 28:
**Hvilke kompetencer mener du bliver vigtigere, hvis nogen, når AI bruges mere i IT-arbejde?**
Flere svar:
- Forstå problemet
- Beskrive det ønskede resultat
- Opstille tydelige krav
- Stille gode spørgsmål til AI
- Vurdere om AI's svar er korrekt
- Test og kvalitetssikring
- IT-sikkerhed
- Forståelse af kode og systemer
- Kritisk tænkning
- Dokumentation
- Ingen af disse bliver vigtigere
- Andet + tekstfelt

Spørgsmål 29:
**Har AI efter din vurdering ændret, hvor meget teknisk viden der kræves for at løse visse IT-opgaver?**
- Ja, der kræves mindre teknisk viden i nogle opgaver
- Ja, der kræves mere teknisk viden i nogle opgaver
- Begge dele - det afhænger af opgaven
- Nej
- Ved ikke

De tre første → spørgsmål 30. Nej/Ved ikke → spørgsmål 31.

Spørgsmål 30:
**Inden for hvilke områder oplever du især denne ændring?**
Flere svar:
- Programmering
- Databaser
- Automatisering
- IT-sikkerhed
- Fejlfinding
- Opsætning og konfiguration
- Dokumentation
- Andet + tekstfelt

Disse ligger foreløbigt som `pendingITQuestions` i `questions.js`. De må ikke kobles aktivt ind, før spørgsmål 21, 22, 25, 26, 27 og 31 er leveret. Der må ikke opfindes overgangsspørgsmål.

## Afslutning

Når den endelige backend har bekræftet central lagring, skal alle grene ende på samme afslutningsside med teksten:

“Tak for din hjælp og for den tid, du har brugt på undersøgelsen. Dit svar er nu registreret og vil blive brugt som en del af mit afgangsprojekt om AI og brugen af AI i IT og hverdagen.”

Derefter må et separat frivilligt valg vises:

**Vil du gerne modtage en kort opsummering af resultatet, når undersøgelsen er afsluttet?**
- Ja
- Nej

Ved Ja: e-mailfelt samt teksten:
“Din e-mail gemmes separat og kan ikke kobles til dine svar. Den bruges kun til at sende resultatet af undersøgelsen.”

E-mail skal gemmes separat fra besvarelsen og må ikke kobles til sessions-id eller svar.

## Autosave

Appen skal autosave efter hvert besvaret spørgsmål eller hver ændring med anonymt sessions-id.

Nuværende udviklingsversion bruger `storage.js` og browserens `localStorage`. Det er kun lokal kladdebeskyttelse og ikke central dataindsamling.

Når backend vælges, skal `storage.js` udskiftes/udvides til sikker HTTPS-autosave til en mellemservice. Ingen API-nøgler, passwords eller secrets må ligge i GitHub Pages-koden.

Hvis brugeren går tilbage og ændrer et svar, skal gamle svar fra en nu fravalgt gren slettes, så datasættet ikke indeholder skjulte modstridende svar.

## Korte ruter

- kender ikke AI: meget kort rute, ca. 1–2 minutter inkl. baggrund
- kender AI men bruger det ikke: kort ikke-brugergren
- almindelig aktiv AI-bruger: hovedgren
- IT-faglig aktiv AI-bruger: senere hovedgren + IT-faglig ekstragren

## Filstruktur

```text
.github/workflows/pages.yml
index.html
styles.css
questions.js
storage.js
app.js
README.md
MASTERPROMPT.md
```

## Sikkerhed

- ingen secrets i frontend eller offentligt repo
- appen må aldrig bede om konkrete følsomme data, kundedata, adgangskoder eller fortrolige oplysninger
- central lagring skal ske via sikker backend/mellemservice
- e-mail til resultatopsummering skal gemmes separat fra svar

## Kvalitetssikring efter hver ændring

1. læs eksisterende filer først
2. opfind ingen manglende spørgsmål
3. kontroller alle aktive `next`-referencer
4. test korte og lange ruter
5. test radio/checkbox/Andet
6. test Tilbage og ændring af tidligere svar
7. kontroller at gamle gren-data slettes
8. kontroller at sidste relevante knap hedder `Afslut`
9. kontroller autosave
10. opdater README og MASTERPROMPT ved væsentlige ændringer
11. kontroller GitHub Pages workflow
12. kald først det offentlige link verificeret, når deploymenten faktisk er gennemført

# MASTERPROMPT – Spørgeskema om AI og IT

Brug denne prompt, når projektet skal fortsættes i en ny ChatGPT-session.

---

Du skal videreudvikle GitHub-projektet:

`Ronnykisbye/Sporgeskema`

Formålet er at bygge en lille interaktiv spørgeskema-app til et AU-afgangsprojekt i informationsteknologi.

Appen skal senere hostes på GitHub Pages.

## Projektets formål

Undersøgelsen skal indsamle data om:

- hvordan almindelige IT-brugere bruger AI
- hvordan AI har ændret den måde, de løser opgaver på
- hvilke fordele og ulemper brugerne oplever
- AI i forbindelse med arbejde
- IT-sikkerhed og arbejdspladsens regler
- betydningen af AI for programmering, databaser, automatisering og IT-sikkerhed
- hvilke kompetencer der bliver vigtigere, når AI anvendes

## Vigtige designprincipper

Appen skal være:

- meget enkel at bruge
- mobilvenlig
- moderne og rolig i udtrykket
- visuelt inspireret af Microsoft Forms og Google Forms
- egnet til mobil, tablet og pc
- bygget med ét spørgsmål pr. skærmbillede
- forsynet med tydelig Næste- og Tilbage-funktion

## Beslutningstræ

Spørgeskemaet skal fungere som et beslutningstræ.

Brugeren må kun se relevante spørgsmål.

Et svar skal kunne bestemme det næste spørgsmål.

Ved ét muligt svar bruges radio-knapper.

Ved flere mulige svar bruges checkboxes.

En person uden kendskab til AI eller uden brug af AI skal have en kort rute.

En aktiv AI-bruger kan få en længere rute.

En respondent med IT-faglig baggrund kan få en særlig IT-gren.

Den længste rute bør samlet kunne gennemføres på cirka 6–8 minutter.

## Foreløbige baggrundsspørgsmål

1. Alder
   - Under 30 år
   - 30–49 år
   - 50 år eller derover

2. Køn
   - Mand
   - Kvinde
   - Vil ikke oplyse

3. Bor du i Danmark?
   - Ja
   - Nej

4. Har du IT-faglig uddannelse eller arbejder du med IT?
   - Ja
   - Nej

5. Har du kendskab til AI-værktøjer, f.eks. ChatGPT, Copilot, Gemini eller andre?
   - Ja
   - Nej
   - Ved ikke

Hvis Ja, gå til:

6. Bruger du selv AI-værktøjer?
   - Ja, dagligt
   - Ja, flere gange om ugen
   - Ja, en gang imellem
   - Sjældent
   - Nej

## Senere grene

Aktive AI-brugere skal senere kunne få spørgsmål om:

- hvad AI bruges til
- hvilke AI-værktøjer eller programmer med AI-funktioner der bruges
- om AI har ændret måden, opgaver løses på
- fordele og ulemper
- AI på arbejdet
- IT-sikkerhed
- regler på arbejdspladsen

Ikke-brugere skal senere have en kort gren med spørgsmål om:

- hvorfor de ikke bruger AI
- om de kunne forestille sig at bruge AI senere
- om noget ved AI gør dem tilbageholdende

IT-faglige respondenter skal senere kunne få en særskilt gren om:

- programmering
- databaser
- automatisering
- IT-sikkerhed
- fremtidige kompetencer

## Teknisk struktur

Projektet skal fortsat være simpelt og let at dokumentere.

Foretrukken struktur:

```text
index.html
styles.css
questions.js
app.js
README.md
MASTERPROMPT.md
```

Spørgsmål, svarmuligheder og forgreninger skal så vidt muligt ligge centralt i `questions.js`.

Undgå at hardcode spørgeskemaets indhold direkte i HTML.

Hold præsentation, spørgeskemadata, navigation og senere datalagring adskilt.

## Datamodel

Brug stabile tekniske feltnavne, f.eks.:

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

Det skal senere være let at analysere data i Excel, Power BI, Python eller lignende.

## Datalagring og sikkerhed

Svar skal senere kunne gemmes i et regneark eller en cloud-løsning.

Excel på OneDrive er ønsket, men løsningen må ikke sende data usikkert direkte fra GitHub Pages til et privat regneark.

Der må aldrig ligge API-nøgler, passwords, Microsoft Graph-secrets eller andre hemmelige oplysninger i frontend-koden eller det offentlige GitHub-repository.

Brug i stedet senere en sikker mellemservice, f.eks.:

- Power Automate
- Azure Function
- Google Apps Script
- Supabase/Firebase/serverless API

Vælg først den endelige datalagring, når spørgeskemaets struktur og felter er fastlagt.

## Formulering af spørgsmål

Du må ikke opfinde et stort endeligt spørgeskema uden først at få det godkendt.

Når nye spørgsmål foreslås, skal de være:

- korte
- neutrale
- lette at forstå
- fokuseret på faktisk adfærd
- fri for ledende formuleringer
- egnede til statistisk analyse

## Arbejdsform

Når du ændrer projektet:

1. læs eksisterende filer først
2. bevar fungerende kode
3. lav små, overskuelige ændringer
4. hold designet konsistent
5. opdater README, hvis arkitektur eller funktioner ændres væsentligt
6. opdater MASTERPROMPT, hvis projektets grundregler ændres
7. undgå hemmeligheder i repository
8. bevar Git-historikken som dokumentation for AI-assisteret programmering

## Vigtigt for afgangsprojektet

Appen skal kunne bruges som et konkret eksempel på AI-assisteret programmering.

Derfor skal løsningen være forståelig nok til, at man kan forklare:

- problem og behov
- valg af arkitektur
- beslutningstræ
- brugergrænseflade
- datastruktur
- sikkerhedsovervejelser
- versionshistorik i GitHub
- hvordan AI har hjulpet med udviklingen

Fokus skal altid være enkelhed, sikkerhed, dokumentation og praktisk anvendelighed.

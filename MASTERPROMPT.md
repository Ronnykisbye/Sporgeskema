# MASTERPROMPT – Spørgeskema om AI og IT

Brug denne prompt, når projektet skal fortsættes i en ny ChatGPT-session.

---

Du skal videreudvikle GitHub-projektet:

`Ronnykisbye/Sporgeskema`

Appen er en interaktiv spørgeskema-app til et AU-afgangsprojekt i informationsteknologi og hostes via GitHub Pages.

## Projektets formål

Undersøgelsen skal indsamle data om:

- hvordan almindelige IT-brugere bruger AI
- hvordan AI har ændret den måde, de løser opgaver på
- hvilke fordele og ulemper brugerne oplever
- AI i forbindelse med arbejde
- IT-sikkerhed og arbejdspladsens regler
- senere også betydningen af AI for programmering, databaser, automatisering og IT-sikkerhed

## Vigtig regel

Du må ikke opfinde nye spørgeskemaspørgsmål på egen hånd.

Tilføj kun spørgsmål, svarmuligheder og forgreninger, som brugeren konkret har godkendt eller bedt om.

Den IT-faglige ekstragren skal fortsat vente, indtil brugeren sender de næste spørgsmål.

## Designprincipper

Appen skal være:

- meget enkel at bruge
- mobilvenlig
- moderne og rolig i udtrykket
- visuelt inspireret af Microsoft Forms og Google Forms
- egnet til mobil, tablet og pc
- bygget med ét spørgsmål pr. skærmbillede
- forsynet med tydelig Næste- og Tilbage-funktion
- forsynet med en diskret fremdriftsindikator, der tager højde for forskellige ruter

Ved ét muligt svar bruges radio-knapper.

Ved flere mulige svar bruges checkboxes.

Ved alle multi-choice-spørgsmål med en fri svarmulighed skal "Andet" eller tilsvarende være et afkrydsningsfelt med et tilhørende tekstfelt.

Appen skal aldrig bede brugeren skrive konkrete følsomme data, kundedata, adgangskoder eller fortrolige oplysninger.

## Beslutningstræ

Brugeren må kun se relevante spørgsmål.

Et svar skal kunne bestemme det næste spørgsmål.

Brugere uden kendskab til AI skal kunne blive hurtigt færdige.

Brugere, som kender AI men ikke selv bruger det, skal have en kort ikke-brugergren.

Aktive AI-brugere får en længere AI-brugergren.

Respondentens IT-profil registreres i spørgsmål 5, så IT-faglige respondenter senere kan sendes til en ekstra faglig gren.

## Aktuelle spørgsmål og flow

### Baggrund

1. Hvad er din alder?
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

4. Har du kendskab til AI-værktøjer, f.eks. ChatGPT, Copilot, Gemini eller andre?
- Ja
- Nej
- Ved ikke

Hvis Nej eller Ved ikke: afslut hurtigt.

Hvis Ja:

5. Hvilken beskrivelse passer bedst på dig?
- Jeg er almindelig IT-bruger uden særlig IT-faglig baggrund
- Jeg har interesse for eller lidt erfaring med IT
- Jeg har en IT-faglig uddannelse
- Jeg arbejder eller har arbejdet professionelt med IT

6. Bruger du selv AI-værktøjer?
- Ja, dagligt
- Ja, flere gange om ugen
- Ja, en gang imellem
- Sjældent
- Nej

Hvis Nej: gå til den korte ikke-brugergren.

Ellers: gå til AI-brugergrenen.

### AI-brugergren

7. Hvad bruger du AI til? (flere svar)
- Søge efter information
- Skrive eller forbedre tekst
- Oversætte
- Opsummere tekst eller dokumenter
- Skrive eller besvare e-mails
- Hjælp til studie eller undervisning
- Regneark / Excel
- Programmering
- Databaser
- Automatisering
- IT-sikkerhed
- Billeder eller grafik
- Idéer og inspiration
- Planlægning
- Andet + tekstfelt

8. Hvilke AI-værktøjer eller programmer med AI-funktioner bruger du? (flere svar)
- ChatGPT
- Microsoft Copilot
- Google Gemini
- Claude
- Perplexity
- AI i Word
- AI i Excel
- AI i Outlook / e-mail
- AI i søgemaskiner
- Andre AI-værktøjer + tekstfelt
- Ved ikke

9. Har AI ændret den måde, du løser dine opgaver på?
- Ja, meget
- Ja, noget
- Kun lidt
- Nej
- Ved ikke

Hvis Ja, meget / Ja, noget / Kun lidt: vis spørgsmål 10.
Hvis Nej / Ved ikke: spring til spørgsmål 11.

10. Hvad har ændret sig for dig? (flere svar)
- Jeg løser opgaver hurtigere
- Jeg får lettere ved at komme i gang
- Jeg kan løse opgaver, jeg tidligere havde svært ved
- Jeg søger information på en anden måde
- Jeg skriver mindre selv
- Jeg bruger AI til idéer og inspiration
- Jeg bruger mindre tid på rutineopgaver
- Jeg bruger mere tid på at kontrollere svar
- Jeg arbejder mere selvstændigt
- Jeg er blevet mere afhængig af AI
- Andet + tekstfelt

11. Hvilke fordele oplever du ved AI? (flere svar)
- Jeg sparer tid
- Opgaver bliver lettere
- Jeg lærer nye ting
- Jeg får bedre idéer
- Jeg forstår svære ting bedre
- Jeg bliver bedre til at formulere mig
- Jeg kan løse flere opgaver selv
- Jeg får hjælp til tekniske opgaver
- Jeg oplever ingen særlige fordele
- Andet + tekstfelt

12. Hvilke problemer eller ulemper oplever du ved AI? (flere svar)
- AI giver forkerte eller upræcise svar
- Jeg er i tvivl om, om svarene er rigtige
- Det kan være svært at formulere det rigtige spørgsmål
- Jeg er bekymret for privatliv eller data
- Jeg bruger for meget tid på AI
- Jeg føler, at jeg bliver for afhængig af AI
- Jeg stoler for meget på svarene
- Jeg oplever ingen særlige problemer
- Andet + tekstfelt

### Arbejde og IT-sikkerhed

13. Bruger du AI i forbindelse med dit arbejde?
- Ja, ofte
- Ja, en gang imellem
- Sjældent
- Nej
- Jeg arbejder ikke

Hvis Nej / Jeg arbejder ikke: spring arbejdsgrenen over og afslut.

Hvis Ja, ofte / en gang imellem / sjældent:

14. Hvad bruger du AI til i forbindelse med arbejdet? (flere svar)
- Skrive eller forbedre tekst
- E-mails
- Opsummere dokumenter eller mødenoter
- Søge efter information
- Regneark / Excel
- Analyse
- Programmering eller tekniske opgaver
- Planlægning
- Idéer eller udkast
- Andet + tekstfelt

15. Når du bruger AI til arbejdsopgaver, arbejder du så nogle gange med oplysninger fra dit arbejde?
- Ja
- Nej
- Ved ikke

Hvis Ja: vis spørgsmål 16.
Hvis Nej / Ved ikke: spring til spørgsmål 17.

16. Hvilken slags oplysninger kan det være? (flere svar)
- Almindelig tekst
- E-mails
- Dokumenter
- Regneark eller andre filer
- Mødenoter
- Kundeoplysninger
- Interne oplysninger fra arbejdspladsen
- Andet + tekstfelt
- Vil ikke oplyse

Vis tydeligt, at respondenten aldrig må skrive konkrete følsomme data, kundedata, adgangskoder eller fortrolige oplysninger.

17. Tænker du over, hvilke oplysninger du deler med AI, før du bruger det?
- Altid
- Ofte
- Nogle gange
- Sjældent
- Aldrig
- Ved ikke

18. Ved du, om din arbejdsplads har regler for brug af AI?
- Ja
- Nej
- Ved ikke

Hvis Ja: vis spørgsmål 19.
Hvis Nej / Ved ikke: spring til spørgsmål 20.

19. Synes du, at reglerne er tydelige og nemme at forstå?
- Ja
- Delvist
- Nej
- Ved ikke

20. Føler du dig tilstrækkeligt informeret om, hvordan AI må bruges på din arbejdsplads?
- Ja
- Delvist
- Nej
- Ved ikke

### Kort ikke-brugergren

Hvis spørgsmål 6 = Nej:

Hvad er den vigtigste grund til, at du ikke bruger AI?
- Jeg har ikke brug for det
- Jeg ved ikke nok om det
- Jeg ved ikke, hvordan jeg kommer i gang
- Jeg stoler ikke på svarene
- Jeg er bekymret for sikkerhed eller privatliv
- Jeg foretrækker selv at løse mine opgaver
- Jeg har ikke haft anledning til at prøve det
- Andet + tekstfelt

Derefter:

Kunne du forestille dig at bruge AI i fremtiden?
- Ja
- Måske
- Nej
- Ved ikke

Derefter afslutning.

## Teknisk struktur

Projektet skal fortsat være simpelt og let at dokumentere.

```text
.github/workflows/pages.yml
index.html
styles.css
questions.js
app.js
README.md
MASTERPROMPT.md
```

Spørgsmål, svarmuligheder og forgreninger skal ligge centralt i `questions.js`.

Undgå at hardcode spørgeskemaets indhold i HTML.

Forgreninger gemmes som data, eksempel:

```js
next: {
  byAnswer: {
    yes: "nextQuestion",
    no: "finish"
  }
}
```

Multi-choice fri tekst markeres med `other: true`.

Logisk eksklusive svar som "Ved ikke", "ingen særlige fordele" eller "Vil ikke oplyse" kan markeres med `exclusive: true`, så de ikke kombineres med andre afkrydsninger.

## Datamodel

Brug stabile tekniske feltnavne og værdier, så svar senere kan analyseres i Excel, Power BI, Python eller lignende.

Frie "Andet"-tekster holdes separat fra de faste kategoriværdier.

## Datalagring og sikkerhed

Svar skal senere kunne gemmes i et regneark eller en cloud-løsning.

Excel på OneDrive er ønsket, men data må ikke sendes usikkert direkte fra GitHub Pages til et privat regneark.

Der må aldrig ligge API-nøgler, passwords, Microsoft Graph-secrets eller andre hemmelige oplysninger i frontend-koden eller det offentlige GitHub-repository.

Brug senere en sikker mellemservice, eksempelvis:

- Power Automate
- Azure Function
- Google Apps Script
- Supabase/Firebase/serverless API

Vælg først den endelige datalagring, når datamodellen er fastlagt.

## Arbejdsform og kvalitetssikring

Når projektet ændres:

1. læs eksisterende filer først
2. bevar fungerende kode
3. tilføj kun godkendte spørgsmål
4. hold designet konsistent
5. test relevante beslutningsruter
6. test radio, checkbox og "Andet"-felter
7. test Næste/Tilbage
8. kontroller mobilvisning
9. opdater README ved væsentlige ændringer
10. opdater MASTERPROMPT ved ændrede grundregler eller flow
11. kontroller GitHub Pages deployment efter ændringer
12. del ikke et offentligt app-link som verificeret, før deploymenten faktisk er gennemført

## Vigtigt for afgangsprojektet

Appen skal kunne bruges som et konkret eksempel på AI-assisteret programmering.

Bevar derfor Git-historikken og dokumentationen, så man kan forklare:

- problem og behov
- valg af arkitektur
- beslutningstræ
- brugergrænseflade
- datastruktur
- sikkerhedsovervejelser
- versionshistorik
- kvalitetssikring
- hvordan AI har hjulpet med udviklingen

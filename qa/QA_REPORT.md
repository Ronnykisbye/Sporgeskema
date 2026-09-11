# QA-rapport – Spørgeskema om AI og IT

Dato: 2026-09-11

## Rettelser

- Q4 går altid til Q5.
- Først efter Q5 forgrenes der: Q4=Ja -> Q6; Q4=Nej/Ved ikke -> K1.
- Kun `itProfile=professional` åbner IT-ekstragren.
- Tilbage-ruten bruger faktisk historik.
- Når et tidligere svar ændres, fjernes svar på spørgsmål, der ikke længere er nåelige på den nye rute.
- `Andet` kræver tekst og teksten slettes, når `Andet` fravælges.
- Eksklusive multivalg fjerner modstridende valg.
- Lokal kladde genindlæses i stedet for at blive slettet ved opstart.
- Central kladde er forberedt som upsert med samme `session_id`, `status=incomplete/completed` og `updated_at`.
- Slutkvittering kræver serverbekræftelse via statusopslag; en opaque `no-cors` POST alene regnes ikke som bevis.
- E-mail gemmes fortsat separat og indeholder ikke surveyens `session_id` eller svar.
- TEST-rækker markeres `TEST - MÅ IKKE BRUGES`.
- Personlige invitationslinks bruger anonyme tokens; normal token er single-use, TEST-token kan genbruges.

## Hovedruter

| Test | Forventet hovedrute | Faktisk hovedrute | Status |
|---|---|---|---|
| A Almindelig + kender AI + bruger AI | 1-5, 6-9, 11-13, slut (valg kan indsætte Q10/arbejdsgren) | Matcher | PASS |
| B Almindelig + kender AI + bruger ikke AI | 1-5, 6, N1, N2, slut | Matcher | PASS |
| C Almindelig + kender ikke AI | 1-5, K1, K2, slut | Matcher | PASS |
| D Almindelig + Ved ikke om AI | 1-5, K1, K2, slut | Matcher | PASS |
| E IT-faglig + kender AI + bruger AI | 1-5, 6-13, IT-kontrol, 21-31 efter relevante spring | Matcher | PASS |
| F IT-faglig + kender AI + bruger ikke AI | 1-5, 6, N1, N2, 27-31 efter relevante spring | Matcher | PASS |
| G IT-faglig + kender ikke AI | 1-5, K1, K2, slut | Matcher godkendt K-gren | PASS |
| H AI-bruger + bruger AI på arbejde | Q13 -> Q14-Q20 efter relevante spring | Matcher | PASS |
| I AI-bruger + bruger ikke AI på arbejde | Q13=Nej -> IT-kontrol/slut | Matcher | PASS |
| J AI-bruger + arbejder ikke | Q13=Jeg arbejder ikke -> IT-kontrol/slut | Matcher | PASS |
| K Arbejdsbruger + bruger arbejdsdata | Q15=Ja -> Q16 -> Q17 | Matcher | PASS |
| L Arbejdsbruger + bruger ikke arbejdsdata | Q15=Nej -> Q17 | Matcher | PASS |
| M Kender virksomhedens AI-regler | Q18=Ja -> Q19 -> Q20 | Matcher | PASS |
| N Kender ikke reglerne | Q18=Nej/Ved ikke -> Q20 | Matcher | PASS |
| O IT-faglig + bruger AI i IT-opgaver | Q22=Ja -> Q23-Q25, evt. Q26 -> Q27 | Matcher | PASS |
| P IT-faglig + bruger ikke AI i IT-opgaver | Q22=Nej -> Q27 | Matcher | PASS |
| Q IT-faglig + AI har ændret arbejdsmetoden | Q25=Ja -> Q26 -> Q27 | Matcher | PASS |
| R IT-faglig + AI har ikke ændret arbejdsmetoden | Q25=Nej/Ved ikke -> Q27 | Matcher | PASS |
| S Teknisk vidensbehov ændret | Q29=mindre/mere/begge -> Q30 -> Q31 | Matcher | PASS |
| T Teknisk vidensbehov ikke ændret | Q29=Nej/Ved ikke -> Q31 | Matcher | PASS |

## Særlige tests

- Grenrensning: Q13 blev først sat til Ja med svar i Q14-Q20 og derefter ændret til Nej. Q14-Q20 blev fjernet fra payload. PASS.
- Q4/Q5: Nej og Ved ikke på Q4 går begge gennem Q5 før K1. PASS.
- IT-profil: kun `professional` åbner IT-grene. PASS.
- `Andet`: valideringskode kræver ikke-tom tekst, og fravalg nulstiller tekstfelt/data. PASS (kode/unit).
- Eksklusive svar: handleren fjerner andre valg, når et eksklusivt svar vælges, og fjerner eksklusivt svar, når et almindeligt valg vælges. PASS (kode/unit).
- Usete spørgsmål: payload bygges med tom værdi for spørgsmål uden svar. PASS (kode/unit).
- Draft resume: eksisterende gyldig lokal draft indlæses med samme session_id/currentId/history. PASS (kode/unit).
- E-mail: HTML5 email-validering bruges før afsendelse; e-mail-backend er separat. PASS (kode/unit).

## Backend-aktivering kræves før pilot

Frontend v3 forventer den nye Apps Script-protokol. Kilderne ligger i:
- `backend/AppsScript_Svar.gs`
- `backend/AppsScript_Email.gs`

De skal indsættes i de to eksisterende Apps Script-projekter og de eksisterende Web App-deployments skal opdateres til ny version. Før dette er gjort, vil appen med vilje ikke vise "Dit svar er registreret", fordi den gamle backend ikke kan levere den nye serverbekræftelse.

## Manuelle pilottests efter backend-aktivering

- Android: Chrome og Messenger indbygget browser.
- iPhone/iPad: Safari og Messenger indbygget browser.
- Windows/macOS: Chrome/Edge/Safari relevant.
- Afbryd midtvejs, luk fanen, åbn samme invitationslink igen og kontroller genoptagelse.
- Forsøg at åbne samme NORMAL-link fra en anden browser efter første session er startet/afsluttet; serveren skal afvise den anden session.
- Kontroller at TEST-link kan gentages, og at alle dets rækker er markeret TEST.

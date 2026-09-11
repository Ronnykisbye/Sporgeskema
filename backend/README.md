# Aktivering af sikker backend

## Svar-arket

1. Åbn `AU_AI_Spoergeskema_Svar` -> Udvidelser -> Apps Script.
2. Erstat indholdet i `Code.gs` med `backend/AppsScript_Svar.gs` fra dette repository.
3. Gem.
4. Implementer -> Administrer implementeringer -> rediger den eksisterende Web App -> vælg Ny version -> Implementer.
5. Behold samme adgang: Udfør som mig / Alle.
6. Det eksisterende `/exec`-link skal fortsat være det samme.

Backend bruger fanen `Adgang`. NORMAL-token bindes til første `session_id` og kan kun fuldføres af den session. TEST-token kan genbruges.

## Email-arket

1. Åbn `AU_AI_Resultat_Email` -> Udvidelser -> Apps Script.
2. Erstat `Code.gs` med `backend/AppsScript_Email.gs`.
3. Gem og opdater den eksisterende Web App til Ny version.

Email-backend gemmer kun email/request_id/status/testmarkering og modtager ikke spørgeskemaets session_id eller svar.

## Kontrol

Brug TEST-linket fra fanen `Adgang`. Når backend er korrekt aktiveret, kan frontend bekræfte `completed` via statusopslag og viser først derefter slutsiden.

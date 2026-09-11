# Aktivering af sikker backend – V4

## Svar-arket

1. Åbn `AU_AI_Spoergeskema_Svar` -> Udvidelser -> Apps Script.
2. Erstat hele indholdet i `Code.gs` med `backend/AppsScript_Svar_v4.gs` fra dette repository.
3. Gem.
4. Implementer -> Administrer implementeringer -> rediger den eksisterende Web App -> vælg Ny version -> Implementer.
5. Behold samme adgang: Udfør som mig / Alle.
6. Det eksisterende `/exec`-link skal fortsat være det samme.

V4 svarer på `survey_ping` med `protocol: 4`. Frontend sender ingen central autosave, før dette er bekræftet. NORMAL-token bindes til den første anonyme `session_id` og kan ikke bruges af en ny session. TEST-token kan genbruges.

## Email-arket

1. Åbn `AU_AI_Resultat_Email` -> Udvidelser -> Apps Script.
2. Erstat hele `Code.gs` med `backend/AppsScript_Email_v4.gs`.
3. Gem og opdater den eksisterende Web App til Ny version.

V4 svarer på `email_ping` med `protocol: 4`. Email-backend gemmer kun email/request_id/status/testmarkering og modtager ikke spørgeskemaets session_id eller svar.

## Kontrol

Brug TEST-linket fra fanen `Adgang`. Når begge backends er korrekt aktiveret, kan frontend bekræfte lagringen via statusopslag og viser først derefter slutsiden.

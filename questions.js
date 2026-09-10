// Spørgsmålene ligger centralt som data, så tekst, svar og forgreninger kan ændres uden at ændre app-motoren.
// type: "single" = ét svar (radio), "multi" = flere svar (checkbox).
// next kan være et id eller et objekt med byAnswer/default til beslutningstræ.
// På multi-spørgsmål markeres en fri svarmulighed med other: true.
// En logisk eksklusiv multi-mulighed (fx "Ved ikke") kan markeres med exclusive: true.

window.SURVEY_CONFIG = {
  startQuestionId: "age",
  finishId: "finish",
  completionText: "Tak for din hjælp og for den tid, du har brugt på undersøgelsen. Dit svar er nu registreret og vil blive brugt som en del af mit afgangsprojekt om AI og brugen af AI i IT og hverdagen.",
  resultInterest: {
    question: "Vil du gerne modtage en kort opsummering af resultatet, når undersøgelsen er afsluttet?",
    privacyText: "Din e-mail gemmes separat og kan ikke kobles til dine svar. Den bruges kun til at sende resultatet af undersøgelsen."
  },
  questions: {
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
    },

    gender: {
      number: 2,
      section: "Baggrund",
      text: "Køn",
      type: "single",
      options: [
        { value: "male", label: "Mand" },
        { value: "female", label: "Kvinde" },
        { value: "noAnswer", label: "Vil ikke oplyse" }
      ],
      next: "denmark"
    },

    denmark: {
      number: 3,
      section: "Baggrund",
      text: "Bor du i Danmark?",
      type: "single",
      options: [
        { value: "yes", label: "Ja" },
        { value: "no", label: "Nej" }
      ],
      next: "aiKnowledge"
    },

    aiKnowledge: {
      number: 4,
      section: "AI-kendskab",
      text: "Har du kendskab til AI-værktøjer, f.eks. ChatGPT, Copilot, Gemini eller andre?",
      type: "single",
      options: [
        { value: "yes", label: "Ja" },
        { value: "no", label: "Nej" },
        { value: "dontKnow", label: "Ved ikke" }
      ],
      next: {
        byAnswer: {
          yes: "itProfile",
          no: "finish",
          dontKnow: "finish"
        }
      }
    },

    itProfile: {
      number: 5,
      section: "Baggrund",
      text: "Hvilken beskrivelse passer bedst på dig?",
      type: "single",
      options: [
        { value: "ordinary", label: "Jeg har ingen særlig IT-faglig baggrund" },
        { value: "interested", label: "Jeg har interesse for eller noget erfaring med IT, men arbejder ikke professionelt med IT" },
        { value: "professional", label: "Jeg har IT-faglig uddannelse og/eller arbejder eller har arbejdet professionelt med IT" }
      ],
      next: "aiUse"
    },

    aiUse: {
      number: 6,
      section: "Brug af AI",
      text: "Bruger du selv AI-værktøjer?",
      type: "single",
      options: [
        { value: "daily", label: "Ja, dagligt" },
        { value: "weekly", label: "Ja, flere gange om ugen" },
        { value: "sometimes", label: "Ja, en gang imellem" },
        { value: "rarely", label: "Sjældent" },
        { value: "no", label: "Nej" }
      ],
      next: {
        byAnswer: {
          daily: "aiUses",
          weekly: "aiUses",
          sometimes: "aiUses",
          rarely: "aiUses",
          no: "nonUserReason"
        }
      }
    },

    aiUses: {
      number: 7,
      section: "AI-bruger",
      text: "Hvad bruger du AI til?",
      help: "Du kan vælge flere svar.",
      type: "multi",
      options: [
        { value: "information", label: "Søge efter information" },
        { value: "writing", label: "Skrive eller forbedre tekst" },
        { value: "translation", label: "Oversætte" },
        { value: "summaries", label: "Opsummere tekst eller dokumenter" },
        { value: "email", label: "Skrive eller besvare e-mails" },
        { value: "study", label: "Hjælp til studie eller undervisning" },
        { value: "excel", label: "Regneark / Excel" },
        { value: "programming", label: "Programmering" },
        { value: "databases", label: "Databaser" },
        { value: "automation", label: "Automatisering" },
        { value: "security", label: "IT-sikkerhed" },
        { value: "images", label: "Billeder eller grafik" },
        { value: "ideas", label: "Idéer og inspiration" },
        { value: "planning", label: "Planlægning" },
        { value: "other", label: "Andet", other: true }
      ],
      next: "aiTools"
    },

    aiTools: {
      number: 8,
      section: "AI-bruger",
      text: "Hvilke AI-værktøjer eller programmer med AI-funktioner bruger du?",
      help: "Du kan vælge flere svar.",
      type: "multi",
      options: [
        { value: "chatgpt", label: "ChatGPT" },
        { value: "copilot", label: "Microsoft Copilot" },
        { value: "gemini", label: "Google Gemini" },
        { value: "claude", label: "Claude" },
        { value: "perplexity", label: "Perplexity" },
        { value: "word", label: "AI-funktioner i Word" },
        { value: "excel", label: "AI-funktioner i Excel" },
        { value: "outlook", label: "AI-funktioner i Outlook / e-mail" },
        { value: "search", label: "AI i søgemaskiner" },
        { value: "other", label: "Andre AI-værktøjer", other: true },
        { value: "dontKnow", label: "Jeg ved ikke, om de programmer jeg bruger indeholder AI", exclusive: true }
      ],
      next: "aiChanged"
    },

    aiChanged: {
      number: 9,
      section: "AI-bruger",
      text: "Har AI ændret den måde, du løser dine opgaver på?",
      type: "single",
      options: [
        { value: "much", label: "Ja, meget" },
        { value: "some", label: "Ja, noget" },
        { value: "little", label: "Kun lidt" },
        { value: "no", label: "Nej" },
        { value: "dontKnow", label: "Ved ikke" }
      ],
      next: {
        byAnswer: {
          much: "changes",
          some: "changes",
          little: "changes",
          no: "benefits",
          dontKnow: "benefits"
        }
      }
    },

    changes: {
      number: 10,
      section: "AI-bruger",
      text: "Hvad har ændret sig for dig?",
      help: "Du kan vælge flere svar.",
      type: "multi",
      options: [
        { value: "faster", label: "Jeg løser opgaver hurtigere" },
        { value: "start", label: "Jeg får lettere ved at komme i gang" },
        { value: "hardTasks", label: "Jeg kan løse opgaver, jeg tidligere havde svært ved" },
        { value: "searchDifferent", label: "Jeg søger information på en anden måde" },
        { value: "writeLess", label: "Jeg skriver mindre selv" },
        { value: "ideas", label: "Jeg bruger AI til idéer og inspiration" },
        { value: "lessRoutine", label: "Jeg bruger mindre tid på rutineopgaver" },
        { value: "moreChecking", label: "Jeg bruger mere tid på at kontrollere svar" },
        { value: "independent", label: "Jeg arbejder mere selvstændigt" },
        { value: "dependent", label: "Jeg er blevet mere afhængig af AI" },
        { value: "other", label: "Andet", other: true }
      ],
      next: "benefits"
    },

    benefits: {
      number: 11,
      section: "AI-bruger",
      text: "Hvilke fordele oplever du ved AI?",
      help: "Du kan vælge flere svar.",
      type: "multi",
      options: [
        { value: "time", label: "Jeg sparer tid" },
        { value: "easier", label: "Opgaver bliver lettere" },
        { value: "learn", label: "Jeg lærer nye ting" },
        { value: "ideas", label: "Jeg får bedre idéer" },
        { value: "understand", label: "Jeg forstår svære ting bedre" },
        { value: "formulate", label: "Jeg bliver bedre til at formulere mig" },
        { value: "moreSelf", label: "Jeg kan løse flere opgaver selv" },
        { value: "technical", label: "Jeg får hjælp til tekniske opgaver" },
        { value: "none", label: "Jeg oplever ingen særlige fordele", exclusive: true },
        { value: "other", label: "Andet", other: true }
      ],
      next: "problems"
    },

    problems: {
      number: 12,
      section: "AI-bruger",
      text: "Hvilke problemer eller ulemper oplever du ved AI?",
      help: "Du kan vælge flere svar.",
      type: "multi",
      options: [
        { value: "wrong", label: "AI giver forkerte eller upræcise svar" },
        { value: "uncertain", label: "Jeg er i tvivl om, om svarene er rigtige" },
        { value: "prompting", label: "Det kan være svært at formulere det rigtige spørgsmål" },
        { value: "privacy", label: "Jeg er bekymret for privatliv eller data" },
        { value: "tooMuchTime", label: "Jeg bruger for meget tid på AI" },
        { value: "dependent", label: "Jeg kan blive for afhængig af AI" },
        { value: "trust", label: "Det kan være svært at vurdere, hvornår jeg kan stole på svarene" },
        { value: "none", label: "Jeg oplever ingen særlige problemer", exclusive: true },
        { value: "other", label: "Andet", other: true }
      ],
      next: "workUse"
    },

    workUse: {
      number: 13,
      section: "Arbejde og IT-sikkerhed",
      text: "Bruger du AI i forbindelse med dit arbejde?",
      type: "single",
      options: [
        { value: "often", label: "Ja, ofte" },
        { value: "sometimes", label: "Ja, en gang imellem" },
        { value: "rarely", label: "Sjældent" },
        { value: "no", label: "Nej" },
        { value: "notWorking", label: "Jeg arbejder ikke" }
      ],
      next: {
        byAnswer: {
          often: "workTasks",
          sometimes: "workTasks",
          rarely: "workTasks",
          no: "finish",
          notWorking: "finish"
        }
      }
    },

    workTasks: {
      number: 14,
      section: "Arbejde og IT-sikkerhed",
      text: "Hvad bruger du AI til i forbindelse med arbejdet?",
      help: "Du kan vælge flere svar.",
      type: "multi",
      options: [
        { value: "writing", label: "Skrive eller forbedre tekst" },
        { value: "email", label: "E-mails" },
        { value: "summaries", label: "Opsummere dokumenter eller mødenoter" },
        { value: "information", label: "Søge efter information" },
        { value: "excel", label: "Regneark / Excel" },
        { value: "analysis", label: "Analyse" },
        { value: "technical", label: "Programmering eller tekniske opgaver" },
        { value: "planning", label: "Planlægning" },
        { value: "ideas", label: "Idéer eller udkast" },
        { value: "other", label: "Andet", other: true }
      ],
      next: "workData"
    },

    workData: {
      number: 15,
      section: "Arbejde og IT-sikkerhed",
      text: "Når du bruger AI til arbejdsopgaver, arbejder du så nogle gange med oplysninger fra dit arbejde?",
      type: "single",
      options: [
        { value: "yes", label: "Ja" },
        { value: "no", label: "Nej" },
        { value: "dontKnow", label: "Ved ikke" }
      ],
      next: {
        byAnswer: {
          yes: "workDataTypes",
          no: "dataAwareness",
          dontKnow: "dataAwareness"
        }
      }
    },

    workDataTypes: {
      number: 16,
      section: "Arbejde og IT-sikkerhed",
      text: "Hvilken slags oplysninger kan det være?",
      help: "Du kan vælge flere svar. Skriv aldrig konkrete følsomme data, kundedata, adgangskoder eller fortrolige oplysninger i spørgeskemaet.",
      type: "multi",
      options: [
        { value: "text", label: "Almindelig tekst" },
        { value: "email", label: "E-mails" },
        { value: "documents", label: "Dokumenter" },
        { value: "files", label: "Regneark eller andre filer" },
        { value: "meetingNotes", label: "Mødenoter" },
        { value: "customer", label: "Kundeoplysninger" },
        { value: "internal", label: "Interne oplysninger fra arbejdspladsen" },
        { value: "other", label: "Andet", other: true },
        { value: "noAnswer", label: "Vil ikke oplyse", exclusive: true }
      ],
      next: "dataAwareness"
    },

    dataAwareness: {
      number: 17,
      section: "Arbejde og IT-sikkerhed",
      text: "Tænker du over, hvilke oplysninger du deler med AI, før du bruger det?",
      type: "single",
      options: [
        { value: "always", label: "Altid" },
        { value: "often", label: "Ofte" },
        { value: "sometimes", label: "Nogle gange" },
        { value: "rarely", label: "Sjældent" },
        { value: "never", label: "Aldrig" },
        { value: "dontKnow", label: "Ved ikke" }
      ],
      next: "workRules"
    },

    workRules: {
      number: 18,
      section: "Arbejde og IT-sikkerhed",
      text: "Ved du, om din arbejdsplads har regler for brug af AI?",
      type: "single",
      options: [
        { value: "yes", label: "Ja" },
        { value: "no", label: "Nej" },
        { value: "dontKnow", label: "Ved ikke" }
      ],
      next: {
        byAnswer: {
          yes: "rulesClear",
          no: "informed",
          dontKnow: "informed"
        }
      }
    },

    rulesClear: {
      number: 19,
      section: "Arbejde og IT-sikkerhed",
      text: "Synes du, at reglerne er tydelige og nemme at forstå?",
      type: "single",
      options: [
        { value: "yes", label: "Ja" },
        { value: "partial", label: "Delvist" },
        { value: "no", label: "Nej" },
        { value: "dontKnow", label: "Ved ikke" }
      ],
      next: "informed"
    },

    informed: {
      number: 20,
      section: "Arbejde og IT-sikkerhed",
      text: "Føler du dig tilstrækkeligt informeret om, hvordan AI må bruges på din arbejdsplads?",
      type: "single",
      options: [
        { value: "yes", label: "Ja" },
        { value: "partial", label: "Delvist" },
        { value: "no", label: "Nej" },
        { value: "dontKnow", label: "Ved ikke" }
      ],
      next: "finish"
    },

    nonUserReason: {
      section: "Kort rute – bruger ikke AI",
      text: "Hvad er den vigtigste grund til, at du ikke bruger AI?",
      type: "single",
      options: [
        { value: "noNeed", label: "Jeg har ikke brug for det" },
        { value: "notEnoughKnowledge", label: "Jeg ved ikke nok om det" },
        { value: "dontKnowHow", label: "Jeg ved ikke, hvordan jeg kommer i gang" },
        { value: "dontTrust", label: "Jeg stoler ikke på svarene" },
        { value: "securityPrivacy", label: "Jeg er bekymret for sikkerhed eller privatliv" },
        { value: "preferSelf", label: "Jeg foretrækker selv at løse mine opgaver" },
        { value: "notTried", label: "Jeg har ikke haft anledning til at prøve det" },
        { value: "other", label: "Andet", other: true }
      ],
      next: "futureUse"
    },

    futureUse: {
      section: "Kort rute – bruger ikke AI",
      text: "Kunne du forestille dig at bruge AI i fremtiden?",
      type: "single",
      options: [
        { value: "yes", label: "Ja" },
        { value: "maybe", label: "Måske" },
        { value: "no", label: "Nej" },
        { value: "dontKnow", label: "Ved ikke" }
      ],
      next: "finish"
    }
  },

  // Disse IT-faglige spørgsmål er modtaget, men aktiveres først når spørgsmål 21, 22, 25-27 og 31 er leveret.
  // På den måde opfinder appen ikke manglende led i beslutningstræet.
  pendingITQuestions: {
    q23: {
      number: 23,
      optionsToAdd: [
        "Opsætning og konfiguration af pc'er, software, netværk eller andre IT-systemer"
      ]
    },
    q24: {
      number: 24,
      optionsToAdd: [
        "Hjælp til opsætning og konfiguration"
      ]
    },
    q28: {
      number: 28,
      text: "Hvilke kompetencer mener du bliver vigtigere, hvis nogen, når AI bruges mere i IT-arbejde?",
      type: "multi",
      options: [
        { value: "understandProblem", label: "Forstå problemet" },
        { value: "describeResult", label: "Beskrive det ønskede resultat" },
        { value: "requirements", label: "Opstille tydelige krav" },
        { value: "askAI", label: "Stille gode spørgsmål til AI" },
        { value: "validateAI", label: "Vurdere om AI's svar er korrekt" },
        { value: "testing", label: "Test og kvalitetssikring" },
        { value: "security", label: "IT-sikkerhed" },
        { value: "codeSystems", label: "Forståelse af kode og systemer" },
        { value: "criticalThinking", label: "Kritisk tænkning" },
        { value: "documentation", label: "Dokumentation" },
        { value: "none", label: "Ingen af disse bliver vigtigere", exclusive: true },
        { value: "other", label: "Andet", other: true }
      ]
    },
    q29: {
      number: 29,
      text: "Har AI efter din vurdering ændret, hvor meget teknisk viden der kræves for at løse visse IT-opgaver?",
      type: "single",
      options: [
        { value: "less", label: "Ja, der kræves mindre teknisk viden i nogle opgaver" },
        { value: "more", label: "Ja, der kræves mere teknisk viden i nogle opgaver" },
        { value: "both", label: "Begge dele - det afhænger af opgaven" },
        { value: "no", label: "Nej" },
        { value: "dontKnow", label: "Ved ikke" }
      ],
      plannedNext: {
        less: "q30",
        more: "q30",
        both: "q30",
        no: "q31",
        dontKnow: "q31"
      }
    },
    q30: {
      number: 30,
      text: "Inden for hvilke områder oplever du især denne ændring?",
      type: "multi",
      options: [
        { value: "programming", label: "Programmering" },
        { value: "databases", label: "Databaser" },
        { value: "automation", label: "Automatisering" },
        { value: "security", label: "IT-sikkerhed" },
        { value: "troubleshooting", label: "Fejlfinding" },
        { value: "configuration", label: "Opsætning og konfiguration" },
        { value: "documentation", label: "Dokumentation" },
        { value: "other", label: "Andet", other: true }
      ]
    }
  }
};
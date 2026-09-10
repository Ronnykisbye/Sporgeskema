// Spørgsmålene ligger som data, så indhold og forgreninger kan ændres uden at ændre app-motoren.
// type: "single" = ét svar (radio), "multi" = flere svar (checkbox)
// next kan være et id eller en funktion, som vælger næste spørgsmål ud fra svarene.

window.SURVEY_CONFIG = {
  startQuestionId: "age",
  questions: {
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
    },

    gender: {
      section: "Baggrund",
      text: "Hvad er dit køn?",
      type: "single",
      options: [
        { value: "male", label: "Mand" },
        { value: "female", label: "Kvinde" },
        { value: "noAnswer", label: "Vil ikke oplyse" }
      ],
      next: "denmark"
    },

    denmark: {
      section: "Baggrund",
      text: "Bor du i Danmark?",
      type: "single",
      options: [
        { value: "yes", label: "Ja" },
        { value: "no", label: "Nej" }
      ],
      next: "itBackground"
    },

    itBackground: {
      section: "Baggrund",
      text: "Har du IT-faglig uddannelse eller arbejder du med IT?",
      type: "single",
      options: [
        { value: "yes", label: "Ja" },
        { value: "no", label: "Nej" }
      ],
      next: "aiKnowledge"
    },

    aiKnowledge: {
      section: "AI-kendskab",
      text: "Har du kendskab til AI-værktøjer, f.eks. ChatGPT, Copilot, Gemini eller andre?",
      type: "single",
      options: [
        { value: "yes", label: "Ja" },
        { value: "no", label: "Nej" },
        { value: "dontKnow", label: "Ved ikke" }
      ],
      next: (answers) => answers.aiKnowledge === "yes" ? "aiUse" : "nonUserReasonPlaceholder"
    },

    aiUse: {
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
      next: (answers) => answers.aiUse === "no" ? "nonUserReasonPlaceholder" : "activeUserPlaceholder"
    },

    // Midlertidige knudepunkter. Disse erstattes senere af de endelige spørgsmål.
    activeUserPlaceholder: {
      section: "Næste gren",
      text: "Aktiv AI-bruger",
      help: "Denne gren er forberedt til senere spørgsmål om anvendelse, værktøjer, ændrede arbejdsmetoder, fordele/ulemper, arbejde og IT-sikkerhed.",
      type: "single",
      options: [
        { value: "continue", label: "Fortsæt til foreløbig afslutning" }
      ],
      next: (answers) => answers.itBackground === "yes" ? "itBranchPlaceholder" : "finish"
    },

    nonUserReasonPlaceholder: {
      section: "Næste gren",
      text: "Kort rute for ikke-brugere",
      help: "Denne gren er forberedt til senere spørgsmål om årsager til ikke at bruge AI, mulig fremtidig brug og tilbageholdenhed.",
      type: "single",
      options: [
        { value: "continue", label: "Fortsæt til foreløbig afslutning" }
      ],
      next: (answers) => answers.itBackground === "yes" ? "itBranchPlaceholder" : "finish"
    },

    itBranchPlaceholder: {
      section: "IT-faglig gren",
      text: "IT-faglig baggrund registreret",
      help: "Denne gren er forberedt til senere spørgsmål om programmering, databaser, automatisering, IT-sikkerhed og fremtidige kompetencer.",
      type: "single",
      options: [
        { value: "continue", label: "Fortsæt til foreløbig afslutning" }
      ],
      next: "finish"
    }
  }
};

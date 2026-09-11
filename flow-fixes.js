(() => {
  const cfg = window.SURVEY_CONFIG;
  if (!cfg?.questions) return;

  // Q4 må aldrig springe Q5 over.
  cfg.questions.aiKnowledge.next = "itProfile";

  // Først efter Q5 vælges rute ud fra svaret på Q4.
  // app-v3.js fortolker KNOWLEDGE_BRANCH som:
  // Q4=Ja -> Q6, Q4=Nej/Ved ikke -> K1.
  cfg.questions.itProfile.next = "KNOWLEDGE_BRANCH";

  // K1/K2 følger den godkendte samlede logik og slutter efter K2.
  cfg.questions.learnMoreAi.next = "finish";
})();

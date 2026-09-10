(() => {
  const DRAFT_KEY = "sporgeskema:draft:v1";
  const COMPLETED_KEY = "sporgeskema:completed:v1";

  function createSessionId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }

  function saveDraft(payload) {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        ...payload,
        savedAt: new Date().toISOString()
      }));
      return true;
    } catch (error) {
      console.warn("Kunne ikke gemme lokal kladde", error);
      return false;
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("Kunne ikke læse lokal kladde", error);
      return null;
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.warn("Kunne ikke slette lokal kladde", error);
    }
  }

  async function submitFinal(payload) {
    // Udviklingsversion: gemmer kun lokalt. Når cloud-backend vælges,
    // erstattes denne funktion med et HTTPS-kald til den sikre mellemservice.
    try {
      localStorage.setItem(COMPLETED_KEY, JSON.stringify({
        ...payload,
        completedAt: new Date().toISOString()
      }));
      clearDraft();
      return { saved: true, centralSaved: false };
    } catch (error) {
      console.warn("Kunne ikke gemme afsluttet lokal besvarelse", error);
      return { saved: false, centralSaved: false };
    }
  }

  window.SURVEY_STORAGE = {
    createSessionId,
    saveDraft,
    loadDraft,
    clearDraft,
    submitFinal,
    mode: "local-development"
  };
})();
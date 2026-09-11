(() => {
  const DRAFT_KEY = "sporgeskema:draft:v1";
  const COMPLETED_KEY = "sporgeskema:completed:v1";
  const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbyNbhtQhvEgUXz1VS-jqzR_KqLKGr9RPeTvc5oYRVXVEQQByMyAopzN-5yVSzR0MYVs/exec";

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

  function buildSheetPayload(payload) {
    const data = {
      sessionId: payload.sessionId || "",
      completedAt: new Date().toISOString()
    };

    const questions = window.SURVEY_CONFIG?.questions || {};
    Object.keys(questions).forEach((id) => {
      const answer = payload.answers?.[id];
      data[id] = Array.isArray(answer) ? answer.join("; ") : (answer ?? "");

      const other = payload.otherText?.[id];
      data[`${id}_andet`] = other ? String(other).trim() : "";
    });

    return data;
  }

  async function submitFinal(payload) {
    const completedRecord = {
      ...payload,
      completedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(completedRecord));
    } catch (error) {
      console.warn("Kunne ikke gemme lokal sikkerhedskopi", error);
    }

    try {
      const sheetPayload = buildSheetPayload(payload);

      await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(sheetPayload)
      });

      clearDraft();
      return { saved: true, centralSaved: true };
    } catch (error) {
      console.error("Kunne ikke sende besvarelsen til Google Sheets", error);
      return { saved: true, centralSaved: false, error: String(error) };
    }
  }

  window.SURVEY_STORAGE = {
    createSessionId,
    saveDraft,
    loadDraft,
    clearDraft,
    submitFinal,
    mode: "google-sheets"
  };
})();
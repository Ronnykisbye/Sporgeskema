(() => {
  const DRAFT_KEY = "sporgeskema:draft:v1";
  const COMPLETED_KEY = "sporgeskema:completed:v1";
  const SUBMITTED_LOCK_KEY = "sporgeskema:submitted:v2";

  const ANSWERS_URL = "https://script.google.com/macros/s/AKfycbyNbhtQhvEgUXz1VS-jqzR_KqLKGr9RPeTvc5oYRVXVEQQByMyAopzN-5yVSzR0MYVs/exec";
  const EMAIL_URL = "https://script.google.com/macros/s/AKfycbzSUPG6tXFyekTHyC8lJ0DMRXb7sTNHhuMm8KXFA4fNcBqLUUgLmlRmeRUhQ9JO80nLFQ/exec";

  function createSessionId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }

  function saveDraft(payload) {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...payload, savedAt: new Date().toISOString() }));
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
    try { localStorage.removeItem(DRAFT_KEY); }
    catch (error) { console.warn("Kunne ikke slette lokal kladde", error); }
  }

  function hasCompleted() {
    try { return localStorage.getItem(SUBMITTED_LOCK_KEY) === "true"; }
    catch (error) { return false; }
  }

  function clearLocalDataKeepLock() {
    try {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(COMPLETED_KEY);
      localStorage.setItem(SUBMITTED_LOCK_KEY, "true");
      return true;
    } catch (error) {
      console.warn("Kunne ikke rydde lokale data", error);
      return false;
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
    const completedRecord = { ...payload, completedAt: new Date().toISOString() };

    try {
      const sheetPayload = buildSheetPayload(payload);
      await fetch(ANSWERS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(sheetPayload)
      });

      localStorage.setItem(COMPLETED_KEY, JSON.stringify(completedRecord));
      localStorage.setItem(SUBMITTED_LOCK_KEY, "true");
      clearDraft();
      return { saved: true, centralSaved: true };
    } catch (error) {
      console.error("Kunne ikke sende besvarelsen til Google Sheets", error);
      return { saved: false, centralSaved: false, error: String(error) };
    }
  }

  async function submitResultEmail(email) {
    const cleanEmail = String(email || "").trim();
    if (!cleanEmail) return { saved: false };

    const emailPayload = {
      request_id: createSessionId(),
      created_at: new Date().toISOString(),
      email: cleanEmail,
      consent_result_summary: "yes",
      source: "AU_AI_Spoergeskema",
      status: "requested"
    };

    try {
      await fetch(EMAIL_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(emailPayload)
      });
      return { saved: true };
    } catch (error) {
      console.error("Kunne ikke gemme e-mailønsket", error);
      return { saved: false, error: String(error) };
    }
  }

  window.SURVEY_STORAGE = {
    createSessionId,
    saveDraft,
    loadDraft,
    clearDraft,
    hasCompleted,
    clearLocalDataKeepLock,
    submitFinal,
    submitResultEmail,
    mode: "google-sheets"
  };
})();
(() => {
  const DRAFT_KEY = "sporgeskema:draft:v1";
  const COMPLETED_KEY = "sporgeskema:completed:v1";
  const SUBMITTED_LOCK_KEY = "sporgeskema:submitted:v2";
  const TEST_DRAFT_KEY = "sporgeskema:test:draft:v1";
  const TEST_COMPLETED_KEY = "sporgeskema:test:completed:v1";

  const ANSWERS_URL = "https://script.google.com/macros/s/AKfycbyNbhtQhvEgUXz1VS-jqzR_KqLKGr9RPeTvc5oYRVXVEQQByMyAopzN-5yVSzR0MYVs/exec";
  const EMAIL_URL = "https://script.google.com/macros/s/AKfycbzSUPG6tXFyekTHyC8lJ0DMRXb7sTNHhuMm8KXFA4fNcBqLUUgLmlRmeRUhQ9JO80nLFQ/exec";

  function isTestMode() {
    try {
      return new URLSearchParams(window.location.search).get("test") === "1";
    } catch (error) {
      return false;
    }
  }

  function getDraftKey() {
    return isTestMode() ? TEST_DRAFT_KEY : DRAFT_KEY;
  }

  function getCompletedKey() {
    return isTestMode() ? TEST_COMPLETED_KEY : COMPLETED_KEY;
  }

  function createSessionId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }

  function saveDraft(payload) {
    try {
      localStorage.setItem(getDraftKey(), JSON.stringify({ ...payload, savedAt: new Date().toISOString() }));
      return true;
    } catch (error) {
      console.warn("Kunne ikke gemme lokal kladde", error);
      return false;
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(getDraftKey());
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("Kunne ikke læse lokal kladde", error);
      return null;
    }
  }

  function clearDraft() {
    try { localStorage.removeItem(getDraftKey()); }
    catch (error) { console.warn("Kunne ikke slette lokal kladde", error); }
  }

  function hasCompleted() {
    if (isTestMode()) return false;
    try { return localStorage.getItem(SUBMITTED_LOCK_KEY) === "true"; }
    catch (error) { return false; }
  }

  function clearLocalDataKeepLock() {
    try {
      if (isTestMode()) {
        localStorage.removeItem(TEST_DRAFT_KEY);
        localStorage.removeItem(TEST_COMPLETED_KEY);
      } else {
        localStorage.removeItem(DRAFT_KEY);
        localStorage.removeItem(COMPLETED_KEY);
        localStorage.setItem(SUBMITTED_LOCK_KEY, "true");
      }
      return true;
    } catch (error) {
      console.warn("Kunne ikke rydde lokale data", error);
      return false;
    }
  }

  function buildSheetPayload(payload) {
    const data = {
      sessionId: payload.sessionId || "",
      completedAt: new Date().toISOString(),
      test_result: isTestMode() ? "TEST - MÅ IKKE BRUGES" : "NEJ - RIGTIG BESVARELSE"
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
      completedAt: new Date().toISOString(),
      test_result: isTestMode() ? "TEST - MÅ IKKE BRUGES" : "NEJ - RIGTIG BESVARELSE"
    };

    try {
      const sheetPayload = buildSheetPayload(payload);
      await fetch(ANSWERS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(sheetPayload)
      });

      localStorage.setItem(getCompletedKey(), JSON.stringify(completedRecord));
      if (!isTestMode()) localStorage.setItem(SUBMITTED_LOCK_KEY, "true");
      clearDraft();
      return { saved: true, centralSaved: true, testMode: isTestMode() };
    } catch (error) {
      console.error("Kunne ikke sende besvarelsen til Google Sheets", error);
      return { saved: false, centralSaved: false, error: String(error), testMode: isTestMode() };
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
      source: isTestMode() ? "AU_AI_Spoergeskema_TEST" : "AU_AI_Spoergeskema",
      status: "requested",
      test_result: isTestMode() ? "TEST - MÅ IKKE BRUGES" : "NEJ - RIGTIG BESVARELSE"
    };

    try {
      await fetch(EMAIL_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(emailPayload)
      });
      return { saved: true, testMode: isTestMode() };
    } catch (error) {
      console.error("Kunne ikke gemme e-mailønsket", error);
      return { saved: false, error: String(error), testMode: isTestMode() };
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
    isTestMode,
    mode: "google-sheets"
  };
})();
(() => {
  const config = window.SURVEY_CONFIG;
  const storage = window.SURVEY_STORAGE;
  const screen = document.getElementById("screen");
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");

  const state = {
    sessionId: null,
    started: false,
    currentId: null,
    answers: {},
    otherText: {},
    history: [],
    completed: false
  };

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showFooter() {
    backBtn.style.display = "";
    nextBtn.style.display = "";
  }

  function hideFooterButtons() {
    backBtn.style.display = "none";
    nextBtn.style.display = "none";
  }

  function isProfessional() {
    return state.answers.itProfile === "professional";
  }

  function resolveSpecialTarget(target) {
    if (target === "PROFILE_IT_OR_FINISH") {
      return isProfessional() ? "itExperience" : config.finishId;
    }
    if (target === "PROFILE_Q27_OR_FINISH") {
      return isProfessional() ? "itKnowledgeImportance" : config.finishId;
    }
    return target;
  }

  function resetState() {
    state.sessionId = storage?.createSessionId?.() || `session-${Date.now()}`;
    state.started = false;
    state.currentId = null;
    state.answers = {};
    state.otherText = {};
    state.history = [];
    state.completed = false;
    storage?.clearDraft?.();
  }

  function getPayload() {
    return {
      sessionId: state.sessionId,
      answers: { ...state.answers },
      otherText: { ...state.otherText },
      currentId: state.currentId,
      history: [...state.history]
    };
  }

  function autosaveDraft() {
    if (!state.started || state.completed) return;
    storage?.saveDraft?.(getPayload());
  }

  function clearAnswersAfterCurrent() {
    const allowed = new Set([...state.history, state.currentId]);
    Object.keys(state.answers).forEach((id) => {
      if (!allowed.has(id)) delete state.answers[id];
    });
    Object.keys(state.otherText).forEach((id) => {
      if (!allowed.has(id)) delete state.otherText[id];
    });
  }

  function renderWelcome() {
    showFooter();
    state.started = false;
    state.currentId = null;
    state.history = [];
    state.completed = false;

    screen.innerHTML = `
      <div class="welcome">
        <h2>Velkommen</h2>
        <p>Spørgeskemaet vises ét spørgsmål ad gangen og tilpasser sig dine svar.</p>
        <div class="info-box">
          Undervejs gemmes en anonym kladde lokalt i browseren. Når du afslutter spørgeskemaet, sendes din besvarelse til projektets Google Sheet.
        </div>
      </div>`;

    progressBar.style.width = "0%";
    progressText.textContent = "Klar til at starte";
    backBtn.disabled = true;
    nextBtn.disabled = false;
    nextBtn.textContent = "Start";
  }

  function addCloseButton(container) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-primary";
    btn.textContent = "Afslut";
    btn.addEventListener("click", () => {
      storage?.clearLocalDataKeepLock?.();
      window.close();
      setTimeout(() => {
        screen.innerHTML = `
          <div class="complete">
            <h2>Færdig</h2>
            <p>Lokale spørgeskemadata er slettet. Du kan nu lukke denne fane.</p>
          </div>`;
        hideFooterButtons();
      }, 250);
    });
    container.appendChild(btn);
  }

  function renderAlreadyCompleted() {
    state.completed = true;
    progressBar.style.width = "100%";
    progressText.textContent = "Besvarelse allerede registreret";
    hideFooterButtons();

    screen.innerHTML = `
      <div class="complete" id="alreadyCompleteBox">
        <h2>Tak for din besvarelse</h2>
        <p>Der er allerede registreret en besvarelse fra denne browser.</p>
        <div class="info-box">
          For at gøre undersøgelsen så pålidelig som muligt kan spørgeskemaet kun besvares én gang fra samme browser.
        </div>
      </div>`;
    addCloseButton(document.getElementById("alreadyCompleteBox"));
  }

  function renderQuestion(id) {
    showFooter();
    const q = config.questions[id];
    if (!q) return finishSurvey();

    state.started = true;
    state.currentId = id;
    state.completed = false;

    const numberText = q.number ? `Spørgsmål ${q.number} · ${q.section}` : q.section;

    if (q.type === "text") {
      screen.innerHTML = `
        <p class="question-number">${esc(numberText || "Spørgsmål")}</p>
        <h2 class="question-title">${esc(q.text)}</h2>
        ${q.help ? `<p class="question-help">${esc(q.help)}</p>` : ""}
        <textarea class="other-input" id="freeTextAnswer" rows="6" maxlength="1000" placeholder="Skriv dit svar her (frivilligt)">${esc(state.answers[id] || "")}</textarea>`;

      document.getElementById("freeTextAnswer").addEventListener("input", (event) => {
        state.answers[id] = event.target.value;
        autosaveDraft();
        updateControls();
      });
      updateControls();
      updateProgress();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const selected = state.answers[id];
    const inputType = q.type === "multi" ? "checkbox" : "radio";
    const optionsHtml = q.options.map((option) => {
      const checked = q.type === "multi"
        ? Array.isArray(selected) && selected.includes(option.value)
        : selected === option.value;

      const otherField = option.other ? `
        <div class="other-wrap ${checked ? "visible" : ""}" data-other-for="${esc(option.value)}">
          <label class="other-label" for="${esc(id)}-${esc(option.value)}-text">Skriv dit svar</label>
          <input class="other-input" id="${esc(id)}-${esc(option.value)}-text" type="text" maxlength="250" autocomplete="off" value="${esc(state.otherText[id] || "")}" ${checked ? "" : "disabled"} />
        </div>` : "";

      return `
        <div class="option-group">
          <label class="option ${checked ? "selected" : ""}">
            <input type="${inputType}" name="${esc(id)}" value="${esc(option.value)}" data-exclusive="${option.exclusive ? "true" : "false"}" data-other="${option.other ? "true" : "false"}" ${checked ? "checked" : ""} />
            <span>${esc(option.label)}</span>
          </label>
          ${otherField}
        </div>`;
    }).join("");

    screen.innerHTML = `
      <p class="question-number">${esc(numberText || "Spørgsmål")}</p>
      <h2 class="question-title">${esc(q.text)}</h2>
      ${q.help ? `<p class="question-help">${esc(q.help)}</p>` : ""}
      <div class="options">${optionsHtml}</div>`;

    screen.querySelectorAll('.option input[type="radio"], .option input[type="checkbox"]').forEach((input) => input.addEventListener("change", handleAnswerChange));
    screen.querySelectorAll(".other-input").forEach((input) => input.addEventListener("input", handleOtherTextInput));

    updateControls();
    updateProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAnswerChange(event) {
    const q = config.questions[state.currentId];
    const changed = event.target;
    const choiceInputs = [...screen.querySelectorAll('.option input[type="radio"], .option input[type="checkbox"]')];

    clearAnswersAfterCurrent();

    if (q.type === "multi") {
      if (changed.checked && changed.dataset.exclusive === "true") {
        choiceInputs.forEach((input) => { if (input !== changed) input.checked = false; });
      } else if (changed.checked) {
        choiceInputs.forEach((input) => { if (input.dataset.exclusive === "true") input.checked = false; });
      }
      state.answers[state.currentId] = choiceInputs.filter(i => i.checked).map(i => i.value);
    } else {
      const checked = choiceInputs.find(i => i.checked);
      state.answers[state.currentId] = checked ? checked.value : null;
    }

    screen.querySelectorAll(".option").forEach(label => {
      const input = label.querySelector('input[type="radio"], input[type="checkbox"]');
      label.classList.toggle("selected", Boolean(input && input.checked));
    });

    screen.querySelectorAll(".option-group").forEach(group => {
      const choice = group.querySelector('.option input[data-other="true"]');
      const wrap = group.querySelector(".other-wrap");
      const textInput = group.querySelector(".other-input");
      if (!choice || !wrap || !textInput) return;
      wrap.classList.toggle("visible", choice.checked);
      textInput.disabled = !choice.checked;
      if (choice.checked) setTimeout(() => textInput.focus(), 0);
      else {
        state.otherText[state.currentId] = "";
        textInput.value = "";
      }
    });

    autosaveDraft();
    updateControls();
    updateProgress();
  }

  function handleOtherTextInput(event) {
    state.otherText[state.currentId] = event.target.value;
    autosaveDraft();
    updateControls();
  }

  function hasAnswer(id) {
    const q = config.questions[id];
    const answer = state.answers[id];
    if (!q) return false;
    if (q.type === "text") return q.optional ? true : Boolean(String(answer || "").trim());
    if (q.type === "multi") {
      if (!Array.isArray(answer) || answer.length === 0) return false;
      const otherOption = q.options.find(option => option.other && answer.includes(option.value));
      if (otherOption && !(state.otherText[id] || "").trim()) return false;
      return true;
    }
    if (answer === undefined || answer === null || answer === "") return false;
    const selectedOption = q.options.find(option => option.value === answer);
    if (selectedOption?.other && !(state.otherText[id] || "").trim()) return false;
    return true;
  }

  function getNextCandidates(q, answer, assumeUnknown = false) {
    if (!q || !q.next) return [config.finishId];
    if (typeof q.next === "string") return [resolveSpecialTarget(q.next)];
    if (q.next.byAnswer) {
      if (answer !== undefined && answer !== null && answer !== "") {
        return [resolveSpecialTarget(q.next.byAnswer[answer] || q.next.default || config.finishId)];
      }
      if (assumeUnknown) {
        return [...new Set(Object.values(q.next.byAnswer).map(resolveSpecialTarget))];
      }
    }
    return [resolveSpecialTarget(q.next.default || config.finishId)];
  }

  function resolveNext(q) {
    return getNextCandidates(q, state.answers[state.currentId], false)[0];
  }

  function isCurrentQuestionLast() {
    if (!state.started || !state.currentId || !hasAnswer(state.currentId)) return false;
    return resolveNext(config.questions[state.currentId]) === config.finishId;
  }

  function goNext() {
    if (!state.started) return renderQuestion(config.startQuestionId);
    if (!hasAnswer(state.currentId)) return;

    const nextId = resolveNext(config.questions[state.currentId]);
    if (!nextId || nextId === config.finishId) return finishSurvey();

    state.history.push(state.currentId);
    autosaveDraft();
    renderQuestion(nextId);
  }

  function goBack() {
    if (!state.started || state.completed) return;
    const previousId = state.history.pop();
    if (!previousId) return renderWelcome();
    renderQuestion(previousId);
    autosaveDraft();
  }

  function updateControls() {
    backBtn.disabled = !state.started || state.history.length === 0;
    nextBtn.textContent = isCurrentQuestionLast() ? "Afslut" : "Næste";
    nextBtn.disabled = state.started && !hasAnswer(state.currentId);
  }

  function longestRemainingFrom(id, visited = new Set()) {
    if (!id || id === config.finishId || visited.has(id)) return 0;
    const q = config.questions[id];
    if (!q) return 0;
    const nextVisited = new Set(visited);
    nextVisited.add(id);
    const candidates = getNextCandidates(q, state.answers[id], true);
    const remaining = candidates.map(nextId => longestRemainingFrom(nextId, nextVisited));
    return 1 + Math.max(0, ...remaining);
  }

  function updateProgress() {
    if (!state.started || !state.currentId) return;
    const completedBeforeCurrent = state.history.length;
    const estimatedRemainingIncludingCurrent = longestRemainingFrom(state.currentId);
    const estimatedTotal = completedBeforeCurrent + estimatedRemainingIncludingCurrent;
    const completedIncludingCurrent = completedBeforeCurrent + (hasAnswer(state.currentId) ? 1 : 0);
    const percent = estimatedTotal > 0 ? Math.min(98, Math.round((completedIncludingCurrent / estimatedTotal) * 100)) : 0;
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `Ca. ${completedIncludingCurrent} af ${estimatedTotal} på denne rute`;
  }

  function renderFinalCloseArea(container) {
    const closeWrap = document.createElement("div");
    closeWrap.style.marginTop = "8px";
    addCloseButton(closeWrap);
    container.appendChild(closeWrap);
  }

  function renderCompletionWithEmail() {
    hideFooterButtons();
    screen.innerHTML = `
      <div class="complete" id="completionBox">
        <h2>Tak for din hjælp</h2>
        <p>${esc(config.completionText)}</p>
        <div class="info-box"><strong>${esc(config.resultInterest.question)}</strong></div>
        <div id="resultChoice" class="options" style="max-width:540px;">
          <button class="btn btn-primary" id="wantResult" type="button">Ja</button>
          <button class="btn btn-secondary" id="noResult" type="button">Nej</button>
        </div>
        <div id="emailArea"></div>
      </div>`;

    const box = document.getElementById("completionBox");
    const choice = document.getElementById("resultChoice");
    const emailArea = document.getElementById("emailArea");

    document.getElementById("wantResult").addEventListener("click", () => {
      choice.remove();
      emailArea.innerHTML = `
        <form id="resultEmailForm" style="display:grid;gap:10px;max-width:540px;margin-top:4px;">
          <label class="other-label" for="resultEmail">E-mailadresse</label>
          <input class="other-input" id="resultEmail" type="email" autocomplete="email" maxlength="200" required placeholder="navn@eksempel.dk">
          <p class="question-help">${esc(config.resultInterest.privacyText)}</p>
          <button class="btn btn-primary" id="emailSubmitBtn" type="submit">Gem e-mailadresse</button>
          <p id="emailStatus" aria-live="polite"></p>
        </form>`;

      const form = document.getElementById("resultEmailForm");
      const emailInput = document.getElementById("resultEmail");
      const submitBtn = document.getElementById("emailSubmitBtn");
      const status = document.getElementById("emailStatus");

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!emailInput.checkValidity()) return emailInput.reportValidity();
        submitBtn.disabled = true;
        submitBtn.textContent = "Gemmer…";
        const result = await storage?.submitResultEmail?.(emailInput.value);
        if (result?.saved) {
          emailArea.innerHTML = `<div class="info-box">Tak. Din e-mailadresse er registreret separat fra dine svar.</div>`;
          renderFinalCloseArea(box);
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = "Gem e-mailadresse";
          status.textContent = "E-mailadressen kunne ikke gemmes. Prøv igen.";
        }
      });
    });

    document.getElementById("noResult").addEventListener("click", () => {
      choice.remove();
      emailArea.innerHTML = `<div class="info-box">Tak. Der gemmes ingen e-mailadresse.</div>`;
      renderFinalCloseArea(box);
    });
  }

  async function finishSurvey() {
    if (state.completed) return;
    state.completed = true;
    progressBar.style.width = "100%";
    progressText.textContent = "Rute gennemført";
    backBtn.disabled = true;
    nextBtn.disabled = true;
    nextBtn.textContent = "Gemmer…";

    const result = await storage?.submitFinal?.(getPayload());
    state.currentId = null;
    if (result?.centralSaved) renderCompletionWithEmail();
    else {
      hideFooterButtons();
      screen.innerHTML = `<div class="complete"><h2>Der opstod en fejl</h2><p>Besvarelsen kunne ikke bekræftes som gemt. Genindlæs siden og prøv igen.</p></div>`;
    }
  }

  backBtn.addEventListener("click", goBack);
  nextBtn.addEventListener("click", goNext);

  if (storage?.hasCompleted?.()) renderAlreadyCompleted();
  else {
    resetState();
    renderWelcome();
  }
})();
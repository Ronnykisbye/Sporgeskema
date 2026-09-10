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
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
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
    state.started = false;
    state.currentId = null;
    state.history = [];
    state.completed = false;

    screen.innerHTML = `
      <div class="welcome">
        <h2>Velkommen</h2>
        <p>Spørgeskemaet vises ét spørgsmål ad gangen og tilpasser sig dine svar.</p>
        <div class="info-box">
          Denne udviklingsversion gemmer en anonym kladde lokalt i browseren undervejs. Der sendes endnu ikke svar til OneDrive, Google Drive eller en cloud-server.
        </div>
      </div>`;

    progressBar.style.width = "0%";
    progressText.textContent = "Klar til at starte";
    backBtn.disabled = true;
    nextBtn.disabled = false;
    nextBtn.textContent = "Start";
  }

  function renderQuestion(id) {
    const q = config.questions[id];
    if (!q) return finishSurvey();

    state.started = true;
    state.currentId = id;
    state.completed = false;

    const selected = state.answers[id];
    const inputType = q.type === "multi" ? "checkbox" : "radio";

    const optionsHtml = q.options.map((option) => {
      const checked = q.type === "multi"
        ? Array.isArray(selected) && selected.includes(option.value)
        : selected === option.value;

      const otherField = option.other ? `
        <div class="other-wrap ${checked ? "visible" : ""}" data-other-for="${esc(option.value)}">
          <label class="other-label" for="${esc(id)}-${esc(option.value)}-text">Skriv dit svar</label>
          <input
            class="other-input"
            id="${esc(id)}-${esc(option.value)}-text"
            type="text"
            maxlength="250"
            autocomplete="off"
            value="${esc(state.otherText[id] || "")}"
            ${checked ? "" : "disabled"}
          />
        </div>` : "";

      return `
        <div class="option-group">
          <label class="option ${checked ? "selected" : ""}">
            <input
              type="${inputType}"
              name="${esc(id)}"
              value="${esc(option.value)}"
              data-exclusive="${option.exclusive ? "true" : "false"}"
              data-other="${option.other ? "true" : "false"}"
              ${checked ? "checked" : ""}
            />
            <span>${esc(option.label)}</span>
          </label>
          ${otherField}
        </div>`;
    }).join("");

    const numberText = q.number ? `Spørgsmål ${q.number} · ${q.section}` : q.section;

    screen.innerHTML = `
      <p class="question-number">${esc(numberText || "Spørgsmål")}</p>
      <h2 class="question-title">${esc(q.text)}</h2>
      ${q.help ? `<p class="question-help">${esc(q.help)}</p>` : ""}
      <div class="options">${optionsHtml}</div>`;

    screen.querySelectorAll('.option input[type="radio"], .option input[type="checkbox"]').forEach((input) => {
      input.addEventListener("change", handleAnswerChange);
    });

    screen.querySelectorAll(".other-input").forEach((input) => {
      input.addEventListener("input", handleOtherTextInput);
    });

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
        choiceInputs.forEach((input) => {
          if (input !== changed) input.checked = false;
        });
      } else if (changed.checked) {
        choiceInputs.forEach((input) => {
          if (input.dataset.exclusive === "true") input.checked = false;
        });
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
      if (choice.checked) {
        setTimeout(() => textInput.focus(), 0);
      } else {
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
    if (typeof q.next === "string") return [q.next];

    if (q.next.byAnswer) {
      if (answer !== undefined && answer !== null && answer !== "") {
        const mapped = q.next.byAnswer[answer];
        return [mapped || q.next.default || config.finishId];
      }

      if (assumeUnknown) {
        return [...new Set([
          ...Object.values(q.next.byAnswer),
          ...(q.next.default ? [q.next.default] : [])
        ])];
      }
    }

    return [q.next.default || config.finishId];
  }

  function resolveNext(q) {
    return getNextCandidates(q, state.answers[state.currentId], false)[0];
  }

  function isCurrentQuestionLast() {
    if (!state.started || !state.currentId || !hasAnswer(state.currentId)) return false;
    const q = config.questions[state.currentId];
    const nextId = resolveNext(q);
    return !nextId || nextId === config.finishId;
  }

  function goNext() {
    if (!state.started) {
      renderQuestion(config.startQuestionId);
      return;
    }

    if (!hasAnswer(state.currentId)) return;

    const q = config.questions[state.currentId];
    const nextId = resolveNext(q);

    if (!nextId || nextId === config.finishId) {
      finishSurvey();
      return;
    }

    state.history.push(state.currentId);
    autosaveDraft();
    renderQuestion(nextId);
  }

  function goBack() {
    if (!state.started || state.completed) return;

    const previousId = state.history.pop();
    if (!previousId) {
      renderWelcome();
      return;
    }

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
    const answer = state.answers[id];
    const candidates = getNextCandidates(q, answer, true);
    const remaining = candidates.map(nextId => longestRemainingFrom(nextId, nextVisited));
    return 1 + Math.max(0, ...remaining);
  }

  function updateProgress() {
    if (!state.started || !state.currentId) return;

    const completedBeforeCurrent = state.history.length;
    const estimatedRemainingIncludingCurrent = longestRemainingFrom(state.currentId);
    const estimatedTotal = completedBeforeCurrent + estimatedRemainingIncludingCurrent;
    const completedIncludingCurrent = completedBeforeCurrent + (hasAnswer(state.currentId) ? 1 : 0);
    const percent = estimatedTotal > 0
      ? Math.min(98, Math.round((completedIncludingCurrent / estimatedTotal) * 100))
      : 0;

    progressBar.style.width = `${percent}%`;
    progressText.textContent = `Ca. ${completedIncludingCurrent} af ${estimatedTotal} på denne rute`;
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

    if (result?.centralSaved) {
      screen.innerHTML = `
        <div class="complete">
          <h2>Tak</h2>
          <p>${esc(config.completionText)}</p>
        </div>`;
    } else {
      screen.innerHTML = `
        <div class="complete">
          <h2>Tak for din hjælp</h2>
          <p>Du har gennemført de spørgsmål, der var relevante for din rute.</p>
          <div class="info-box">
            Dette er stadig en udviklingsversion. Besvarelsen er gemt lokalt i denne browser, men er endnu ikke registreret i den endelige cloud-database. Derfor vises den endelige kvittering og det frivillige e-mailvalg først, når den sikre backend er koblet på.
          </div>
        </div>`;
    }

    nextBtn.disabled = false;
    nextBtn.textContent = "Start igen";
  }

  backBtn.addEventListener("click", goBack);
  nextBtn.addEventListener("click", () => {
    if (state.completed) {
      resetState();
      renderWelcome();
    } else {
      goNext();
    }
  });

  resetState();
  renderWelcome();
})();

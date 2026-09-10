(() => {
  const config = window.SURVEY_CONFIG;
  const screen = document.getElementById("screen");
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");

  const state = {
    started: false,
    currentId: null,
    answers: {},
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
          Dette er en første teknisk version. Svar gemmes endnu ikke eksternt. Senere kobler vi en sikker dataløsning på uden at lægge adgangsnøgler i GitHub Pages.
        </div>
      </div>`;

    progressBar.style.width = "0%";
    progressText.textContent = "Klar";
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

      return `
        <label class="option ${checked ? "selected" : ""}">
          <input type="${inputType}" name="${esc(id)}" value="${esc(option.value)}" ${checked ? "checked" : ""} />
          <span>${esc(option.label)}</span>
        </label>`;
    }).join("");

    screen.innerHTML = `
      <p class="question-number">${esc(q.section || "Spørgsmål")}</p>
      <h2 class="question-title">${esc(q.text)}</h2>
      ${q.help ? `<p class="question-help">${esc(q.help)}</p>` : ""}
      <div class="options">${optionsHtml}</div>`;

    screen.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", handleAnswerChange);
    });

    updateControls();
    updateProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAnswerChange() {
    const q = config.questions[state.currentId];
    const inputs = [...screen.querySelectorAll("input")];

    if (q.type === "multi") {
      state.answers[state.currentId] = inputs.filter(i => i.checked).map(i => i.value);
    } else {
      const checked = inputs.find(i => i.checked);
      state.answers[state.currentId] = checked ? checked.value : null;
    }

    screen.querySelectorAll(".option").forEach(label => {
      const input = label.querySelector("input");
      label.classList.toggle("selected", input.checked);
    });

    updateControls();
  }

  function hasAnswer(id) {
    const q = config.questions[id];
    const answer = state.answers[id];
    if (!q) return false;
    if (q.type === "multi") return Array.isArray(answer) && answer.length > 0;
    return answer !== undefined && answer !== null && answer !== "";
  }

  function resolveNext(q) {
    return typeof q.next === "function" ? q.next(state.answers) : q.next;
  }

  function goNext() {
    if (!state.started) {
      renderQuestion(config.startQuestionId);
      return;
    }

    if (!hasAnswer(state.currentId)) return;

    const q = config.questions[state.currentId];
    const nextId = resolveNext(q);

    if (!nextId || nextId === "finish") {
      finishSurvey();
      return;
    }

    state.history.push(state.currentId);
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
  }

  function updateControls() {
    backBtn.disabled = !state.started || state.history.length === 0;
    nextBtn.textContent = "Næste";
    nextBtn.disabled = state.started && !hasAnswer(state.currentId);
  }

  function updateProgress() {
    const answeredCount = Object.values(state.answers).filter(value =>
      Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== ""
    ).length;
    const minimumKnownSteps = 6;
    const percent = Math.min(95, Math.round((answeredCount / minimumKnownSteps) * 100));
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${answeredCount} svar registreret`;
  }

  function finishSurvey() {
    state.completed = true;
    state.currentId = null;
    progressBar.style.width = "100%";
    progressText.textContent = "Foreløbig rute gennemført";

    screen.innerHTML = `
      <div class="complete">
        <h2>Tak</h2>
        <p>Du har gennemført den foreløbige spørgerute.</p>
        <div class="info-box">
          I denne prototype bliver svar kun holdt midlertidigt i browseren og sendes ikke til et regneark eller en server.
        </div>
      </div>`;

    backBtn.disabled = true;
    nextBtn.disabled = false;
    nextBtn.textContent = "Start igen";
  }

  backBtn.addEventListener("click", goBack);
  nextBtn.addEventListener("click", () => {
    if (state.completed) {
      state.answers = {};
      renderWelcome();
    } else {
      goNext();
    }
  });

  renderWelcome();
})();

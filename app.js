(function () {
  const allQuestions = window.QUIZ_DATA || [];

  const QUIZ_SETS = [
    { id: 1, title: 'Quiz 1', rangeStart: 1, rangeEnd: 50 },
    { id: 2, title: 'Quiz 2', rangeStart: 51, rangeEnd: 100 },
    { id: 3, title: 'Quiz 3', rangeStart: 101, rangeEnd: 150 },
  ];

  let selectedSet = null;
  let activeQuestions = [];
  let currentIndex = 0;
  let score = 0;
  let answered = {};
  let toastTimer = null;
  let bestScores = {};

  const $ = (id) => document.getElementById(id);

  const welcomeScreen = $('welcomeScreen');
  const introScreen = $('introScreen');
  const quizScreen = $('quizScreen');
  const resultsScreen = $('resultsScreen');
  const headerStats = $('headerStats');
  const progressTrack = $('progressTrack');
  const headerSubtitle = $('headerSubtitle');
  const questionText = $('questionText');
  const optionsContainer = $('optionsContainer');
  const qLabel = $('qLabel');
  const quizSetLabel = $('quizSetLabel');
  const currentNum = $('currentNum');
  const totalNum = $('totalNum');
  const liveScore = $('liveScore');
  const progressFill = $('progressFill');
  const prevBtn = $('prevBtn');
  const nextBtn = $('nextBtn');
  const toast = $('toast');
  const toastIcon = $('toastIcon');
  const toastTitle = $('toastTitle');
  const toastMessage = $('toastMessage');
  const quizNav = $('quizNav');
  const explanationArea = $('explanationArea');
  const explanationToggle = $('explanationToggle');
  const explanationBox = $('explanationBox');
  const explanationText = $('explanationText');
  const explanationTitle = $('explanationTitle');

  function hasExplanation(q) {
    return Boolean(q.explanation && q.explanation.trim());
  }

  function getQuestionsForSet(set) {
    return allQuestions.filter((q) => q.id >= set.rangeStart && q.id <= set.rangeEnd);
  }

  function init() {
    renderQuizNav();
    $('startBtn').addEventListener('click', beginQuiz);
    $('restartBtn').addEventListener('click', beginQuiz);
    $('backToIntroBtn').addEventListener('click', showIntro);
    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);
    explanationToggle.addEventListener('click', toggleExplanation);
  }

  function renderQuizNav() {
    quizNav.innerHTML = '';
    QUIZ_SETS.forEach((set) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-nav-item';
      btn.dataset.setId = set.id;

      const best = bestScores[set.id];
      btn.innerHTML =
        '<span class="quiz-nav-num">' + set.id + '</span>' +
        '<span class="quiz-nav-info">' +
        '<strong>' + set.title + '</strong>' +
        '<span>Questions ' + set.rangeStart + '–' + set.rangeEnd + '</span>' +
        (best !== undefined
          ? '<span class="quiz-nav-best">Best: ' + best + '/50</span>'
          : '') +
        '</span>';

      btn.addEventListener('click', () => selectQuiz(set.id));
      quizNav.appendChild(btn);
    });
  }

  function updateNavActive() {
    quizNav.querySelectorAll('.quiz-nav-item').forEach((btn) => {
      btn.classList.toggle('active', selectedSet && parseInt(btn.dataset.setId, 10) === selectedSet.id);
    });
  }

  function hideAllScreens() {
    welcomeScreen.classList.add('hidden');
    introScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
  }

  function selectQuiz(setId) {
    selectedSet = QUIZ_SETS.find((s) => s.id === setId);
    if (!selectedSet) return;

    activeQuestions = getQuestionsForSet(selectedSet);
    currentIndex = 0;
    score = 0;
    answered = {};

    updateNavActive();
    showIntro();
  }

  function showIntro() {
    hideAllScreens();
    introScreen.classList.remove('hidden');
    headerStats.classList.add('hidden');
    progressTrack.classList.add('hidden');
    progressFill.style.width = '0%';

    headerSubtitle.textContent = selectedSet.title + ' — Questions ' + selectedSet.rangeStart + '–' + selectedSet.rangeEnd;
    $('introBadge').textContent = selectedSet.title;
    $('introTitle').textContent = 'Start ' + selectedSet.title;
    $('introLead').textContent =
      'This quiz covers questions ' +
      selectedSet.rangeStart +
      ' to ' +
      selectedSet.rangeEnd +
      ' (' +
      activeQuestions.length +
      ' questions). Take your time — you will get instant feedback after each answer.';
    $('startBtn').textContent = 'Start ' + selectedSet.title;
  }

  function beginQuiz() {
    currentIndex = 0;
    score = 0;
    answered = {};
    liveScore.textContent = '0';
    totalNum.textContent = activeQuestions.length;

    hideAllScreens();
    quizScreen.classList.remove('hidden');
    headerStats.classList.remove('hidden');
    progressTrack.classList.remove('hidden');
    headerSubtitle.textContent = selectedSet.title + ' in progress';

    renderQuestion();
  }

  function renderQuestion() {
    const q = activeQuestions[currentIndex];
    if (!q) return;

    const num = currentIndex + 1;
    qLabel.textContent = q.id;
    quizSetLabel.textContent = selectedSet.title;
    currentNum.textContent = num;
    questionText.textContent = q.text;

    const pct = ((num - 1) / activeQuestions.length) * 100;
    progressFill.style.width = pct + '%';

    optionsContainer.innerHTML = '';
    const record = answered[q.id];

    q.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option';
      btn.dataset.letter = opt.letter;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');

      if (record) {
        btn.classList.add('locked');
        if (record.selected === opt.letter) {
          btn.classList.add(record.correct ? 'correct' : 'incorrect');
        } else if (opt.letter === q.correct) {
          btn.classList.add('reveal-correct');
        }
      }

      btn.innerHTML =
        '<span class="option-letter">' +
        opt.letter +
        '</span><span class="option-text">' +
        escapeHtml(opt.text) +
        '</span>';

      if (!record) {
        btn.addEventListener('click', () => selectAnswer(q, opt.letter));
      }

      optionsContainer.appendChild(btn);
    });

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = !record;
    nextBtn.textContent =
      currentIndex === activeQuestions.length - 1 ? 'See Results' : 'Next Question';

    if (record && hasExplanation(q)) {
      setupExplanationControls(q, record.correct);
    } else {
      hideExplanationControls();
    }
  }

  function setupExplanationControls(q, isCorrect) {
    explanationArea.classList.remove('hidden');
    explanationArea.classList.remove('explanation-correct', 'explanation-incorrect');
    explanationArea.classList.add(isCorrect ? 'explanation-correct' : 'explanation-incorrect');
    explanationTitle.textContent = isCorrect ? 'Correct — Explanation' : 'Explanation';
    explanationText.textContent = q.explanation;
    collapseExplanation();
  }

  function collapseExplanation() {
    explanationBox.classList.add('hidden');
    explanationToggle.setAttribute('aria-expanded', 'false');
    explanationToggle.innerHTML =
      '<span class="explanation-toggle-icon" aria-hidden="true">💡</span> Show explanation';
  }

  function toggleExplanation() {
    const isOpen = !explanationBox.classList.contains('hidden');
    if (isOpen) {
      collapseExplanation();
    } else {
      explanationBox.classList.remove('hidden');
      explanationToggle.setAttribute('aria-expanded', 'true');
      explanationToggle.innerHTML =
        '<span class="explanation-toggle-icon" aria-hidden="true">💡</span> Hide explanation';
    }
  }

  function hideExplanationControls() {
    explanationArea.classList.add('hidden');
    explanationArea.classList.remove('explanation-correct', 'explanation-incorrect');
    explanationBox.classList.add('hidden');
    explanationText.textContent = '';
    explanationToggle.setAttribute('aria-expanded', 'false');
  }

  function selectAnswer(q, letter) {
    if (answered[q.id]) return;

    const isCorrect = letter === q.correct;
    answered[q.id] = { selected: letter, correct: isCorrect };

    if (isCorrect) {
      score++;
      liveScore.textContent = score;
    }

    optionsContainer.querySelectorAll('.option').forEach((btn) => {
      btn.classList.add('locked');
      btn.disabled = true;
      const l = btn.dataset.letter;
      if (l === letter) {
        btn.classList.add(isCorrect ? 'correct' : 'incorrect');
      } else if (l === q.correct) {
        btn.classList.add('reveal-correct');
      }
    });

    showToast(isCorrect, q.correct);
    if (hasExplanation(q)) {
      setupExplanationControls(q, isCorrect);
    }
    nextBtn.disabled = false;
  }

  function showToast(isCorrect, correctLetter) {
    clearTimeout(toastTimer);
    toast.classList.remove('hidden', 'success', 'error', 'show');

    if (isCorrect) {
      toast.classList.add('success');
      toastIcon.textContent = '✓';
      toastTitle.textContent = 'Correct!';
      toastMessage.textContent = 'Well done — keep going!';
    } else {
      toast.classList.add('error');
      toastIcon.textContent = '✗';
      toastTitle.textContent = 'Incorrect';
      toastMessage.textContent = 'The correct answer is ' + correctLetter + '.';
    }

    requestAnimationFrame(() => toast.classList.add('show'));
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function goPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion();
    }
  }

  function goNext() {
    if (currentIndex < activeQuestions.length - 1) {
      currentIndex++;
      renderQuestion();
    } else {
      showResults();
    }
  }

  function showResults() {
    hideAllScreens();
    resultsScreen.classList.remove('hidden');
    progressFill.style.width = '100%';
    headerStats.classList.add('hidden');
    headerSubtitle.textContent = selectedSet.title + ' — completed';

    const total = activeQuestions.length;
    const correct = score;
    const wrong = total - correct;
    const pct = total ? Math.round((correct / total) * 100) : 0;

    if (bestScores[selectedSet.id] === undefined || correct > bestScores[selectedSet.id]) {
      bestScores[selectedSet.id] = correct;
      renderQuizNav();
      updateNavActive();
    }

    $('resultsTitle').textContent = selectedSet.title + ' Complete!';
    $('finalScore').textContent = correct;
    $('finalTotal').textContent = total;
    $('scorePercent').textContent = pct + '%';
    $('correctCount').textContent = correct;
    $('wrongCount').textContent = wrong;

    const icon = $('resultsIcon');
    const msg = $('resultsMessage');
    icon.className = 'results-icon';

    if (pct >= 90) {
      icon.classList.add('excellent');
      icon.textContent = '🏆';
      msg.textContent = 'Outstanding! You have excellent knowledge of this section.';
    } else if (pct >= 70) {
      icon.classList.add('good');
      icon.textContent = '👍';
      msg.textContent = 'Good job! Review the questions you missed and try again.';
    } else if (pct >= 50) {
      icon.classList.add('fair');
      icon.textContent = '📚';
      msg.textContent = 'Keep studying — practice makes perfect!';
    } else {
      icon.classList.add('poor');
      icon.textContent = '💪';
      msg.textContent = 'Don\'t give up! Review the material and try this quiz again.';
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  init();
})();

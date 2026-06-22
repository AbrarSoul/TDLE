(function () {
  const allQuestions = window.QUIZ_DATA || [];
  const studyData = window.STUDY_DATA || {};
  const studyKeywords = window.STUDY_KEYWORDS || {};

  const QUESTION_BANK_END = allQuestions.length || 309;

  const PRACTICE_SETS = [
    {
      id: 'question-bank',
      title: 'Questions (1-' + QUESTION_BANK_END + ')',
      rangeStart: 1,
      rangeEnd: QUESTION_BANK_END,
      kind: 'practice',
      hideNavNum: true,
      intro: {
        lead:
          'This question bank contains all {count} questions ({rangeStart}–{rangeEnd}). All questions appear at once — scroll through and answer in any order.',
        features: [
          '{count} multiple-choice questions (A, B, or C) — all on one page',
          'Search by question number or keyword to jump quickly',
          'Instant green / red feedback — explanations on demand',
        ],
      },
    },
  ];

  const STUDY_SETS = [
    {
      id: 'study-solid',
      title: 'BongoBondhu (Solid)',
      dataKey: 'solid',
      kind: 'study',
      intro: {
        lead:
          'Practice {count} questions where high-confidence keywords appear only in the correct answer — never in wrong options or the question text.',
        features: [
          'Keywords that reliably point to the right answer',
          'Review the keyword list before you start',
          'Focused drill — no distractions from unrelated questions',
        ],
      },
    },
    {
      id: 'study-partial',
      title: 'BongoBondhu (Partial)',
      dataKey: 'partial',
      kind: 'study',
      intro: {
        lead:
          'Practice {count} questions where keywords appear more often in correct answers than incorrect ones — useful shortcuts with some caution.',
        features: [
          'Keywords that lean toward the right answer',
          'Review the keyword list before you start',
          'Good for spotting patterns, not guaranteed signals',
        ],
      },
    },
    {
      id: 'study-age',
      title: 'Age',
      dataKey: 'age',
      kind: 'study',
      intro: {
        lead:
          'Review {count} age-related questions — who is responsible for seat belts, child restraints, and passenger duties at different ages.',
        features: [
          'Under 15 → driver is usually responsible',
          '15 or older → passenger is usually responsible',
          'Watch for trap answers like "vapaaehtoista" (voluntary)',
        ],
      },
    },
    {
      id: 'study-numbers',
      title: 'Numbers',
      dataKey: 'numbers',
      kind: 'study',
      intro: {
        lead:
          'Drill {count} questions built around specific numbers — fines, limits, measurements, and time periods from the exam material.',
        features: [
          'Exact values matter — no rounding shortcuts',
          'Covers alcohol limits, fees, heights, and durations',
          'Memorize the number tied to each rule',
        ],
      },
    },
    {
      id: 'study-image',
      title: 'Image',
      dataKey: 'image',
      kind: 'study',
      intro: {
        lead:
          'Practice {count} image-based questions — read the traffic sign or diagram before choosing your answer.',
        features: [
          'Each question includes a sign or diagram',
          'Click the image to enlarge it',
          'Answer only after you understand what the image shows',
        ],
      },
    },
  ];

  const ALL_SETS = PRACTICE_SETS.concat(STUDY_SETS);

  let selectedSet = null;
  let activeQuestions = [];
  let score = 0;
  let answered = {};
  let toastTimer = null;
  let bestScores = {};
  let searchQuery = '';
  let keywordSearchQuery = '';
  let activeKeywordIndex = null;

  const $ = (id) => document.getElementById(id);

  const welcomeScreen = $('welcomeScreen');
  const introScreen = $('introScreen');
  const quizScreen = $('quizScreen');
  const resultsScreen = $('resultsScreen');
  const headerStats = $('headerStats');
  const progressTrack = $('progressTrack');
  const headerSubtitle = $('headerSubtitle');
  const quizSetLabel = $('quizSetLabel');
  const answeredNum = $('answeredNum');
  const totalNum = $('totalNum');
  const liveScore = $('liveScore');
  const progressFill = $('progressFill');
  const finishBtn = $('finishBtn');
  const toast = $('toast');
  const toastIcon = $('toastIcon');
  const toastTitle = $('toastTitle');
  const toastMessage = $('toastMessage');
  const practiceNav = $('practiceNav');
  const studyNav = $('studyNav');
  const questionsList = $('questionsList');
  const imageLightbox = $('imageLightbox');
  const imageLightboxImg = $('imageLightboxImg');
  const imageLightboxBackdrop = $('imageLightboxBackdrop');
  const imageLightboxClose = $('imageLightboxClose');
  const questionSearch = $('questionSearch');
  const clearSearchBtn = $('clearSearchBtn');
  const searchResultCount = $('searchResultCount');
  const introFeatureList = $('introFeatureList');
  const introKeywordsPanel = $('introKeywordsPanel');
  const keywordChips = $('keywordChips');
  const keywordSearch = $('keywordSearch');
  const keywordTotalBadge = $('keywordTotalBadge');
  const keywordEmptyState = $('keywordEmptyState');

  function hasExplanation(q) {
    return Boolean(q.explanation && q.explanation.trim());
  }

  function getQuestionsForSet(set) {
    if (set.kind === 'study') {
      return studyData[set.dataKey] || [];
    }
    return allQuestions.filter((q) => q.id >= set.rangeStart && q.id <= set.rangeEnd);
  }

  function getSetSubtitle(set, count) {
    if (set.kind === 'study') {
      return count + ' question' + (count === 1 ? '' : 's');
    }
    return 'Questions ' + set.rangeStart + '–' + set.rangeEnd;
  }

  function getIntroVars(set, count) {
    return {
      count: String(count),
      rangeStart: String(set.rangeStart != null ? set.rangeStart : ''),
      rangeEnd: String(set.rangeEnd != null ? set.rangeEnd : ''),
      title: set.title,
    };
  }

  function formatIntroText(template, vars) {
    return template.replace(/\{(\w+)\}/g, function (_match, key) {
      return vars[key] != null ? vars[key] : '';
    });
  }

  function renderIntroFeatures(features, vars) {
    if (!features || !features.length) {
      introFeatureList.innerHTML = '';
      introFeatureList.classList.add('hidden');
      return;
    }

    introFeatureList.classList.remove('hidden');
    introFeatureList.innerHTML = features
      .map(function (item) {
        return '<li>' + formatIntroText(item, vars) + '</li>';
      })
      .join('');
  }

  function getKeywordsForSet(set) {
    if (set.kind !== 'study') return [];
    return studyKeywords[set.dataKey] || [];
  }

  function formatKeywordHeading(entry) {
    if (entry.english && entry.english.trim()) {
      return entry.keyword + ' = ' + entry.english;
    }
    return entry.keyword;
  }

  function formatKeywordDescription(text) {
    if (!text) return '';
    return formatExplanation(text);
  }

  function onKeywordSearchInput() {
    keywordSearchQuery = keywordSearch.value.trim().toLowerCase();
    renderKeywordList();
  }

  function keywordMatchesFilter(entry) {
    if (!keywordSearchQuery) return true;

    const haystack = [
      entry.keyword,
      entry.english || '',
      (entry.description || ''),
      (entry.questionIds || []).map(function (id) { return 'q' + id; }).join(' '),
    ].join(' ').toLowerCase();

    return haystack.includes(keywordSearchQuery);
  }

  function getSortedKeywords(set) {
    return getKeywordsForSet(set).slice().sort(function (a, b) {
      return a.keyword.localeCompare(b.keyword, 'fi', { sensitivity: 'base' });
    });
  }

  function getQuestionById(id) {
    return allQuestions.find(function (q) {
      return q.id === id;
    });
  }

  function renderIntroKeywords() {
    activeKeywordIndex = null;
    keywordSearchQuery = '';
    keywordSearch.value = '';
    keywordChips.innerHTML = '';
    keywordEmptyState.classList.add('hidden');

    if (!selectedSet || selectedSet.kind !== 'study') {
      introKeywordsPanel.classList.add('hidden');
      return;
    }

    const keywords = getKeywordsForSet(selectedSet);
    if (!keywords.length) {
      introKeywordsPanel.classList.add('hidden');
      return;
    }

    introKeywordsPanel.classList.remove('hidden');
    keywordTotalBadge.textContent = keywords.length + ' total';
    renderKeywordList();
  }

  function renderKeywordList() {
    const keywords = getSortedKeywords(selectedSet);
    const filtered = keywords.filter(keywordMatchesFilter);

    keywordChips.innerHTML = '';
    keywordEmptyState.classList.toggle('hidden', filtered.length > 0);

    if (activeKeywordIndex !== null) {
      const activeEntry = keywords[activeKeywordIndex];
      const stillVisible = activeEntry && keywordMatchesFilter(activeEntry);
      if (!stillVisible) {
        activeKeywordIndex = null;
      }
    }

    filtered.forEach(function (entry) {
      const index = keywords.indexOf(entry);
      const isOpen = activeKeywordIndex === index;
      const item = document.createElement('div');
      item.className = 'keyword-list-item' + (isOpen ? ' is-open' : '');
      item.setAttribute('role', 'listitem');

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'keyword-list-toggle';
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      const chevron = document.createElement('span');
      chevron.className = 'keyword-list-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.textContent = isOpen ? '▼' : '▶';
      toggle.appendChild(chevron);

      const summary = document.createElement('span');
      summary.className = 'keyword-list-summary';

      const heading = document.createElement('span');
      heading.className = 'keyword-list-heading';
      heading.innerHTML = highlightSearchTerm(entry.keyword, keywordSearchQuery);
      summary.appendChild(heading);

      if (entry.english && entry.english.trim()) {
        const english = document.createElement('span');
        english.className = 'keyword-list-english';
        english.innerHTML = highlightSearchTerm(entry.english, keywordSearchQuery);
        summary.appendChild(english);
      }

      if (entry.questionIds && entry.questionIds.length) {
        const questions = document.createElement('span');
        questions.className = 'keyword-list-questions';

        entry.questionIds.forEach(function (id) {
          const pill = document.createElement('span');
          pill.className = 'keyword-question-pill';
          pill.innerHTML = highlightSearchTerm('Q' + id, keywordSearchQuery);
          questions.appendChild(pill);
        });

        summary.appendChild(questions);
      }

      toggle.appendChild(summary);
      toggle.addEventListener('click', function () {
        toggleKeywordPanel(index);
      });

      const panel = document.createElement('div');
      panel.className = 'keyword-list-panel' + (isOpen ? '' : ' hidden');

      if (isOpen) {
        panel.innerHTML = renderKeywordPanelContent(entry);
      }

      item.appendChild(toggle);
      item.appendChild(panel);
      keywordChips.appendChild(item);
    });
  }

  function renderKeywordPanelContent(entry) {
    let html = '';

    if (entry.description && entry.description.trim()) {
      const descriptionHtml = keywordSearchQuery
        ? highlightSearchMultiline(entry.description, keywordSearchQuery)
        : formatKeywordDescription(entry.description);
      html += '<div class="keyword-panel-description">' + descriptionHtml + '</div>';
    }

    if (entry.questionIds && entry.questionIds.length) {
      html += '<div class="keyword-panel-questions">';
      entry.questionIds.forEach(function (id) {
        html += renderKeywordQuestionPreview(id);
      });
      html += '</div>';
    }

    return html;
  }

  function renderKeywordQuestionPreview(id) {
    const q = getQuestionById(id);
    if (!q) {
      return (
        '<article class="keyword-question-preview keyword-question-preview-missing">' +
        '<p class="keyword-question-preview-label">Question ' +
        id +
        '</p>' +
        '<p class="keyword-question-preview-missing-text">Question not found in the question bank.</p>' +
        '</article>'
      );
    }

    let html =
      '<article class="keyword-question-preview">' +
      '<p class="keyword-question-preview-label">Question ' +
      q.id +
      '</p>' +
      '<p class="keyword-question-preview-text">' +
      (keywordSearchQuery ? highlightSearchTerm(q.text, keywordSearchQuery) : escapeHtml(q.text)) +
      '</p>';

    if (q.image) {
      html +=
        '<figure class="keyword-question-preview-image-wrap">' +
        '<img class="keyword-question-preview-image" src="' +
        escapeHtml(q.image) +
        '" alt="Illustration for question ' +
        q.id +
        '" loading="lazy" decoding="async" />' +
        '</figure>';
    }

    html += '<ul class="keyword-question-preview-options">';
    q.options.forEach(function (opt) {
      const isCorrect = opt.letter === q.correct;
      html +=
        '<li class="keyword-question-preview-option' +
        (isCorrect ? ' is-correct' : '') +
        '">' +
        '<span class="keyword-question-preview-letter">' +
        escapeHtml(opt.letter) +
        '</span>' +
        '<span class="keyword-question-preview-option-text">' +
        (keywordSearchQuery ? highlightSearchTerm(opt.text, keywordSearchQuery) : escapeHtml(opt.text)) +
        '</span>' +
        '</li>';
    });
    html += '</ul></article>';

    return html;
  }

  function toggleKeywordPanel(index) {
    const keywords = getSortedKeywords(selectedSet);
    const entry = keywords[index];
    if (!entry) return;

    activeKeywordIndex = activeKeywordIndex === index ? null : index;
    renderKeywordList();

    if (activeKeywordIndex !== null) {
      const openItem = keywordChips.querySelector('.keyword-list-item.is-open');
      if (openItem) {
        openItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  function init() {
    renderQuizNav();
    $('startBtn').addEventListener('click', beginQuiz);
    $('restartBtn').addEventListener('click', beginQuiz);
    $('backToIntroBtn').addEventListener('click', showIntro);
    finishBtn.addEventListener('click', showResults);
    questionSearch.addEventListener('input', onSearchInput);
    clearSearchBtn.addEventListener('click', clearSearch);
    keywordSearch.addEventListener('input', onKeywordSearchInput);
    questionsList.addEventListener('click', onQuestionImageClick);
    imageLightboxBackdrop.addEventListener('click', closeImageLightbox);
    imageLightboxClose.addEventListener('click', closeImageLightbox);
    document.addEventListener('keydown', onDocumentKeydown);
  }

  function onQuestionImageClick(event) {
    const btn = event.target.closest('.question-image-btn');
    if (!btn) return;

    const img = btn.querySelector('.question-image');
    if (!img) return;

    openImageLightbox(img.src, img.alt);
  }

  function openImageLightbox(src, alt) {
    imageLightboxImg.onload = scaleLightboxImage;
    imageLightboxImg.src = src;
    imageLightboxImg.alt = alt || 'Enlarged question image';
    imageLightbox.classList.remove('hidden');
    document.body.classList.add('lightbox-open');
    if (imageLightboxImg.complete) {
      scaleLightboxImage();
    }
    imageLightboxClose.focus();
  }

  function scaleLightboxImage() {
    imageLightboxImg.style.width = '';
    imageLightboxImg.style.height = '';

    const naturalWidth = imageLightboxImg.naturalWidth;
    const naturalHeight = imageLightboxImg.naturalHeight;
    if (!naturalWidth || !naturalHeight) return;

    const maxWidth = Math.min(window.innerWidth * 0.94, 1408);
    const maxHeight = window.innerHeight * 0.88;
    const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);

    imageLightboxImg.style.width = Math.round(naturalWidth * scale) + 'px';
    imageLightboxImg.style.height = Math.round(naturalHeight * scale) + 'px';
  }

  function closeImageLightbox() {
    imageLightbox.classList.add('hidden');
    document.body.classList.remove('lightbox-open');
    imageLightboxImg.onload = null;
    imageLightboxImg.removeAttribute('src');
    imageLightboxImg.style.width = '';
    imageLightboxImg.style.height = '';
  }

  function onDocumentKeydown(event) {
    if (event.key === 'Escape' && !imageLightbox.classList.contains('hidden')) {
      closeImageLightbox();
    }
  }

  function renderQuizNav() {
    practiceNav.innerHTML = '';
    studyNav.innerHTML = '';

    PRACTICE_SETS.forEach((set, index) => {
      practiceNav.appendChild(createNavItem(set, index + 1));
    });

    STUDY_SETS.forEach((set, index) => {
      studyNav.appendChild(createNavItem(set, index + 1, true));
    });
  }

  function createNavItem(set, num, isStudy) {
    const questions = getQuestionsForSet(set);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-nav-item' + (isStudy ? ' quiz-nav-item-study' : '');
    btn.dataset.setId = set.id;

    const best = bestScores[set.id];
    const total = questions.length;
    const numMarkup = set.hideNavNum
      ? ''
      : '<span class="quiz-nav-num">' + num + '</span>';
    const subtitleMarkup = set.hideNavNum
      ? ''
      : '<span>' + getSetSubtitle(set, total) + '</span>';
    btn.innerHTML =
      numMarkup +
      '<span class="quiz-nav-info">' +
      '<strong>' + set.title + '</strong>' +
      subtitleMarkup +
      (best !== undefined
        ? '<span class="quiz-nav-best">Best: ' + best + '/' + total + '</span>'
        : '') +
      '</span>';

    btn.addEventListener('click', () => selectQuiz(set.id));
    return btn;
  }

  function updateNavActive() {
    [practiceNav, studyNav].forEach((nav) => {
      nav.querySelectorAll('.quiz-nav-item').forEach((btn) => {
        btn.classList.toggle('active', selectedSet && btn.dataset.setId === selectedSet.id);
      });
    });
  }

  function hideAllScreens() {
    welcomeScreen.classList.add('hidden');
    introScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
  }

  function selectQuiz(setId) {
    selectedSet = ALL_SETS.find((s) => s.id === setId);
    if (!selectedSet) return;

    activeQuestions = getQuestionsForSet(selectedSet);
    score = 0;
    answered = {};
    searchQuery = '';

    updateNavActive();
    showIntro();
  }

  function showIntro() {
    hideAllScreens();
    introScreen.classList.remove('hidden');
    headerStats.classList.add('hidden');
    progressTrack.classList.add('hidden');
    progressFill.style.width = '0%';

    const count = activeQuestions.length;
    const modeLabel = selectedSet.kind === 'study' ? 'Study' : 'Question Bank';
    const subtitle = getSetSubtitle(selectedSet, count);

    headerSubtitle.textContent = selectedSet.title + ' — ' + subtitle;
    $('introBadge').textContent = modeLabel;
    $('introTitle').textContent = 'Start ' + selectedSet.title;

    renderIntroKeywords();

    const introVars = getIntroVars(selectedSet, count);

    if (count === 0) {
      $('introLead').textContent =
        'This section has no questions yet. Add questions to the matching JSON file and run npm run build.';
      renderIntroFeatures([], introVars);
      $('startBtn').textContent = 'Start ' + selectedSet.title;
      $('startBtn').disabled = true;
      return;
    }

    $('startBtn').disabled = false;

    const intro = selectedSet.intro || {};
    let lead = intro.lead;

    if (!lead) {
      if (selectedSet.kind === 'study') {
        lead =
          'This study section contains {count} focused question' +
          (count === 1 ? '' : 's') +
          '. All questions appear at once — scroll through and answer in any order.';
      } else {
        lead =
          'This question bank contains all {count} questions ({rangeStart}–{rangeEnd}). All questions appear at once — scroll through and answer in any order.';
        if (activeQuestions.some((q) => q.image)) {
          lead += ' Some questions include an image you need to read before answering.';
        }
      }
    }

    $('introLead').textContent = formatIntroText(lead, introVars);
    renderIntroFeatures(intro.features, introVars);
    $('startBtn').textContent = 'Start ' + selectedSet.title;
  }

  function beginQuiz() {
    score = 0;
    answered = {};
    searchQuery = '';
    liveScore.textContent = '0';
    answeredNum.textContent = '0';
    totalNum.textContent = activeQuestions.length;
    questionSearch.value = '';
    clearSearchBtn.classList.add('hidden');
    searchResultCount.classList.add('hidden');

    hideAllScreens();
    quizScreen.classList.remove('hidden');
    headerStats.classList.remove('hidden');
    progressTrack.classList.remove('hidden');
    headerSubtitle.textContent = selectedSet.title + ' in progress';
    quizSetLabel.textContent = selectedSet.title;

    renderAllQuestions();
    updateProgress();
  }

  function renderAllQuestions() {
    questionsList.innerHTML = '';

    activeQuestions.forEach((q) => {
      const card = document.createElement('article');
      card.className = 'question-card';
      card.id = 'question-' + q.id;
      card.dataset.questionId = q.id;

      const record = answered[q.id];

      const imageMarkup = q.image
        ? '<figure class="question-image-wrap">' +
          '<button type="button" class="question-image-btn" title="Click to enlarge" aria-label="Enlarge image for question ' +
          q.id +
          '">' +
          '<img class="question-image" src="' +
          escapeHtml(q.image) +
          '" alt="Illustration for question ' +
          q.id +
          '" loading="lazy" decoding="async" />' +
          '</button>' +
          '</figure>'
        : '';

      card.innerHTML =
        '<div class="question-meta">' +
        '<span class="question-label">Question <span>' + q.id + '</span></span>' +
        '</div>' +
        '<h2 class="question-text">' + escapeHtml(q.text) + '</h2>' +
        imageMarkup +
        '<div class="options" role="radiogroup" aria-label="Answer options for question ' + q.id + '"></div>' +
        '<div class="explanation-area hidden">' +
        '<button class="btn btn-explanation-toggle" type="button" aria-expanded="false">' +
        '<span class="explanation-toggle-icon" aria-hidden="true">💡</span> Show explanation' +
        '</button>' +
        '<div class="explanation-box hidden">' +
        '<div class="explanation-header"><strong class="explanation-title">Explanation</strong></div>' +
        '<p class="explanation-text"></p>' +
        '</div>' +
        '</div>';

      const optionsContainer = card.querySelector('.options');

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
          '<span class="option-letter">' + opt.letter + '</span>' +
          '<span class="option-text">' + escapeHtml(opt.text) + '</span>';

        if (!record) {
          btn.addEventListener('click', () => selectAnswer(q, opt.letter, card));
        }

        optionsContainer.appendChild(btn);
      });

      if (record && hasExplanation(q)) {
        setupExplanationControls(card, q, record.correct);
      }

      questionsList.appendChild(card);
    });
  }

  function setupExplanationControls(card, q, isCorrect) {
    const explanationArea = card.querySelector('.explanation-area');
    const explanationToggle = card.querySelector('.btn-explanation-toggle');
    const explanationBox = card.querySelector('.explanation-box');
    const explanationText = card.querySelector('.explanation-text');
    const explanationTitle = card.querySelector('.explanation-title');

    explanationArea.classList.remove('hidden');
    explanationArea.classList.remove('explanation-correct', 'explanation-incorrect');
    explanationArea.classList.add(isCorrect ? 'explanation-correct' : 'explanation-incorrect');
    explanationTitle.textContent = isCorrect ? 'Correct — Explanation' : 'Explanation';
    explanationText.innerHTML = formatExplanation(q.explanation);
    collapseExplanation(card);

    explanationToggle.onclick = () => toggleExplanation(card);
  }

  function collapseExplanation(card) {
    const explanationBox = card.querySelector('.explanation-box');
    const explanationToggle = card.querySelector('.btn-explanation-toggle');
    explanationBox.classList.add('hidden');
    explanationToggle.setAttribute('aria-expanded', 'false');
    explanationToggle.innerHTML =
      '<span class="explanation-toggle-icon" aria-hidden="true">💡</span> Show explanation';
  }

  function toggleExplanation(card) {
    const explanationBox = card.querySelector('.explanation-box');
    const explanationToggle = card.querySelector('.btn-explanation-toggle');
    const isOpen = !explanationBox.classList.contains('hidden');

    if (isOpen) {
      collapseExplanation(card);
    } else {
      explanationBox.classList.remove('hidden');
      explanationToggle.setAttribute('aria-expanded', 'true');
      explanationToggle.innerHTML =
        '<span class="explanation-toggle-icon" aria-hidden="true">💡</span> Hide explanation';
    }
  }

  function selectAnswer(q, letter, card) {
    if (answered[q.id]) return;

    const isCorrect = letter === q.correct;
    answered[q.id] = { selected: letter, correct: isCorrect };

    if (isCorrect) {
      score++;
      liveScore.textContent = score;
    }

    const optionsContainer = card.querySelector('.options');
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
      setupExplanationControls(card, q, isCorrect);
    }
    updateProgress();
  }

  function updateProgress() {
    const answeredCount = Object.keys(answered).length;
    const total = activeQuestions.length;
    answeredNum.textContent = answeredCount;

    const pct = total ? (answeredCount / total) * 100 : 0;
    progressFill.style.width = pct + '%';
    finishBtn.disabled = answeredCount < total;
  }

  function parseQuestionNumber(query) {
    const trimmed = query.trim();
    const match = trimmed.match(/^(?:q|#)?\s*(\d+)$/i);
    return match ? parseInt(match[1], 10) : null;
  }

  function questionMatchesSearch(q, query) {
    if (!query) return true;

    const lower = query.toLowerCase().trim();
    const qNum = parseQuestionNumber(lower);

    if (qNum !== null) {
      return q.id === qNum;
    }

    if (String(q.id).includes(lower)) return true;
    if (q.text.toLowerCase().includes(lower)) return true;

    return q.options.some((opt) => opt.text.toLowerCase().includes(lower));
  }

  function onSearchInput() {
    searchQuery = questionSearch.value;
    clearSearchBtn.classList.toggle('hidden', !searchQuery);
    applySearch();
  }

  function clearSearch() {
    searchQuery = '';
    questionSearch.value = '';
    clearSearchBtn.classList.add('hidden');
    applySearch();
    questionSearch.focus();
  }

  function updateQuestionCardHighlights(card, q, query) {
    const trimmed = (query || '').trim();
    const questionTextEl = card.querySelector('.question-text');
    const questionIdEl = card.querySelector('.question-label span');
    const qNum = parseQuestionNumber(trimmed);

    if (!trimmed) {
      questionTextEl.textContent = q.text;
      if (questionIdEl) questionIdEl.textContent = q.id;
      card.querySelectorAll('.option').forEach(function (btn) {
        const opt = q.options.find(function (o) {
          return o.letter === btn.dataset.letter;
        });
        if (opt) btn.querySelector('.option-text').textContent = opt.text;
      });
      return;
    }

    if (qNum !== null) {
      questionTextEl.textContent = q.text;
      if (questionIdEl) {
        questionIdEl.innerHTML =
          q.id === qNum
            ? '<mark class="search-term-highlight">' + q.id + '</mark>'
            : String(q.id);
      }
      card.querySelectorAll('.option').forEach(function (btn) {
        const opt = q.options.find(function (o) {
          return o.letter === btn.dataset.letter;
        });
        if (opt) btn.querySelector('.option-text').textContent = opt.text;
      });
      return;
    }

    questionTextEl.innerHTML = highlightSearchTerm(q.text, trimmed);
    if (questionIdEl) {
      questionIdEl.innerHTML = highlightSearchTerm(String(q.id), trimmed);
    }
    card.querySelectorAll('.option').forEach(function (btn) {
      const opt = q.options.find(function (o) {
        return o.letter === btn.dataset.letter;
      });
      if (opt) {
        btn.querySelector('.option-text').innerHTML = highlightSearchTerm(opt.text, trimmed);
      }
    });
  }

  function applySearch() {
    const cards = questionsList.querySelectorAll('.question-card');
    let visibleCount = 0;
    let scrollTarget = null;

    const qNum = parseQuestionNumber(searchQuery);

    cards.forEach((card) => {
      const qId = parseInt(card.dataset.questionId, 10);
      const q = activeQuestions.find((item) => item.id === qId);
      const matches = q && questionMatchesSearch(q, searchQuery);

      card.classList.toggle('hidden', !matches);
      card.classList.remove('search-highlight');

      if (q) {
        updateQuestionCardHighlights(card, q, matches ? searchQuery : '');
      }

      if (matches) {
        visibleCount++;
        if (qNum !== null && qId === qNum) {
          scrollTarget = card;
        }
      }
    });

    if (searchQuery.trim()) {
      searchResultCount.classList.remove('hidden');
      searchResultCount.textContent =
        visibleCount === 0
          ? 'No questions match your search'
          : visibleCount + ' question' + (visibleCount === 1 ? '' : 's') + ' found';
    } else {
      searchResultCount.classList.add('hidden');
    }

    if (scrollTarget) {
      scrollTarget.classList.add('search-highlight');
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => scrollTarget.classList.remove('search-highlight'), 2000);
    }
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
      msg.textContent = 'Don\'t give up! Review the material and try this practice again.';
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightSearchTerm(text, query) {
    if (text == null || text === '') return '';
    if (!query || !query.trim()) return escapeHtml(String(text));

    const pattern = escapeRegExp(query.trim());
    const re = new RegExp(pattern, 'gi');
    let result = '';
    let lastIndex = 0;
    let match;

    while ((match = re.exec(String(text))) !== null) {
      result += escapeHtml(String(text).slice(lastIndex, match.index));
      result += '<mark class="search-term-highlight">' + escapeHtml(match[0]) + '</mark>';
      lastIndex = match.index + match[0].length;
      if (match[0].length === 0) {
        re.lastIndex++;
      }
    }

    result += escapeHtml(String(text).slice(lastIndex));
    return result;
  }

  function highlightSearchMultiline(text, query) {
    if (!text) return '';
    return text
      .split('\n')
      .map(function (line) {
        return highlightSearchTerm(line, query);
      })
      .join('<br>');
  }

  function isBoldExplanationLine(line) {
    const trimmed = line.trim();
    if (/^(Answer|Correct answer)\s*:/i.test(trimmed)) return true;
    if (/^(Keyword|Main keyword|Important keyword|Secondary Keyword)\s*:/i.test(trimmed)) {
      return true;
    }
    if (/^[\p{L}\d\- ]+\s*=\s*.+$/u.test(trimmed) && !/^(Logic|Rule|Necessary|Unnecessary)\b/i.test(trimmed)) {
      return true;
    }
    return false;
  }

  function formatExplanation(text) {
    return text
      .split('\n')
      .map(function (line) {
        if (isBoldExplanationLine(line)) {
          return '<strong>' + escapeHtml(line) + '</strong>';
        }
        const escaped = escapeHtml(line);
        return escaped.replace(/&quot;([^&]+)&quot;/g, '<strong>&quot;$1&quot;</strong>');
      })
      .join('\n');
  }

  init();
})();

(function () {
  const allQuestions = window.QUIZ_DATA || [];
  const studyData = window.STUDY_DATA || {};
  const studyKeywords = window.STUDY_KEYWORDS || {};
  const examPrepData = window.EXAM_PREP_DATA || {};
  const examSetsRaw = window.EXAM_SETS_DATA || [];

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

  const EXAM_PREP_SETS = [
    {
      id: 'exam-assisting',
      title: 'Assisting Passengers',
      dataKey: 'assisting_passengers',
      kind: 'exam',
      intro: {
        lead:
          'Practice {count} questions on assisting passengers and ensuring their safety — safe boarding and exit, intoxicated or unwell customers, and general passenger care.',
        features: [
          '{count} multiple-choice questions from the official exam topic area',
          'Covers drop-off safety, emergencies, and passenger wellbeing',
          'All questions on one page — answer in any order',
        ],
      },
    },
    {
      id: 'exam-special-needs',
      title: 'Special Needs',
      dataKey: 'special_needs',
      kind: 'exam',
      intro: {
        lead:
          'Practice {count} questions on the special needs of different passenger groups — children, school transport, disabilities, KELA trips, and accessibility.',
        features: [
          '{count} multiple-choice questions from the official exam topic area',
          'Seat belts, child restraints, wheelchairs, and guide dogs',
          'All questions on one page — answer in any order',
        ],
      },
    },
    {
      id: 'exam-customer-service',
      title: 'Customer Service',
      dataKey: 'customer_service',
      kind: 'exam',
      intro: {
        lead:
          'Practice {count} questions on customer service situations in taxi services — communication, payments, routes, complaints, and professional conduct.',
        features: [
          '{count} multiple-choice questions from the official exam topic area',
          'Phone use, receipts, pricing, and handling difficult situations',
          'All questions on one page — answer in any order',
        ],
      },
    },
    {
      id: 'exam-traffic-safety',
      title: 'Traffic Safety',
      dataKey: 'traffic_safety',
      kind: 'exam',
      intro: {
        lead:
          'Practice {count} questions on factors affecting transport and traffic safety — traffic rules, licensing, working hours, vehicle checks, and defensive driving.',
        features: [
          '{count} multiple-choice questions from the official exam topic area',
          'Signs, speed limits, alcohol rules, and legal requirements',
          'All questions on one page — answer in any order',
        ],
      },
    },
  ];

  const EXAM_SETS = examSetsRaw.map(function (set) {
    return {
      id: 'exam-quiz-' + set.id,
      examId: set.id,
      title: 'Quiz ' + set.id,
      kind: 'exam-quiz',
      passingCriteria: set.passingCriteria,
      intro: {
        lead:
          'Full mock exam with {count} questions (15 + 15 + 10 + 10). Questions appear one at a time — answer each to move on. You need 38/50 overall and minimum scores in every section to pass.',
        features: [
          'Assisting passengers — 15 questions (12 required to pass)',
          'Special needs — 15 questions (12 required to pass)',
          'Customer service — 10 questions (7 required to pass)',
          'Traffic safety — 10 questions (7 required to pass)',
        ],
      },
    };
  });

  const ALL_SETS = PRACTICE_SETS.concat(STUDY_SETS, EXAM_PREP_SETS, EXAM_SETS);

  let selectedSet = null;
  let activeQuestions = [];
  let score = 0;
  let answered = {};
  let toastTimer = null;
  let bestScores = {};
  let searchQuery = '';
  let keywordSearchQuery = '';
  let activeKeywordIndex = null;
  let examQuestionIndex = 0;
  let examAdvanceTimer = null;
  let examTimerInterval = null;
  let examDeadline = null;

  const EXAM_DURATION_MS = 45 * 60 * 1000;

  const $ = (id) => document.getElementById(id);

  const welcomeScreen = $('welcomeScreen');
  const introScreen = $('introScreen');
  const quizScreen = $('quizScreen');
  const examOverlay = $('examOverlay');
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
  const examPrepNav = $('examPrepNav');
  const examNav = $('examNav');
  const questionsList = $('questionsList');
  const examQuestionArea = $('examQuestionArea');
  const examQuizProgress = $('examQuizProgress');
  const examTimer = $('examTimer');
  const examPrevBtn = $('examPrevBtn');
  const examNextBtn = $('examNextBtn');
  const examQuestionMap = $('examQuestionMap');
  const examPassBadge = $('examPassBadge');
  const examSectionBreakdown = $('examSectionBreakdown');
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
    if (set.kind === 'exam') {
      return examPrepData[set.dataKey] || [];
    }
    if (set.kind === 'exam-quiz') {
      const examSet = examSetsRaw.find(function (item) {
        return item.id === set.examId;
      });
      return examSet ? examSet.questions : [];
    }
    return allQuestions.filter((q) => q.id >= set.rangeStart && q.id <= set.rangeEnd);
  }

  function getSetSubtitle(set, count) {
    if (set.kind === 'study' || set.kind === 'exam' || set.kind === 'exam-quiz') {
      return count + ' question' + (count === 1 ? '' : 's');
    }
    return 'Questions ' + set.rangeStart + '–' + set.rangeEnd;
  }

  function getModeLabel(set) {
    if (set.kind === 'study') return 'Study';
    if (set.kind === 'exam-quiz') return 'Exam';
    if (set.kind === 'exam') return 'Exam Preparation';
    return 'Question Bank';
  }

  function getNavItemClass(set) {
    if (set.kind === 'study') return ' quiz-nav-item-study';
    if (set.kind === 'exam-quiz') return ' quiz-nav-item-exam-quiz';
    if (set.kind === 'exam') return ' quiz-nav-item-exam';
    return '';
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

  const SIDEBAR_SECTION_BY_KIND = {
    practice: 'sidebarSectionPractice',
    study: 'sidebarSectionStudy',
    exam: 'sidebarSectionExamPrep',
    'exam-quiz': 'sidebarSectionExam',
  };

  function scrollPageToTop() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  function setSidebarSectionOpen(sectionEl, isOpen) {
    if (!sectionEl) return;
    sectionEl.classList.toggle('is-open', isOpen);
    const toggle = sectionEl.querySelector('.sidebar-section-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
  }

  function openSidebarSectionForSet(set) {
    if (!set) return;
    const sectionId = SIDEBAR_SECTION_BY_KIND[set.kind];
    if (!sectionId) return;
    setSidebarSectionOpen(document.getElementById(sectionId), true);
  }

  function initSidebarSections() {
    document.querySelectorAll('.sidebar-section-toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        const section = toggle.closest('.sidebar-section');
        const willOpen = !section.classList.contains('is-open');
        setSidebarSectionOpen(section, willOpen);
        scrollPageToTop();
      });
    });
  }

  function init() {
    renderQuizNav();
    initSidebarSections();
    $('startBtn').addEventListener('click', beginQuiz);
    $('restartBtn').addEventListener('click', beginQuiz);
    $('backToIntroBtn').addEventListener('click', showIntro);
    finishBtn.addEventListener('click', showResults);
    examPrevBtn.addEventListener('click', function () {
      goToExamQuestion(examQuestionIndex - 1);
    });
    examNextBtn.addEventListener('click', function () {
      const q = activeQuestions[examQuestionIndex];
      const isLast = examQuestionIndex >= activeQuestions.length - 1;

      if (isLast && q && answered[q.id]) {
        showResults();
        return;
      }

      if (!q || !answered[q.id]) return;
      goToExamQuestion(examQuestionIndex + 1);
    });
    questionSearch.addEventListener('input', onSearchInput);
    clearSearchBtn.addEventListener('click', clearSearch);
    keywordSearch.addEventListener('input', onKeywordSearchInput);
    questionsList.addEventListener('click', onQuestionImageClick);
    examQuestionArea.addEventListener('click', onQuestionImageClick);
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
    examPrepNav.innerHTML = '';
    examNav.innerHTML = '';

    PRACTICE_SETS.forEach((set, index) => {
      practiceNav.appendChild(createNavItem(set, index + 1));
    });

    STUDY_SETS.forEach((set, index) => {
      studyNav.appendChild(createNavItem(set, index + 1));
    });

    EXAM_PREP_SETS.forEach((set, index) => {
      examPrepNav.appendChild(createNavItem(set, index + 1));
    });

    EXAM_SETS.forEach((set, index) => {
      examNav.appendChild(createNavItem(set, index + 1));
    });
  }

  function createNavItem(set, num) {
    const questions = getQuestionsForSet(set);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-nav-item' + getNavItemClass(set);
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
    [practiceNav, studyNav, examPrepNav, examNav].forEach((nav) => {
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

  function enterExamMode() {
    document.body.classList.add('exam-mode-active');
    examOverlay.classList.remove('hidden');
  }

  function exitExamMode() {
    stopExamTimer();
    document.body.classList.remove('exam-mode-active');
    examOverlay.classList.add('hidden');
  }

  function startExamTimer() {
    stopExamTimer();
    examDeadline = Date.now() + EXAM_DURATION_MS;
    updateExamTimerDisplay();
    examTimerInterval = setInterval(function () {
      updateExamTimerDisplay();
      if (Date.now() >= examDeadline) {
        stopExamTimer();
        showResults();
      }
    }, 1000);
  }

  function stopExamTimer() {
    if (examTimerInterval) {
      clearInterval(examTimerInterval);
      examTimerInterval = null;
    }
    examDeadline = null;
  }

  function updateExamTimerDisplay() {
    if (!examDeadline) return;
    const remaining = Math.max(0, examDeadline - Date.now());
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    examTimer.textContent =
      String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    examTimer.classList.toggle('is-low', remaining > 0 && remaining <= 5 * 60 * 1000);
    examTimer.classList.toggle('is-expired', remaining === 0);
  }

  function getExamAccessibleMaxIndex() {
    for (let i = 0; i < activeQuestions.length; i++) {
      if (!answered[activeQuestions[i].id]) {
        return i;
      }
    }
    return activeQuestions.length - 1;
  }

  function clearExamAdvanceTimer() {
    if (examAdvanceTimer) {
      clearTimeout(examAdvanceTimer);
      examAdvanceTimer = null;
    }
  }

  function selectQuiz(setId) {
    selectedSet = ALL_SETS.find((s) => s.id === setId);
    if (!selectedSet) return;

    clearExamAdvanceTimer();
    activeQuestions = getQuestionsForSet(selectedSet);
    score = 0;
    answered = {};
    searchQuery = '';

    updateNavActive();
    openSidebarSectionForSet(selectedSet);
    scrollPageToTop();
    showIntro();
  }

  function showIntro() {
    clearExamAdvanceTimer();
    exitExamMode();
    hideAllScreens();
    introScreen.classList.remove('hidden');
    headerStats.classList.add('hidden');
    progressTrack.classList.add('hidden');
    progressFill.style.width = '0%';

    const count = activeQuestions.length;
    const modeLabel = getModeLabel(selectedSet);
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
      if (selectedSet.kind === 'study' || selectedSet.kind === 'exam') {
        lead =
          'This section contains {count} focused question' +
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
    $('startBtn').textContent =
      selectedSet.kind === 'exam-quiz' ? 'Start Exam' : 'Start ' + selectedSet.title;
  }

  function beginQuiz() {
    if (selectedSet && selectedSet.kind === 'exam-quiz') {
      beginExamQuiz();
      return;
    }

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


  function beginExamQuiz() {
    clearExamAdvanceTimer();
    score = 0;
    answered = {};
    examQuestionIndex = 0;

    hideAllScreens();
    enterExamMode();
    startExamTimer();
    renderExamQuestion();
  }

  function goToExamQuestion(index) {
    if (index < 0 || index >= activeQuestions.length) return;
    if (index > getExamAccessibleMaxIndex()) return;
    examQuestionIndex = index;
    renderExamQuestion();
  }

  function updateExamNavButtons() {
    const total = activeQuestions.length;
    const q = activeQuestions[examQuestionIndex];
    const currentAnswered = Boolean(q && answered[q.id]);
    const isLast = examQuestionIndex === total - 1;

    examPrevBtn.disabled = examQuestionIndex === 0;

    if (isLast && currentAnswered) {
      examNextBtn.textContent = 'Esittää ›';
      examNextBtn.disabled = false;
    } else {
      examNextBtn.textContent = 'Seuraava ›';
      examNextBtn.disabled = !currentAnswered;
    }
  }

  function renderExamQuestionNav() {
    const maxAccessible = getExamAccessibleMaxIndex();

    examQuestionMap.innerHTML = '';
    activeQuestions.forEach(function (q, i) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'exam-quiz-nav-box';
      btn.textContent = i + 1;
      btn.setAttribute('aria-label', 'Kysymys ' + (i + 1));

      if (i === examQuestionIndex) {
        btn.classList.add('is-current');
        btn.setAttribute('aria-current', 'step');
      }

      if (i > maxAccessible) {
        btn.disabled = true;
        btn.classList.add('is-future');
      } else {
        btn.addEventListener('click', function () {
          goToExamQuestion(i);
        });
      }

      examQuestionMap.appendChild(btn);
    });

    updateExamNavButtons();

    const current = examQuestionMap.querySelector('.is-current');
    if (current) {
      current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  function renderExamQuestion() {
    const q = activeQuestions[examQuestionIndex];
    if (!q) return;

    const total = activeQuestions.length;
    const currentNum = examQuestionIndex + 1;
    examQuizProgress.textContent = currentNum + ' / ' + total;

    examQuestionArea.innerHTML = '';
    const card = buildQuestionCard(q, function (letter) {
      selectExamAnswer(q, letter, card);
    });
    examQuestionArea.appendChild(card);
    renderExamQuestionNav();
  }

  function buildQuestionCard(q, onSelect) {
    const card = document.createElement('article');
    card.className = 'question-card';
    card.id = 'question-' + q.id;
    card.dataset.questionId = q.id;

    const record = answered[q.id];
    const isExamQuiz = selectedSet && selectedSet.kind === 'exam-quiz';

    const questionLabelMarkup = isExamQuiz
      ? ''
      : '<span class="question-label">Question <span>' + q.id + '</span></span>';

    const metaMarkup = isExamQuiz
      ? ''
      : '<div class="question-meta">' + questionLabelMarkup + '</div>';

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
      metaMarkup +
      '<h2 class="question-text">' + escapeHtml(q.text) + '</h2>' +
      imageMarkup +
      '<div class="options" role="radiogroup" aria-label="Answer options for question ' + q.id + '"></div>' +
      '<div class="explanation-area hidden">' +
      '<button class="btn btn-explanation-toggle" type="button" aria-expanded="false">' +
      '<span class="explanation-toggle-icon" aria-hidden="true"></span> Show explanation' +
      '</button>' +
      '<div class="explanation-box hidden">' +
      '<div class="explanation-header">' +
      '<strong class="explanation-title">Explanation</strong>' +
      '<span class="explanation-answer-badge hidden" aria-label="Correct answer"></span>' +
      '</div>' +
      '<div class="explanation-content"></div>' +
      '</div>' +
      '</div>';

    const optionsContainer = card.querySelector('.options');

    q.options.forEach(function (opt) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option';
      btn.dataset.letter = opt.letter;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');

      if (record) {
        if (!isExamQuiz) {
          btn.classList.add('locked');
        }
        if (record.selected === opt.letter) {
          if (isExamQuiz) {
            btn.classList.add('selected');
            btn.setAttribute('aria-checked', 'true');
          } else {
            btn.classList.add(record.correct ? 'correct' : 'incorrect');
          }
        } else if (!isExamQuiz && opt.letter === q.correct) {
          btn.classList.add('reveal-correct');
        }
      }

      btn.innerHTML =
        '<span class="option-letter">' + opt.letter + '</span>' +
        '<span class="option-text">' + escapeHtml(opt.text) + '</span>';

      if (onSelect && (!record || isExamQuiz)) {
        btn.addEventListener('click', function () {
          onSelect(opt.letter);
        });
      }

      optionsContainer.appendChild(btn);
    });

    if (record && hasExplanation(q) && selectedSet.kind !== 'exam-quiz') {
      setupExplanationControls(card, q, record.correct);
    }

    return card;
  }

  function recalculateExamScore() {
    score = 0;
    activeQuestions.forEach(function (question) {
      const record = answered[question.id];
      if (record && record.correct) {
        score++;
      }
    });
    liveScore.textContent = score;
  }

  function selectExamAnswer(q, letter, card) {
    const previous = answered[q.id];
    if (previous && previous.selected === letter) return;

    answered[q.id] = { selected: letter, correct: letter === q.correct };
    recalculateExamScore();

    const optionsContainer = card.querySelector('.options');
    optionsContainer.querySelectorAll('.option').forEach(function (btn) {
      btn.classList.remove('selected');
      btn.setAttribute('aria-checked', 'false');
      if (btn.dataset.letter === letter) {
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
      }
    });

    renderExamQuestionNav();
  }

  function computeExamResults() {
    const criteria = selectedSet.passingCriteria;
    const sectionScores = {};

    criteria.sections.forEach(function (section) {
      sectionScores[section.key] = {
        title: section.title,
        correct: 0,
        total: section.total,
        required: section.required,
        passed: false,
      };
    });

    activeQuestions.forEach(function (q) {
      const record = answered[q.id];
      if (record && record.correct && q.section && sectionScores[q.section]) {
        sectionScores[q.section].correct++;
      }
    });

    Object.keys(sectionScores).forEach(function (key) {
      const section = sectionScores[key];
      section.passed = section.correct >= section.required;
    });

    const overallCorrect = score;
    const overallPass = overallCorrect >= criteria.overall.required;
    const sectionsPass = criteria.sections.every(function (section) {
      return sectionScores[section.key].passed;
    });

    return {
      sectionScores: sectionScores,
      overallCorrect: overallCorrect,
      overallTotal: criteria.overall.total,
      overallRequired: criteria.overall.required,
      overallPass: overallPass,
      sectionsPass: sectionsPass,
      passed: overallPass && sectionsPass,
    };
  }

  function renderExamSectionBreakdown(examResults) {
    const criteria = selectedSet.passingCriteria;
    let html = '<h3 class="exam-section-breakdown-title">Section results</h3><ul class="exam-section-list">';

    criteria.sections.forEach(function (section) {
      const result = examResults.sectionScores[section.key];
      html +=
        '<li class="exam-section-item' +
        (result.passed ? ' is-pass' : ' is-fail') +
        '">' +
        '<div class="exam-section-item-head">' +
        '<span class="exam-section-item-title">' +
        escapeHtml(section.title) +
        '</span>' +
        '<span class="exam-section-item-score">' +
        result.correct +
        '/' +
        result.total +
        '</span>' +
        '</div>' +
        '<p class="exam-section-item-required">Required: ' +
        section.required +
        '/' +
        section.total +
        ' — ' +
        (result.passed ? 'Passed' : 'Not passed') +
        '</p>' +
        '</li>';
    });

    html += '</ul>';
    examSectionBreakdown.innerHTML = html;
    examSectionBreakdown.classList.remove('hidden');
  }

  function renderAllQuestions() {
    questionsList.innerHTML = '';

    activeQuestions.forEach(function (q) {
      const card = buildQuestionCard(q, function (letter) {
        selectAnswer(q, letter, card);
      });
      questionsList.appendChild(card);
    });
  }

  function setupExplanationControls(card, q, isCorrect) {
    const explanationArea = card.querySelector('.explanation-area');
    const explanationToggle = card.querySelector('.btn-explanation-toggle');
    const explanationBox = card.querySelector('.explanation-box');
    const explanationContent = card.querySelector('.explanation-content');
    const explanationTitle = card.querySelector('.explanation-title');
    const explanationBadge = card.querySelector('.explanation-answer-badge');

    explanationArea.classList.remove('hidden');
    explanationArea.classList.remove('explanation-correct', 'explanation-incorrect');
    explanationArea.classList.add(isCorrect ? 'explanation-correct' : 'explanation-incorrect');
    explanationTitle.textContent = isCorrect ? 'Correct answer' : 'Learn more';
    explanationBadge.textContent = q.correct;
    explanationBadge.classList.remove('hidden');
    explanationBadge.setAttribute('aria-label', 'Correct answer: ' + q.correct);
    explanationContent.innerHTML = formatExplanation(q.explanation, q.correct);
    collapseExplanation(card);

    explanationToggle.onclick = () => toggleExplanation(card);
  }

  function collapseExplanation(card) {
    const explanationBox = card.querySelector('.explanation-box');
    const explanationToggle = card.querySelector('.btn-explanation-toggle');
    explanationBox.classList.add('hidden');
    explanationToggle.setAttribute('aria-expanded', 'false');
    explanationToggle.innerHTML =
      '<span class="explanation-toggle-icon" aria-hidden="true"></span> Show explanation';
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
        '<span class="explanation-toggle-icon" aria-hidden="true"></span> Hide explanation';
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
    clearExamAdvanceTimer();
    const wasExamQuiz = selectedSet && selectedSet.kind === 'exam-quiz';
    if (wasExamQuiz) {
      exitExamMode();
    }
    hideAllScreens();
    resultsScreen.classList.remove('hidden');
    progressFill.style.width = '100%';
    headerStats.classList.add('hidden');
    progressTrack.classList.add('hidden');
    headerSubtitle.textContent = selectedSet.title + ' — completed';

    const total = activeQuestions.length;
    const correct = score;
    const wrong = total - correct;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const isExamQuiz = selectedSet.kind === 'exam-quiz';

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

    examPassBadge.classList.add('hidden');
    examSectionBreakdown.classList.add('hidden');
    examSectionBreakdown.innerHTML = '';

    if (isExamQuiz) {
      const examResults = computeExamResults();
      renderExamSectionBreakdown(examResults);

      examPassBadge.classList.remove('hidden');
      examPassBadge.className = 'exam-pass-badge ' + (examResults.passed ? 'is-pass' : 'is-fail');
      examPassBadge.textContent = examResults.passed ? 'Exam passed' : 'Exam not passed';

      if (examResults.passed) {
        icon.classList.add('excellent');
        icon.textContent = '🏆';
        msg.textContent =
          'Congratulations! You met the overall requirement (' +
          examResults.overallRequired +
          '/' +
          examResults.overallTotal +
          ') and passed every section.';
      } else if (examResults.overallPass && !examResults.sectionsPass) {
        icon.classList.add('fair');
        icon.textContent = '📚';
        msg.textContent =
          'Your overall score was high enough, but one or more sections did not reach the required minimum. Review those topics and try again.';
      } else if (!examResults.overallPass && examResults.sectionsPass) {
        icon.classList.add('fair');
        icon.textContent = '📚';
        msg.textContent =
          'You passed every section, but your overall score was below ' +
          examResults.overallRequired +
          '/' +
          examResults.overallTotal +
          '. Keep practicing and try again.';
      } else {
        icon.classList.add('poor');
        icon.textContent = '💪';
        msg.textContent =
          'You need ' +
          examResults.overallRequired +
          '/' +
          examResults.overallTotal +
          ' overall and the section minimums to pass. Review your weak areas and try again.';
      }
      return;
    }

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

  function isMetaExplanationLine(line) {
    return /^(Answer|Correct answer)\s*:/i.test(line.trim());
  }

  function parseExplanationSections(text) {
    const sections = [];
    let current = null;

    text.split('\n').forEach(function (line) {
      const sectionMatch = line.trim().match(/^---\s*(.+?)\s*---$/);
      if (sectionMatch) {
        if (current) sections.push(current);
        current = { title: sectionMatch[1], lines: [] };
        return;
      }
      if (!current || !line.trim() || isMetaExplanationLine(line)) return;
      current.lines.push(line.trim());
    });

    if (current) sections.push(current);
    return sections;
  }

  function renderTranslationSection(lines, correctLetter) {
    let questionHtml = '';
    const options = [];

    lines.forEach(function (line) {
      const questionMatch = line.match(/^Question:\s*(.+)$/i);
      const optionMatch = line.match(/^([ABC]):\s*(.+)$/i);
      if (questionMatch) {
        questionHtml =
          '<p class="explanation-question">' + escapeHtml(questionMatch[1]) + '</p>';
      } else if (optionMatch) {
        options.push({
          letter: optionMatch[1].toUpperCase(),
          text: optionMatch[2],
        });
      }
    });

    let optionsHtml = '';
    if (options.length) {
      optionsHtml =
        '<ul class="explanation-options">' +
        options
          .map(function (opt) {
            const isCorrect = correctLetter && opt.letter === correctLetter;
            return (
              '<li class="explanation-option' +
              (isCorrect ? ' is-correct' : '') +
              '">' +
              '<span class="explanation-option-letter">' +
              escapeHtml(opt.letter) +
              '</span>' +
              '<span class="explanation-option-text">' +
              escapeHtml(opt.text) +
              '</span>' +
              (isCorrect ? '<span class="explanation-option-tag">Correct</span>' : '') +
              '</li>'
            );
          })
          .join('') +
        '</ul>';
    }

    return questionHtml + optionsHtml;
  }

  function renderKeywordsSection(lines) {
    const items = lines
      .map(function (line) {
        const eqIndex = line.indexOf('=');
        if (eqIndex === -1) return null;
        return {
          term: line.slice(0, eqIndex).trim(),
          definition: line.slice(eqIndex + 1).trim(),
        };
      })
      .filter(Boolean);

    if (!items.length) {
      return '<p class="explanation-plain">' + escapeHtml(lines.join(' ')) + '</p>';
    }

    return (
      '<dl class="explanation-keywords">' +
      items
        .map(function (item) {
          return (
            '<div class="explanation-keyword">' +
            '<dt class="explanation-keyword-term">' +
            escapeHtml(item.term) +
            '</dt>' +
            '<dd class="explanation-keyword-def">' +
            escapeHtml(item.definition) +
            '</dd>' +
            '</div>'
          );
        })
        .join('') +
      '</dl>'
    );
  }

  function renderExplanationSection(lines) {
    const body = lines.join('\n').trim();
    if (!body) return '';
    return '<p class="explanation-summary">' + escapeHtml(body) + '</p>';
  }

  function sectionIconClass(title) {
    const normalized = title.toLowerCase();
    if (normalized.indexOf('translation') !== -1) return 'icon-translation';
    if (normalized.indexOf('keyword') !== -1) return 'icon-keywords';
    if (normalized.indexOf('explanation') !== -1) return 'icon-summary';
    return 'icon-default';
  }

  function renderExplanationSectionBlock(section, correctLetter) {
    const title = section.title;
    const normalized = title.toLowerCase();
    let bodyHtml = '';

    if (normalized.indexOf('translation') !== -1) {
      bodyHtml = renderTranslationSection(section.lines, correctLetter);
    } else if (normalized.indexOf('keyword') !== -1) {
      bodyHtml = renderKeywordsSection(section.lines);
    } else if (normalized.indexOf('explanation') !== -1) {
      bodyHtml = renderExplanationSection(section.lines);
    } else {
      bodyHtml =
        '<p class="explanation-plain">' + escapeHtml(section.lines.join('\n')) + '</p>';
    }

    if (!bodyHtml) return '';

    return (
      '<section class="explanation-section">' +
      '<header class="explanation-section-header">' +
      '<span class="explanation-section-icon ' +
      sectionIconClass(title) +
      '" aria-hidden="true"></span>' +
      '<h4 class="explanation-section-title">' +
      escapeHtml(title) +
      '</h4>' +
      '</header>' +
      '<div class="explanation-section-body">' +
      bodyHtml +
      '</div>' +
      '</section>'
    );
  }

  function formatExplanationStructured(text, correctLetter) {
    const sections = parseExplanationSections(text);
    if (!sections.length) return null;

    return (
      '<div class="explanation-panels">' +
      sections.map(function (section) {
        return renderExplanationSectionBlock(section, correctLetter);
      }).join('') +
      '</div>'
    );
  }

  function isBoldExplanationLine(line) {
    const trimmed = line.trim();
    if (/^(Answer|Correct answer)\s*:/i.test(trimmed)) return true;
    if (/^--- .+ ---$/.test(trimmed)) return true;
    if (/^(Question|[ABC])\s*:/i.test(trimmed)) return true;
    if (/^(Keyword|Main keyword|Important keyword|Secondary Keyword)\s*:/i.test(trimmed)) {
      return true;
    }
    if (/^[\p{L}\d\- ]+\s*=\s*.+$/u.test(trimmed) && !/^(Logic|Rule|Necessary|Unnecessary)\b/i.test(trimmed)) {
      return true;
    }
    return false;
  }

  function formatExplanationPlain(text) {
    return (
      '<div class="explanation-plain-block">' +
      text
        .split('\n')
        .map(function (line) {
          if (isMetaExplanationLine(line)) return '';
          if (isBoldExplanationLine(line)) {
            return '<p class="explanation-plain-line"><strong>' + escapeHtml(line) + '</strong></p>';
          }
          if (!line.trim()) return '';
          const escaped = escapeHtml(line);
          return (
            '<p class="explanation-plain-line">' +
            escaped.replace(/&quot;([^&]+)&quot;/g, '<strong>&quot;$1&quot;</strong>') +
            '</p>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function formatExplanation(text, correctLetter) {
    if (!text) return '';
    const structured = formatExplanationStructured(text, correctLetter);
    if (structured) return structured;
    return formatExplanationPlain(text);
  }

  init();
})();

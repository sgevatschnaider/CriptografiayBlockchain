(() => {
  'use strict';

  const questions = window.Module03Questions || [];
  const byId = (id) => document.getElementById(id);
  let session = null;

  function filteredPool() {
    const category = byId('quiz-category').value;
    const level = byId('quiz-level').value;
    return questions.filter((question) =>
      (category === 'all' || question.category === category) &&
      (level === 'all' || question.level === level)
    );
  }

  function startQuiz() {
    const pool = Module03.shuffle(filteredPool());
    if (!pool.length) {
      Lab.setStatus(byId('quiz-status'), 'No hay preguntas para esa combinación de filtros.', 'bad');
      return;
    }
    const requested = Number(byId('quiz-size').value);
    const selected = pool.slice(0, Math.min(requested, pool.length));
    session = {
      questions: selected,
      answers: selected.map(() => ({ selected: null, checked: false })),
      current: 0,
      mode: byId('quiz-mode').value,
      finished: false
    };
    byId('quiz-summary').hidden = true;
    byId('quiz-navigation').hidden = false;
    Lab.setStatus(byId('quiz-status'), `Intento iniciado con ${selected.length} preguntas en modo ${session.mode === 'study' ? 'estudio' : 'examen'}.`, 'good');
    render();
  }

  function currentQuestion() {
    return session?.questions[session.current] || null;
  }

  function createTag(text) {
    const span = document.createElement('span');
    span.className = 'quiz-tag';
    span.textContent = text;
    return span;
  }

  function render() {
    const question = currentQuestion();
    if (!question) return;
    const answer = session.answers[session.current];
    const showFeedback = session.mode === 'study' && answer.checked;
    const card = byId('quiz-card');
    card.replaceChildren();
    const tags = document.createElement('div');
    tags.className = 'lesson-kicker';
    tags.append(createTag(question.category), createTag(question.level), createTag(`Pregunta ${session.current + 1}`));
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = question.prompt;
    const options = document.createElement('div');
    options.className = 'quiz-options';
    question.options.forEach((option, index) => {
      const label = document.createElement('label');
      label.className = 'quiz-option';
      if (showFeedback && index === question.answer) label.classList.add('correct');
      if (showFeedback && index === answer.selected && index !== question.answer) label.classList.add('incorrect');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'quiz-answer';
      input.value = String(index);
      input.checked = answer.selected === index;
      input.disabled = showFeedback || session.finished;
      input.addEventListener('change', () => {
        answer.selected = index;
        renderNavigation();
      });
      const text = document.createElement('span');
      text.textContent = option;
      label.append(input, text);
      options.append(label);
    });
    fieldset.append(legend, options);
    card.append(tags, fieldset);
    if (showFeedback) {
      const feedback = document.createElement('div');
      feedback.className = 'quiz-feedback';
      const title = document.createElement('strong');
      title.textContent = answer.selected === question.answer ? 'Respuesta correcta.' : 'Respuesta incorrecta.';
      const explanation = document.createElement('p');
      explanation.textContent = question.explanation;
      feedback.append(title, explanation);
      card.append(feedback);
    }
    renderNavigation();
  }

  function renderNavigation() {
    if (!session) return;
    const answered = session.answers.filter((answer) => answer.selected !== null).length;
    byId('question-progress').textContent = `${session.current + 1}/${session.questions.length}`;
    byId('answered-progress').textContent = `${answered} respondida${answered === 1 ? '' : 's'}`;
    byId('previous-question').disabled = session.current === 0 || session.finished;
    byId('next-question').disabled = session.finished;
    byId('next-question').textContent = session.current === session.questions.length - 1 ? 'Finalizar intento' : 'Siguiente →';
    byId('check-question').hidden = session.mode !== 'study' || session.finished;
    const dots = byId('quiz-dots');
    dots.replaceChildren();
    session.questions.forEach((question, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-dot';
      if (session.answers[index].selected !== null) button.classList.add('answered');
      if (index === session.current) button.classList.add('current');
      button.textContent = index + 1;
      button.setAttribute('aria-label', `Ir a la pregunta ${index + 1}`);
      button.addEventListener('click', () => {
        session.current = index;
        render();
      });
      dots.append(button);
    });
  }

  function checkCurrent() {
    if (!session) return;
    const answer = session.answers[session.current];
    if (answer.selected === null) {
      Lab.setStatus(byId('quiz-status'), 'Elegí una opción antes de verificar.', 'warn');
      return;
    }
    answer.checked = true;
    render();
  }

  function move(delta) {
    if (!session || session.finished) return;
    const answer = session.answers[session.current];
    if (delta > 0 && answer.selected === null) {
      Lab.setStatus(byId('quiz-status'), 'Respondé la pregunta antes de avanzar.', 'warn');
      return;
    }
    if (delta > 0 && session.mode === 'study' && !answer.checked) {
      answer.checked = true;
      render();
      Lab.setStatus(byId('quiz-status'), 'Revisá la devolución y volvé a presionar Siguiente.', 'good');
      return;
    }
    const next = session.current + delta;
    if (next >= session.questions.length) {
      finishQuiz();
      return;
    }
    session.current = Math.max(0, next);
    render();
    byId('quiz-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function diagnostic(score) {
    if (score >= 85) return 'Dominio sólido';
    if (score >= 70) return 'Logro esperado';
    if (score >= 50) return 'Revisión focalizada';
    return 'Rehacer recorrido';
  }

  function reviewItem(question, answer, index) {
    const details = document.createElement('details');
    details.className = 'checkpoint';
    const summary = document.createElement('summary');
    const correct = answer.selected === question.answer;
    summary.textContent = `${correct ? '✓' : '✗'} ${index + 1}. ${question.prompt}`;
    const selected = document.createElement('p');
    selected.textContent = `Tu respuesta: ${answer.selected === null ? 'Sin responder' : question.options[answer.selected]}`;
    const expected = document.createElement('p');
    expected.textContent = `Respuesta correcta: ${question.options[question.answer]}`;
    const explanation = document.createElement('p');
    explanation.textContent = question.explanation;
    details.append(summary, selected, expected, explanation);
    return details;
  }

  function finishQuiz() {
    if (!session) return;
    const unanswered = session.answers.filter((answer) => answer.selected === null).length;
    if (unanswered) {
      Lab.setStatus(byId('quiz-status'), `Quedan ${unanswered} pregunta(s) sin responder.`, 'warn');
      return;
    }
    session.finished = true;
    const correct = session.answers.reduce((sum, answer, index) =>
      sum + Number(answer.selected === session.questions[index].answer), 0);
    const score = Math.round(correct / session.questions.length * 100);
    Module03.setBestQuiz(score);
    byId('summary-score').textContent = `${score}%`;
    byId('summary-correct').textContent = `${correct}/${session.questions.length}`;
    byId('summary-level').textContent = diagnostic(score);
    const review = byId('summary-review');
    review.replaceChildren(...session.questions.map((question, index) => reviewItem(question, session.answers[index], index)));
    byId('quiz-summary').hidden = false;
    byId('quiz-navigation').hidden = true;
    Lab.setStatus(byId('quiz-status'), `Intento finalizado: ${score}% (${correct} de ${session.questions.length}).`, score >= 70 ? 'good' : 'warn');
    byId('quiz-summary').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const categories = [...new Set(questions.map((question) => question.category))].sort((a, b) => a.localeCompare(b, 'es'));
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    byId('quiz-category').append(option);
  });

  byId('start-quiz').addEventListener('click', startQuiz);
  byId('restart-quiz').addEventListener('click', startQuiz);
  byId('retry-quiz').addEventListener('click', startQuiz);
  byId('check-question').addEventListener('click', checkCurrent);
  byId('previous-question').addEventListener('click', () => move(-1));
  byId('next-question').addEventListener('click', () => move(1));

  startQuiz();
})();

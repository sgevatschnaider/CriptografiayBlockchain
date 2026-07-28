(() => {
  'use strict';

  const questions = window.Module02Questions || [];
  const $ = (id) => document.getElementById(id);
  let session = null;

  function randomInt(max) {
    if (max <= 1) return 0;
    const limit = Math.floor(0x100000000 / max) * max;
    const value = new Uint32Array(1);
    do crypto.getRandomValues(value); while (value[0] >= limit);
    return value[0] % max;
  }

  function shuffle(values) {
    const result = values.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const other = randomInt(index + 1);
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  function filteredPool() {
    const category = $('quiz-category').value;
    const level = $('quiz-level').value;
    return questions.filter((question) =>
      (category === 'all' || question.category === category) &&
      (level === 'all' || question.level === level)
    );
  }

  function startQuiz() {
    const pool = shuffle(filteredPool());
    if (!pool.length) {
      $('quiz-status').textContent = 'No hay preguntas para esa combinación.';
      $('quiz-status').className = 'status bad';
      return;
    }
    const requested = Number($('quiz-size').value);
    const selected = pool.slice(0, Math.min(requested, pool.length));
    session = {
      questions: selected,
      answers: selected.map(() => ({ selected: null, checked: false })),
      current: 0,
      mode: $('quiz-mode').value,
      finished: false
    };
    $('quiz-summary').hidden = true;
    $('quiz-status').textContent = `Evaluación iniciada con ${selected.length} preguntas en modo ${session.mode === 'study' ? 'estudio' : 'examen'}.`;
    $('quiz-status').className = 'status good';
    render();
  }

  function currentQuestion() {
    return session?.questions[session.current] || null;
  }

  function selectAnswer(index) {
    if (!session || session.finished) return;
    const answer = session.answers[session.current];
    if (answer.checked && session.mode === 'study') return;
    answer.selected = index;
    render();
  }

  function checkCurrent() {
    if (!session) return;
    const answer = session.answers[session.current];
    if (answer.selected === null) {
      $('quiz-status').textContent = 'Elegí una opción antes de verificar.';
      $('quiz-status').className = 'status warn';
      return;
    }
    answer.checked = true;
    render();
  }

  function move(delta) {
    if (!session) return;
    const answer = session.answers[session.current];
    if (session.mode === 'study' && answer.selected !== null && !answer.checked) answer.checked = true;
    if (session.mode === 'exam' && answer.selected !== null) answer.checked = true;
    const next = session.current + delta;
    if (next >= session.questions.length) {
      finishQuiz();
      return;
    }
    session.current = Module02.clamp(next, 0, session.questions.length - 1);
    render();
    $('quiz-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function correctCount(checkedOnly = true) {
    if (!session) return 0;
    return session.answers.reduce((sum, answer, index) => {
      const eligible = !checkedOnly || answer.checked;
      return sum + (eligible && answer.selected === session.questions[index].answer ? 1 : 0);
    }, 0);
  }

  function finishQuiz() {
    if (!session || session.finished) return;
    const unanswered = session.answers.findIndex((answer) => answer.selected === null);
    if (unanswered >= 0) {
      session.current = unanswered;
      $('quiz-status').textContent = 'Todavía hay preguntas sin responder.';
      $('quiz-status').className = 'status warn';
      render();
      return;
    }
    session.answers.forEach((answer) => { answer.checked = true; });
    session.finished = true;
    const correct = correctCount(false);
    const score = Math.round(correct / session.questions.length * 100);
    const progress = Module02.setBestQuiz(score);
    $('best-score').textContent = `${progress.bestQuiz}%`;
    $('summary-score').textContent = `${score}%`;
    $('summary-correct').textContent = `${correct}/${session.questions.length}`;
    $('summary-best').textContent = `${progress.bestQuiz}%`;
    $('summary-verdict').textContent = score >= 85 ? 'Dominio sólido' : score >= 70 ? 'Objetivo alcanzado' : 'Requiere repaso';
    $('summary-title').textContent = score >= 70 ? 'Objetivo formativo alcanzado' : 'Repasá y volvé a intentar';
    $('summary-review').innerHTML = session.questions.map((question, index) => {
      const answer = session.answers[index];
      const correctAnswer = answer.selected === question.answer;
      return `<details class="checkpoint"><summary>${correctAnswer ? '✓' : '✗'} ${index + 1}. ${Module02.safeText(question.prompt)}</summary><p><strong>Tu respuesta:</strong> ${Module02.safeText(question.options[answer.selected])}</p><p><strong>Respuesta correcta:</strong> ${Module02.safeText(question.options[question.answer])}</p><p>${Module02.safeText(question.explanation)}</p></details>`;
    }).join('');
    $('quiz-summary').hidden = false;
    $('quiz-status').textContent = `Intento finalizado: ${score}% (${correct} de ${session.questions.length}).`;
    $('quiz-status').className = score >= 70 ? 'status good' : 'status warn';
    render();
    $('quiz-summary').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function render() {
    if (!session) return;
    const question = currentQuestion();
    const answer = session.answers[session.current];
    const showFeedback = answer.checked && session.mode === 'study';
    $('quiz-card').innerHTML = `
      <div class="tag-row"><span>${Module02.safeText(question.category)}</span><span>${Module02.safeText(question.level)}</span><span>Pregunta ${session.current + 1}</span></div>
      <fieldset>
        <legend>${Module02.safeText(question.prompt)}</legend>
        <div class="option-list">
          ${question.options.map((option, index) => {
            let resultClass = '';
            if (showFeedback && index === question.answer) resultClass = 'correct';
            if (showFeedback && index === answer.selected && index !== question.answer) resultClass = 'incorrect';
            return `<label class="quiz-option ${resultClass}"><input type="radio" name="quiz-answer" value="${index}" ${answer.selected === index ? 'checked' : ''} ${showFeedback ? 'disabled' : ''}><span>${Module02.safeText(option)}</span></label>`;
          }).join('')}
        </div>
      </fieldset>
      ${session.mode === 'study' && !answer.checked ? '<div class="actions"><button class="button" id="check-answer" type="button">Verificar respuesta</button></div>' : ''}
      ${showFeedback ? `<div class="quiz-feedback"><strong>${answer.selected === question.answer ? 'Respuesta correcta.' : 'Respuesta incorrecta.'}</strong><p>${Module02.safeText(question.explanation)}</p></div>` : ''}
      ${session.mode === 'exam' ? '<p class="small muted">Modo examen: la explicación aparecerá al finalizar.</p>' : ''}
    `;
    document.querySelectorAll('input[name="quiz-answer"]').forEach((input) => {
      input.addEventListener('change', () => selectAnswer(Number(input.value)));
    });
    document.getElementById('check-answer')?.addEventListener('click', checkCurrent);

    $('question-progress').textContent = `${session.current + 1}/${session.questions.length}`;
    const checked = session.answers.filter((item) => item.checked).length;
    const liveScore = checked ? Math.round(correctCount(true) / checked * 100) : 0;
    $('live-score').textContent = session.mode === 'exam' && !session.finished ? 'Oculto' : `${liveScore}%`;
    $('previous-question').disabled = session.current === 0 || session.finished;
    $('next-question').disabled = session.finished;
    $('next-question').textContent = session.current === session.questions.length - 1 ? 'Finalizar' : 'Siguiente →';
    $('quiz-dots').innerHTML = session.questions.map((item, index) => {
      const itemAnswer = session.answers[index];
      let state = index === session.current ? 'current' : '';
      if ((session.mode === 'study' || session.finished) && itemAnswer.checked) {
        state = itemAnswer.selected === item.answer ? 'correct' : 'incorrect';
      }
      return `<button class="quiz-dot ${state}" type="button" data-question-index="${index}" aria-label="Ir a pregunta ${index + 1}">${index + 1}</button>`;
    }).join('');
    document.querySelectorAll('[data-question-index]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!session.finished) {
          session.current = Number(button.dataset.questionIndex);
          render();
        }
      });
    });
  }

  const categories = [...new Set(questions.map((question) => question.category))];
  $('quiz-category').insertAdjacentHTML('beforeend', categories.map((category) => `<option value="${Module02.safeText(category)}">${Module02.safeText(category)}</option>`).join(''));
  $('best-score').textContent = `${Module02.readProgress().bestQuiz}%`;
  $('start-quiz').addEventListener('click', startQuiz);
  $('reset-quiz').addEventListener('click', startQuiz);
  $('previous-question').addEventListener('click', () => move(-1));
  $('next-question').addEventListener('click', () => move(1));
  $('try-again').addEventListener('click', startQuiz);
  startQuiz();
})();

(() => {
  'use strict';

  const reset = document.getElementById('reset-module-progress');

  document.querySelectorAll('[data-module-station]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      Module03.setCompleted(checkbox.dataset.moduleStation, checkbox.checked);
      Module03.announce(checkbox.checked ? 'Estación marcada como completada.' : 'Estación marcada como pendiente.');
    });
  });

  reset.addEventListener('click', () => {
    const confirmed = window.confirm('¿Querés borrar las marcas de progreso y el mejor puntaje del Módulo 3 en este navegador?');
    if (!confirmed) return;
    Module03.writeProgress({ visited: [], completed: [], bestQuiz: 0 });
    Module03.announce('Progreso del Módulo 3 reiniciado.', 'warn');
  });

  Module03.updateProgressUi();
})();

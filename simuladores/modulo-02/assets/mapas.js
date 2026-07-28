(() => {
  'use strict';

  const DETAILS = Object.freeze({
    security: ['Seguridad criptográfica', 'Una propiedad definida mediante un objetivo, capacidades del adversario, un experimento y una medida de éxito.'],
    information: ['Teoría de la información', 'Estudia distribuciones y dependencia. Pregunta cuánto cambia el conocimiento sobre M al observar C.'],
    complexity: ['Complejidad computacional', 'Modela tiempo, memoria, consultas y probabilidad. Convierte “imposible” en “inviable para una familia de adversarios”.'],
    algebra: ['Teoría de números y álgebra', 'Proporciona operaciones eficientes y problemas estructurados: grupos, cuerpos, curvas y retículos.'],
    entropy: ['Entropía e información mutua', 'H mide incertidumbre media; H(M|C) mide la que queda; I(M;C) mide lo revelado por el criptograma.'],
    perfect: ['Secreto perfecto', 'La distribución posterior del mensaje coincide con la previa para cada criptograma observable. No limita el poder de cómputo.'],
    design: ['Confusión y difusión', 'La no linealidad complica relaciones y la mezcla propaga influencia. Son principios de diseño, no pruebas completas.'],
    ppt: ['Adversario PPT', 'Algoritmo probabilístico que opera en tiempo polinomial en el parámetro de seguridad. Es una idealización de “eficiente”.'],
    reductions: ['Reducción de seguridad', 'Transforma un adversario que rompe el esquema en un algoritmo que resuelve un problema supuesto difícil. La garantía es condicional.'],
    classes: ['P, NP y BQP', 'Clases de problemas bajo modelos clásico determinista, verificación eficiente y cómputo cuántico con error acotado.'],
    groups: ['Grupos y cuerpos finitos', 'Diffie–Hellman usa grupos cíclicos; AES usa el cuerpo GF(2⁸) para su S-box y mezcla lineal.'],
    curves: ['Curvas elípticas', 'Los puntos forman un grupo. Calcular kP es eficiente; recuperar k a partir de P y kP es el ECDLP.'],
    lattices: ['Retículos y LWE', 'El ruido oculta un secreto en ecuaciones modulares. Module-LWE sostiene construcciones poscuánticas estandarizadas.'],
    goal: ['Objetivo de seguridad', 'No existe “seguro” sin completar la frase: seguro contra qué adversario, con qué acceso y para impedir qué información o acción.'],
    unconditional: ['Seguridad incondicional', 'La garantía no depende de límites computacionales. El secreto perfecto es el ejemplo canónico.'],
    computational: ['Seguridad computacional', 'Admite que la información existe en principio, pero exige que extraerla tenga costo o ventaja despreciable para adversarios eficientes.'],
    otp: ['One-time pad', 'Con clave uniforme, independiente, tan larga como el mensaje y de un solo uso, satisface I(M;C)=0.'],
    'key-cost': ['Costo de la clave', 'La seguridad perfecta desplaza el problema hacia generar, distribuir y destruir material secreto del tamaño de cada mensaje.'],
    'ind-cpa': ['IND-CPA', 'El adversario puede obtener cifrados de textos elegidos y aun así no debería distinguir cuál de dos mensajes fue cifrado en el desafío.'],
    'ind-cca': ['IND-CCA', 'Amplía capacidades con consultas de descifrado sujetas a restricciones. Es una meta más fuerte y cercana a ataques activos.'],
    engineering: ['Ingeniería segura', 'Una definición formal debe materializarse con AEAD, nonces correctos, gestión de claves, errores uniformes y resistencia de implementación.'],
    primitives: ['Primitivas y supuestos', 'Una primitiva combina una estructura, un problema o propiedad, parámetros y una construcción analizada.'],
    aes: ['AES y GF(2⁸)', 'AES es un cifrador por bloques con red de sustitución–permutación. Su estructura interna opera sobre bytes del cuerpo GF(2⁸).'],
    'classical-public': ['Clave pública clásica', 'RSA depende de factorización; DH y ECC dependen de variantes del logaritmo discreto. Shor afecta a ambas familias.'],
    pqc: ['Criptografía poscuántica', 'Cambia la familia de supuestos hacia problemas sin algoritmos cuánticos eficientes conocidos, como Module-LWE.'],
    grover: ['Grover', 'Acelera idealmente la búsqueda no estructurada de N a aproximadamente √N consultas. No elimina la exponencialidad.'],
    'shor-rsa': ['Shor y RSA', 'La factorización puede resolverse en tiempo polinomial en un computador cuántico suficientemente capaz, rompiendo el supuesto central de RSA.'],
    'shor-ecc': ['Shor y ECC', 'El logaritmo discreto también entra en el alcance de Shor; agrandar moderadamente una curva no resuelve el cambio de clase.'],
    'nist-pqc': ['ML-KEM y ML-DSA', 'FIPS 203 y FIPS 204 estandarizan un KEM y firmas basados en retículos modulares para la transición poscuántica.'],
    agility: ['Criptoagilidad', 'Capacidad organizacional y técnica de inventariar, reemplazar y migrar primitivas, formatos, claves y protocolos sin rediseñar todo el sistema.']
  });

  document.querySelectorAll('[data-map]').forEach((board) => {
    const detail = document.getElementById(`${board.dataset.map}-detail`);
    const nodes = [...board.querySelectorAll('[data-map-node]')];
    function activate(node) {
      const data = DETAILS[node.dataset.mapNode];
      if (!data || !detail) return;
      detail.innerHTML = `<h3>${Module02.safeText(data[0])}</h3><p>${Module02.safeText(data[1])}</p>`;
      nodes.forEach((item) => item.setAttribute('aria-pressed', String(item === node)));
    }
    nodes.forEach((node) => {
      node.setAttribute('aria-pressed', 'false');
      node.addEventListener('click', () => activate(node));
      node.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        activate(node);
      });
    });
  });
})();

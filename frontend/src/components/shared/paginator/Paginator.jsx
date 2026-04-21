import "./Paginator.css";

/* ==========================================================================
   PAGINATOR — componente reutilizable de paginacion
   -------------------------------------------------
   Pensado para usarse con el hook usePagination o con cualquier logica propia.
   No sabe nada del backend: solo recibe el estado actual y dispara callbacks.

   PROPS:
     page          → numero de pagina actual (1-indexed)
     limit         → items por pagina
     hasMore       → true si hay pagina siguiente
     onPageChange  → (nuevaPagina: number) => void
     onLimitChange → (nuevoLimit: number) => void          [opcional]
     limitOptions  → array de numeros a mostrar en el selector [opcional]
     maxVisible    → cuantos numeros de pagina mostrar a la vez [opcional, default 5]
     mostrarInfo   → muestra "Pagina N" a la izquierda [opcional, default true]

   NOTA sobre el diseno numerado:
   Como el backend NO devuelve el total, no podemos mostrar "3 de 17".
   Mostramos una ventana deslizante de numeros alrededor de la pagina actual
   (max 5 por defecto), con flechas Anterior/Siguiente. Si hasMore es false,
   "Siguiente" se deshabilita. Es el patron estandar para APIs tipo cursor.

   Si en el futuro el backend devuelve totalPages, este componente se adapta
   sin tocar la API publica: basta con Añadir un prop opcional `totalPages`
   que, si viene, sustituye a la heuristica de hasMore.
   ========================================================================== */

/* Genera la lista de numeros de pagina a mostrar, centrada en la actual.
   Ejemplo con page=5, maxVisible=5, hasMore=true:
     → [3, 4, 5, 6, 7]
   Con page=1, maxVisible=5, hasMore=true:
     → [1, 2, 3, 4, 5]
   Con page=3, maxVisible=5, hasMore=false (se sabe que 3 es la ultima):
     → [1, 2, 3] */
function calcularVentanaPaginas(page, maxVisible, hasMore) {
  var ventana = [];
  var half = Math.floor(maxVisible / 2);

  /* Inicio deseado: tantas paginas antes como permita "half", pero nunca
     por debajo de 1. */
  var inicio = Math.max(1, page - half);
  var fin = inicio + maxVisible - 1;

  /* Si no hay pagina siguiente, la ventana termina en la pagina actual.
     Reajustamos el inicio para tratar de mantener maxVisible numeros. */
  if (!hasMore) {
    fin = page;
    inicio = Math.max(1, fin - maxVisible + 1);
  }

  for (var i = inicio; i <= fin; i++) {
    ventana.push(i);
  }
  return ventana;
}

export default function Paginator(props) {
  var page = props.page || 1;
  var limit = props.limit || 15;
  var hasMore = Boolean(props.hasMore);
  var maxVisible = props.maxVisible || 5;
  var mostrarInfo = props.mostrarInfo !== false;
  var limitOptions = props.limitOptions || [15, 30, 50];
  var onPageChange = props.onPageChange || function () {};
  var onLimitChange = props.onLimitChange;

  var paginas = calcularVentanaPaginas(page, maxVisible, hasMore);
  var puedeAnterior = page > 1;
  var puedeSiguiente = hasMore;

  function handleAnterior() {
    if (puedeAnterior) onPageChange(page - 1);
  }

  function handleSiguiente() {
    if (puedeSiguiente) onPageChange(page + 1);
  }

  function handleNumero(num) {
    if (num !== page) onPageChange(num);
  }

  function handleLimitChange(e) {
    if (onLimitChange) onLimitChange(Number(e.target.value));
  }

  /* Si solo hay una pagina y no hay selector de limit, no pintamos nada */
  if (!onLimitChange && !puedeAnterior && !puedeSiguiente) {
    return null;
  }

  return (
    <nav className="paginator" aria-label="Paginacion">
      {mostrarInfo && (
        <div className="paginator-info">
          <span className="paginator-info-page">Pagina {page}</span>
        </div>
      )}

      <div className="paginator-controls">
        <button
          type="button"
          className="paginator-btn paginator-btn-nav"
          onClick={handleAnterior}
          disabled={!puedeAnterior}
          aria-label="Pagina anterior"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Anterior</span>
        </button>

        <ul className="paginator-pages" role="list">
          {/* Si la ventana no empieza en 1, mostramos un "1 ..." al principio
              para que el usuario pueda volver rapidamente al inicio. */}
          {paginas[0] > 1 && (
            <>
              <li>
                <button
                  type="button"
                  className="paginator-btn paginator-btn-num"
                  onClick={() => handleNumero(1)}
                  aria-label="Ir a la pagina 1"
                >
                  1
                </button>
              </li>
              {paginas[0] > 2 && (
                <li className="paginator-ellipsis" aria-hidden="true">
                  ...
                </li>
              )}
            </>
          )}

          {paginas.map(function (num) {
            var activa = num === page;
            return (
              <li key={num}>
                <button
                  type="button"
                  className={
                    activa
                      ? "paginator-btn paginator-btn-num active"
                      : "paginator-btn paginator-btn-num"
                  }
                  onClick={() => handleNumero(num)}
                  aria-current={activa ? "page" : undefined}
                  aria-label={"Ir a la pagina " + num}
                >
                  {num}
                </button>
              </li>
            );
          })}

          {/* Si hay pagina siguiente y la ventana no llega hasta el final
              conocido, mostramos un "..." decorativo al final. */}
          {hasMore && (
            <li className="paginator-ellipsis" aria-hidden="true">
              ...
            </li>
          )}
        </ul>

        <button
          type="button"
          className="paginator-btn paginator-btn-nav"
          onClick={handleSiguiente}
          disabled={!puedeSiguiente}
          aria-label="Pagina siguiente"
        >
          <span>Siguiente</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {onLimitChange && (
        <div className="paginator-limit">
          <label htmlFor="paginator-limit-select">Mostrar</label>
          <select
            id="paginator-limit-select"
            value={limit}
            onChange={handleLimitChange}
            className="paginator-limit-select"
          >
            {limitOptions.map(function (opt) {
              return (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              );
            })}
          </select>
          <span>por pagina</span>
        </div>
      )}
    </nav>
  );
}

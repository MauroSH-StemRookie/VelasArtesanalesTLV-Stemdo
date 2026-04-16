import { useState, useEffect, useCallback, useRef } from "react";

/* ==========================================================================
   usePagination — hook de paginacion server-side
   ---------------------------------------------
   Encapsula toda la logica de paginacion con el backend:
     - Guarda page, limit y sort en estado.
     - Llama al fetcher cuando cambia cualquiera de esos tres.
     - Resetea a page=1 cuando cambian las dependencias externas
       (por ejemplo, cuando el usuario selecciona otra categoria).
     - Detecta "hay mas paginas" comparando items.length con el limit.

   COMO USARLO:

     const {
       items,       // array de items de la pagina actual
       page,        // numero de pagina actual (1-indexed)
       limit,       // items por pagina
       sort,        // criterio de ordenacion
       loading,
       error,
       hasMore,     // true si la pagina actual viene "llena" (puede haber siguiente)
       setPage,
       setLimit,
       setSort,
     } = usePagination({
       fetcher: ({ page, limit, sort }) => productosAPI.getAll({ page, limit, sort }),
       initialLimit: 15,
       initialSort: "nuevos",
       deps: [selectedCategory, selectedAroma],  // al cambiar, vuelve a page=1
     });

   IMPORTANTE sobre hasMore:
   El backend actualmente no devuelve el total de items, asi que la unica
   forma fiable de saber si hay pagina siguiente es mirar si la actual vino
   llena. Si en el futuro se cambia el backend para devolver { data, total }
   bastaria con sustituir la heuristica por un calculo exacto en este hook.
   ========================================================================== */
export default function usePagination(config) {
  var fetcher = config.fetcher;
  var initialLimit = config.initialLimit || 15;
  var initialSort = config.initialSort || "nuevos";
  var initialPage = config.initialPage || 1;
  var deps = config.deps || [];

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [sort, setSort] = useState(initialSort);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* Evita setear estado despues del unmount del componente. Cuando un usuario
     cambia de pagina rapido, la respuesta de la peticion anterior puede
     llegar despues que la de la nueva: queremos ignorarla. */
  const fetchIdRef = useRef(0);

  /* Wrapper estable del fetcher para evitar que se dispare el efecto de
     carga por el mero hecho de que el padre haya creado una flecha nueva. */
  const fetcherRef = useRef(fetcher);
  useEffect(
    function () {
      fetcherRef.current = fetcher;
    },
    [fetcher],
  );

  const cargar = useCallback(async function (pageArg, limitArg, sortArg) {
    setLoading(true);
    setError("");
    var myFetchId = ++fetchIdRef.current;

    try {
      var data = await fetcherRef.current({
        page: pageArg,
        limit: limitArg,
        sort: sortArg,
      });
      /* Si ya se ha disparado otra peticion despues, ignoramos esta */
      if (myFetchId !== fetchIdRef.current) return;

      /* El backend devuelve array plano. Si el dia de manana pasa a devolver
           { data, total }, aqui es donde se haria la adaptacion. */
      var lista = Array.isArray(data) ? data : (data && data.data) || [];
      setItems(lista);
    } catch (err) {
      if (myFetchId !== fetchIdRef.current) return;
      /* 404 del backend cuando no hay productos: lo tratamos como "lista vacia"
           en vez de como error, para que no se rompa la UI del catalogo. */
      var esVacio =
        err.message &&
        err.message.toLowerCase().indexOf("no se encontraron") !== -1;
      if (esVacio) {
        setItems([]);
      } else {
        setError(err.message || "Error al cargar los datos");
        setItems([]);
      }
    } finally {
      if (myFetchId === fetchIdRef.current) setLoading(false);
    }
  }, []);

  /* Carga inicial y recarga cuando cambia page, limit o sort */
  useEffect(
    function () {
      cargar(page, limit, sort);
    },
    [page, limit, sort, cargar],
  );

  /* Reset automatico a page=1 cuando cambian las dependencias externas
     (por ejemplo, seleccionar una categoria distinta). No recargamos
     explicitamente porque setPage(1) ya dispara el efecto anterior.
     Si la pagina ya estaba en 1, forzamos la recarga a mano. */
  const depsKey = JSON.stringify(deps);
  const prevDepsRef = useRef(depsKey);
  useEffect(
    function () {
      if (prevDepsRef.current === depsKey) return;
      prevDepsRef.current = depsKey;
      if (page !== 1) {
        setPage(1);
      } else {
        cargar(1, limit, sort);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [depsKey],
  );

  /* hasMore: si la pagina vino con exactamente `limit` items, asumimos que
     hay siguiente. Si vino con menos (incluido 0), es la ultima. */
  const hasMore = items.length === limit;

  /* Cambiar el numero de items por pagina resetea siempre a la primera.
     Si estas en la pagina 3 viendo 15 por pagina y pasas a 50 por pagina,
     lo intuitivo es volver al principio, no "adivinar" donde estabas. */
  const cambiarLimit = useCallback(function (nuevoLimit) {
    setLimit(Number(nuevoLimit));
    setPage(1);
  }, []);

  /* Lo mismo con el sort: al cambiar el criterio, volvemos al principio */
  const cambiarSort = useCallback(function (nuevoSort) {
    setSort(nuevoSort);
    setPage(1);
  }, []);

  return {
    items: items,
    page: page,
    limit: limit,
    sort: sort,
    loading: loading,
    error: error,
    hasMore: hasMore,
    setPage: setPage,
    setLimit: cambiarLimit,
    setSort: cambiarSort,
    /* recarga: util despues de un POST/PUT/DELETE que afecte al listado */
    recargar: function () {
      cargar(page, limit, sort);
    },
  };
}

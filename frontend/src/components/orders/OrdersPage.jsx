import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconBack } from "../icons/Icons";
import { pedidosAPI } from "../../services/api";

/* ==========================================================================
   MIS PEDIDOS — historial real del usuario logueado
   -------------------------------------------------
   Conectado al backend: GET /api/pedidos/me devuelve los pedidos del
   usuario autenticado ordenados del mas reciente al mas antiguo. La
   proteccion de ruta (solo usuarios logueados) vive en App.jsx con
   <RequireAuth>, asi que aqui asumimos que el usuario existe.

   Formato de cada pedido que llega del backend:
     { id, total, direccion, nombre, correo, telefono,
       estado, fecha_creacion, id_usuario }

   El backend devuelve `direccion` como objeto compuesto {calle, numero, cp,
   ciudad, provincia, piso}. Para el resumen de la card solo mostramos un
   extracto legible; si el usuario quiere el detalle completo con las
   lineas del carrito, se pedira GET /api/pedidos/:id (fuera del alcance
   actual del componente).
   ========================================================================== */

/* Etiquetas legibles por estado. Mantenemos el mismo orden que el state
   machine del backend para ayudar a leer de un vistazo. */
const ETIQUETAS_ESTADO = {
  pendiente: "Pendiente",
  en_elaboracion: "En elaboracion",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

function formatearFecha(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function formatearDireccion(dir) {
  if (!dir || typeof dir !== "object") return "";
  const trozos = [];
  if (dir.calle) {
    const calleYNumero = [dir.calle, dir.numero]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (calleYNumero) trozos.push(calleYNumero);
  }
  if (dir.cp) trozos.push(String(dir.cp));
  if (dir.ciudad) trozos.push(dir.ciudad);
  return trozos.join(", ");
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    let cancelado = false;
    async function cargarPedidos() {
      setLoading(true);
      setError("");
      try {
        const data = await pedidosAPI.getMine();
        if (cancelado) return;
        setPedidos(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelado) return;
        setError(err.message || "No se han podido cargar los pedidos");
      } finally {
        if (!cancelado) setLoading(false);
      }
    }
    cargarPedidos();
    return function () {
      cancelado = true;
    };
  }, []);

  return (
    <div className="orders-page">
      <div className="admin-header">
        <button className="admin-back" onClick={() => navigate("/")}>
          <IconBack /> Volver a la tienda
        </button>
        <h2>Mis Pedidos</h2>
      </div>
      <div className="orders-content">
        {loading && <p className="orders-empty">Cargando pedidos...</p>}

        {!loading && error && <p className="orders-empty">{error}</p>}

        {!loading && !error && pedidos.length === 0 && (
          <p className="orders-empty">Aun no has realizado ningun pedido.</p>
        )}

        {!loading && !error && pedidos.length > 0 && (
          <div className="orders-list">
            {pedidos.map(function (p) {
              const estadoCls =
                "status-" + String(p.estado || "pendiente").replace("_", "-");
              return (
                <div className="order-card" key={p.id}>
                  <div className="order-card-header">
                    <span className="order-id">Pedido #{p.id}</span>
                    <span className={"status-badge " + estadoCls}>
                      {ETIQUETAS_ESTADO[p.estado] || p.estado || "Pendiente"}
                    </span>
                  </div>
                  <div className="order-card-body">
                    <p>
                      <strong>Fecha:</strong> {formatearFecha(p.fecha_creacion)}
                    </p>
                    {formatearDireccion(p.direccion) && (
                      <p>
                        <strong>Direccion:</strong>{" "}
                        {formatearDireccion(p.direccion)}
                      </p>
                    )}
                    <p>
                      <strong>Total:</strong> {Number(p.total).toFixed(2)} €
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

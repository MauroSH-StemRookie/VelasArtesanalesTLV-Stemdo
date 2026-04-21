import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconBack, IconTrash } from "../icons/Icons";
import { pedidosAPI } from "../../services/api";
import "../../App.css";

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
  console.log("🟢 OrdersPage montado");
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState(null); // qué pedido está pidiendo confirmación
  const [deletingId, setDeletingId] = useState(null); // qué pedido está siendo eliminado

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

  async function handleEliminar(id) {
    setDeletingId(id);
    try {
      await pedidosAPI.delete(id);
      setPedidos(function (prev) {
        return prev.filter(function (p) {
          return p.id !== id;
        });
      });
    } catch (err) {
      setError("No se pudo eliminar el pedido: " + err.message);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

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
              console.log("id del pedido:", p.id, "| confirmId:", confirmId);
              const estadoCls =
                "status-" + String(p.estado || "pendiente").replace("_", "-");
              const esperandoConfirm = confirmId === p.id;
              const eliminando = deletingId === p.id;

              console.log("pedidos:", pedidos);
              console.log("loading:", loading);
              console.log("error:", error);

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

                  {/* ── Zona de eliminar ── */}
                  <div className="order-card-footer">
                    {esperandoConfirm ? (
                      <div className="order-delete-confirm">
                        <span>¿Seguro que quieres eliminarlo?</span>
                        <button
                          className="order-btn order-btn--danger"
                          onClick={function () {
                            handleEliminar(p.id);
                          }}
                          disabled={eliminando}
                        >
                          {eliminando ? "Eliminando..." : "Sí, eliminar"}
                        </button>
                        <button
                          className="order-btn order-btn--secondary"
                          onClick={function () {
                            setConfirmId(null);
                          }}
                          disabled={eliminando}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        className="order-btn order-btn--ghost"
                        onClick={function () {
                          setConfirmId(p.id);
                        }}
                      >
                        <IconTrash /> Eliminar pedido
                      </button>
                    )}
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconBack } from "../icons/Icons";
import { pedidosAPI } from "../../services/api";
import "../../App.css";

const ETIQUETAS_ESTADO = {
  pendiente: "Pendiente",
  en_elaboracion: "En elaboracion",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const PASOS_PROGRESO = ["pendiente", "en_elaboracion", "enviado", "entregado"];

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
function formatearFechaHora(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatearDireccion(dir) {
  if (!dir || typeof dir !== "object") return "";
  const partes = [];
  if (dir.calle || dir.numero) {
    partes.push([dir.calle, dir.numero].filter(Boolean).join(" ").trim());
  }
  if (dir.piso) partes.push(dir.piso);
  if (dir.cp) partes.push(String(dir.cp));
  if (dir.ciudad) partes.push(dir.ciudad);
  if (dir.provincia && dir.provincia !== dir.ciudad) partes.push(dir.provincia);
  return partes.join(", ");
}

function extraerLineas(detalle) {
  if (!detalle) return null;
  return (
    detalle.productos ||
    detalle.lineas ||
    detalle.detalle ||
    detalle.items ||
    null
  );
}

function ProgresoEstado({ estado }) {
  const posActual = PASOS_PROGRESO.indexOf(estado);
  return (
    <div className="order-progress" role="list" aria-label="Estado del pedido">
      {PASOS_PROGRESO.map(function (paso, idx) {
        const activo = idx <= posActual;
        const actual = idx === posActual;
        return (
          <div
            key={paso}
            className={
              "order-progress-step" +
              (activo ? " order-progress-step--activo" : "") +
              (actual ? " order-progress-step--actual" : "")
            }
            role="listitem"
          >
            <div className="order-progress-dot">
              {activo && (
                <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                  <circle cx="4" cy="4" r="3" fill="currentColor" />
                </svg>
              )}
            </div>
            {idx < PASOS_PROGRESO.length - 1 && (
              <div
                className={
                  "order-progress-line" +
                  (activo && idx < posActual
                    ? " order-progress-line--activa"
                    : "")
                }
              />
            )}
            <span className="order-progress-label">
              {ETIQUETAS_ESTADO[paso]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="orders-list" aria-busy="true">
      {[1, 2, 3].map(function (i) {
        return (
          <div className="order-card" key={i} aria-hidden="true">
            <div className="order-card-header">
              <span
                className="skeleton skeleton-pill"
                style={{ width: "7rem" }}
              />
              <span
                className="skeleton skeleton-pill"
                style={{ width: "5rem" }}
              />
            </div>
            <div className="order-card-body">
              <div
                className="skeleton skeleton-text"
                style={{ width: "55%" }}
              />
              <div
                className="skeleton skeleton-text"
                style={{ width: "80%" }}
              />
              <div
                className="skeleton skeleton-text"
                style={{ width: "40%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TablaLineas({ lineas, total }) {
  if (!Array.isArray(lineas) || lineas.length === 0) {
    return (
      <p className="order-detail-empty">
        No hay articulos registrados para este pedido.
      </p>
    );
  }
  return (
    <table className="order-detail-table">
      <thead>
        <tr>
          <th className="order-detail-th">Producto</th>
          <th className="order-detail-th order-detail-center">Cant.</th>
          <th className="order-detail-th order-detail-right">P. unit.</th>
          <th className="order-detail-th order-detail-right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {lineas.map(function (linea, idx) {
          const nombre =
            linea.nombre || linea.producto_nombre || linea.name || "-";
          const cantidad = Number(linea.cantidad || linea.quantity || 0);
          const precio = Number(
            linea.precio || linea.price || linea.precio_unitario || 0,
          );
          const subtotal =
            linea.subtotal != null ? Number(linea.subtotal) : cantidad * precio;
          return (
            <tr key={linea.id || idx} className="order-detail-row">
              <td className="order-detail-td">{nombre}</td>
              <td className="order-detail-td order-detail-center">
                {cantidad}
              </td>
              <td className="order-detail-td order-detail-right">
                {precio.toFixed(2)} &euro;
              </td>
              <td className="order-detail-td order-detail-right">
                {subtotal.toFixed(2)} &euro;
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan="3" className="order-detail-td order-detail-total-label">
            Total del pedido
          </td>
          <td className="order-detail-td order-detail-right order-detail-total-valor">
            {Number(total).toFixed(2)} &euro;
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

export default function OrdersPage() {
  //console.log("OrdersPage montado");
  const isAnonymous = !localStorage.getItem("token"); // para usuarios anónimos
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandidoId, setExpandidoId] = useState(null);
  const [detalles, setDetalles] = useState({});
  const [cargandoDetalle, setCargandoDetalle] = useState(null);

  useEffect(function () {
    let cancelado = false;

    async function cargarPedidos(silencioso = false) {
      if (!silencioso) setLoading(true);
      setError("");
      try {
        const data = await pedidosAPI.getMine();
        if (cancelado) return;
        setPedidos(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelado) return;
        setError(err.message || "No se han podido cargar los pedidos");
      } finally {
        if (!cancelado && !silencioso) setLoading(false);
      }
    }

    cargarPedidos(false);
    const intervalo = setInterval(function () {
      cargarPedidos(true);
    }, 30000);

    return function () {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, []);

  async function toggleDetalle(id) {
    if (expandidoId === id) {
      setExpandidoId(null);
      return;
    }
    setExpandidoId(id);
    if (detalles[id]) return;
    setCargandoDetalle(id);
    try {
      const data = await pedidosAPI.getById(id);
      setDetalles(function (prev) {
        return { ...prev, [id]: { data } };
      });
    } catch (err) {
      setDetalles(function (prev) {
        return {
          ...prev,
          [id]: { error: err.message || "No se pudo cargar el detalle." },
        };
      });
    } finally {
      setCargandoDetalle(null);
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
        {loading && <SkeletonCards />}

        {!loading && error && (
          <div className="orders-empty">
            <p>{error}</p>
            <button
              className="order-btn order-btn--ghost"
              onClick={function () {
                window.location.reload();
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && pedidos.length === 0 && (
          <p className="orders-empty">Aun no has realizado ningun pedido.</p>
        )}
        {!loading && !error && pedidos.length > 0 && (
          <div className="orders-list">
            {pedidos.map(function (p) {
              const estadoCls =
                "status-" + String(p.estado || "pendiente").replace(/_/g, "-");
              const metodoPago = p.metodopago || p.metodo_pago;

              return (
                <div className="order-card" key={p.id}>
                  <div className="order-card-header">
                    <span className="order-id">
                      Pedido del {formatearFecha(p.fecha_creacion)}
                    </span>
                    <span className={"status-badge " + estadoCls}>
                      {ETIQUETAS_ESTADO[p.estado] || p.estado || "Pendiente"}
                    </span>
                  </div>

                  <div className="order-card-body">
                    <dl className="order-info-grid">
                      <div className="order-info-row">
                        <dt className="order-info-label">Fecha</dt>
                        <dd className="order-info-value">
                          {formatearFechaHora(p.fecha_creacion) || "-"}
                        </dd>
                      </div>

                      {metodoPago && (
                        <div className="order-info-row">
                          <dt className="order-info-label">Metodo de pago</dt>
                          <dd className="order-info-value">
                            {metodoPago === "paypal"
                              ? "PayPal"
                              : metodoPago === "tarjeta" ||
                                  metodoPago === "redsys"
                                ? "Tarjeta bancaria"
                                : metodoPago}
                          </dd>
                        </div>
                      )}

                      {formatearDireccion(p.direccion) && (
                        <div className="order-info-row">
                          <dt className="order-info-label">
                            Direccion de envio
                          </dt>
                          <dd className="order-info-value">
                            {formatearDireccion(p.direccion)}
                          </dd>
                        </div>
                      )}

                      <div className="order-info-row">
                        <dt className="order-info-label">Total</dt>
                        <dd className="order-info-value order-info-total">
                          {Number(p.total).toFixed(2)} &euro;
                        </dd>
                      </div>
                    </dl>

                    {p.estado !== "cancelado" ? (
                      <ProgresoEstado estado={p.estado} />
                    ) : (
                      <p className="order-cancelado-aviso">
                        Este pedido ha sido cancelado.
                      </p>
                    )}
                  </div>

                  <div className="order-card-footer">
                    <button
                      className="order-btn order-btn--ghost"
                      onClick={function () {
                        toggleDetalle(p.id);
                      }}
                      disabled={cargandoDetalle === p.id}
                      aria-expanded={expandidoId === p.id}
                    >
                      {cargandoDetalle === p.id
                        ? "Cargando detalle..."
                        : expandidoId === p.id
                          ? "Ocultar articulos"
                          : "Ver articulos del pedido"}
                    </button>
                  </div>

                  {expandidoId === p.id && (
                    <div
                      className="order-detail"
                      role="region"
                      aria-label={"Detalle del pedido #" + p.id}
                    >
                      {cargandoDetalle === p.id && (
                        <div className="order-detail-skeleton">
                          <div className="skeleton skeleton-text" />
                          <div
                            className="skeleton skeleton-text"
                            style={{ width: "70%" }}
                          />
                          <div
                            className="skeleton skeleton-text"
                            style={{ width: "85%" }}
                          />
                        </div>
                      )}

                      {!cargandoDetalle && detalles[p.id]?.error && (
                        <p className="order-detail-error">
                          {detalles[p.id].error}
                        </p>
                      )}

                      {!cargandoDetalle && detalles[p.id]?.data && (
                        <>
                          <TablaLineas
                            lineas={extraerLineas(detalles[p.id].data)}
                            total={detalles[p.id].data.total ?? p.total}
                          />
                          {detalles[p.id].data.id_transaccion && (
                            <p className="order-detail-referencia">
                              <strong>Referencia de pago:</strong>{" "}
                              {detalles[p.id].data.id_transaccion}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

//Imports
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const resend = new Resend(process.env.RESEND_API_KEY);

// Leer el logo y convertirlo a base64 una sola vez al arrancar
const logoPath = path.join(__dirname, '../assets/logo.png');
const logoBase64 = fs.readFileSync(logoPath).toString('base64');
const logoSrc = `data:image/png;base64,${logoBase64}`;


//Correo estatico del administrador
const CORREO_ADMIN = process.env.CORREO_ADMIN;

//Correo desde el que se envian los emails (dominio verificado en Resend)
const CORREO_REMITENTE = process.env.CORREO_REMITENTE;


// ── 1. EMAIL RECUPERACIÓN DE CONTRASEÑA ─────────────────────────────────────
const enviarEmailRecuperacion = async (correoDestino, nombre, codigo) => {
    const result = await resend.emails.send({
        from: CORREO_REMITENTE,
        to: correoDestino,
        subject: 'Recuperacion de contraseña - Velas Artesanales',
        html: `
        <!doctype html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Restablecer contraseña</title>
        </head>

        <body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: Arial, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
            style="background-color: #f6f6f6; padding: 20px 0">
            <tr>
                <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0"
                    style="background: #ffffff; border-radius: 10px; overflow: hidden">

                    <!-- LOGO -->
                    <tr>
                        <td style="text-align: center; padding: 25px 20px 10px 20px; background: #ffffff;">
                            <img src="${logoSrc}" alt="Artesanas de Velas"
                             style="max-width: 160px; height: auto; display: block; margin: 0 auto;" />
                        </td>
                    </tr>

                    <!-- Cabecera -->
                    <tr>
                    <td style="background: #d4a76a; padding: 20px; text-align: center; color: #ffffff;">
                        <h1 style="margin: 0">🔐 Restablecimiento de contraseña</h1>
                    </td>
                    </tr>

                    <!-- Contenido -->
                    <tr>
                    <td style="padding: 30px; color: #333333">
                        <h2 style="margin-top: 0">Hola, ${nombre} </h2>

                        <p>
                        Hemos recibido una solicitud para restablecer la contraseña de
                        tu cuenta en <strong>Artesanas de Velas</strong>.
                        </p>

                        <p>Usa el siguiente código para continuar:</p>

                        <!-- Código -->
                        <div style="margin: 25px 0; text-align: center">
                        <span style="
                            display: inline-block;
                            font-size: 28px;
                            letter-spacing: 6px;
                            font-weight: bold;
                            background: #f3e9df;
                            padding: 12px 20px;
                            border-radius: 8px;
                            color: #2b2b2b;
                        ">
                            ${codigo}
                        </span>
                        </div>

                        <p style="font-size: 14px; color: #666;">
                        Este código es válido durante <strong>15 minutos</strong>.
                        Si no has solicitado este cambio, puedes ignorar este correo.
                        </p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />

                        <p style="font-size: 12px; color: #999;">
                        Si necesitas ayuda, contacta con nosotros desde la página de contacto.
                        </p>
                    </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                    <td style="background: #f3e9df; text-align: center; padding: 15px; font-size: 12px; color: #777;">
                        © 2026 Artesanas de Velas · Talavera de la Reina
                    </td>
                    </tr>

                </table>
                </td>
            </tr>
            </table>
        </body>
        </html>
        `
    });

    console.log('Resend result:', result);
};



// ── 2. EMAIL CONFIRMACIÓN DE PEDIDO AL CLIENTE ───────────────────────────────
const enviarEmailPedidoCliente  = async (correoDestino, nombre, pedido) => {

    const filasProductos = pedido.productos.map(p => `
        <tr>
            <td style="padding: 10px;">${p.nombre}</td>
            <td style="padding: 10px;" align="center">${p.cantidad}</td>
            <td style="padding: 10px;" align="right">${p.precio} €</td>
        </tr>
    `).join('');

    const dir = pedido.direccion;
    const direccionFormateada = dir ? `${dir.calle}, ${dir.numero}${dir.piso ? ` — ${dir.piso}` : ''}, ${dir.cp} ${dir.ciudad}, ${dir.provincia}` : 'No proporcionada';

    await resend.emails.send({
        from: CORREO_REMITENTE,
        to: correoDestino,
        subject: `Confirmación de pedido #${pedido.id} — Velas Artesanales`,
        html: `
        <!doctype html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Confirmación de pedido</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px">
            <tr>
                <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background: #ffffff; border-radius: 10px; overflow: hidden">

                    <!-- LOGO -->
                    <tr>
                        <td style="text-align: center; padding: 25px 20px 10px 20px; background: #ffffff;">
                            <img src="${logoSrc}" alt="Artesanas de Velas"
                             style="max-width: 160px; height: auto; display: block; margin: 0 auto;" />
                        </td>
                    </tr>

                    <!-- HEADER -->
                    <tr>
                    <td style="background: #d4a76a; padding: 20px; text-align: center; color: #ffffff;">
                        <h1 style="margin: 0">🕯️ Tu pedido está confirmado</h1>
                        <p style="margin: 5px 0 0">Gracias por confiar en nosotros</p>
                    </td>
                    </tr>

                    <!-- CONTENIDO -->
                    <tr>
                    <td style="padding: 30px; color: #333">
                        <h2>Hola ${nombre},</h2>
                        <p>Hemos recibido tu pedido correctamente y ya estamos trabajando en él.</p>

                        <h3>Detalles del pedido #${pedido.id}</h3>
                        <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse">
                        <tr style="background: #f3e9df">
                            <th align="left">Producto</th>
                            <th align="center">Cantidad</th>
                            <th align="right">Precio</th>
                        </tr>
                        ${filasProductos}
                        </table>

                        <table width="100%" style="margin-top: 20px">
                        <tr>
                            <td align="right">
                            <strong>Total: ${pedido.total} €</strong>
                            </td>
                        </tr>
                        </table>

                        <h3 style="margin-top: 30px">Información de envío</h3>
                        <p>
                        <strong>Nombre:</strong> ${pedido.nombre}<br />
                        <strong>Email:</strong> ${pedido.correo}<br />
                        <strong>Dirección:</strong> ${direccionFormateada}
                        </p>

                        <p>Te avisaremos cuando tu pedido haya sido enviado.</p>
                        <p>Si tienes cualquier duda, puedes contactarnos por WhatsApp.</p>

                        <p style="margin-top: 30px">
                        Gracias por tu compra 💛<br />
                        <strong>Artesanas de Velas</strong>
                        </p>
                    </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                    <td style="background: #f3e9df; text-align: center; padding: 20px; font-size: 12px; color: #777;">
                        © 2026 Artesanas de Velas<br />Talavera de la Reina
                    </td>
                    </tr>

                </table>
                </td>
            </tr>
            </table>
        </body>
        </html>`
    });
};



// ── 3. EMAIL AVISO DE PEDIDO AL ADMINISTRADOR ────────────────────────────────
const enviarEmailPedidoAdmin  = async (pedido) => {

    const filasProductos = pedido.productos.map(p => `
        <tr>
            <td style="padding: 10px;">${p.nombre}</td>
            <td style="padding: 10px;" align="center">${p.cantidad}</td>
            <td style="padding: 10px;" align="right">${p.precio} €</td>
        </tr>
    `).join('');

     const dir = pedido.direccion;
    const direccionFormateada = dir ? `${dir.calle}, ${dir.numero}${dir.piso ? ` — ${dir.piso}` : ''}, ${dir.cp} ${dir.ciudad}, ${dir.provincia}` : 'No proporcionada';

    await resend.emails.send({
        from: CORREO_REMITENTE,
        to: CORREO_ADMIN,
        subject: `Nuevo pedido #${pedido.id} — ${pedido.nombre}`,
        html: `
        <!doctype html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Nuevo pedido recibido</title>
        </head>
        <body style="margin: 0; padding: 0; background: #f6f6f6; font-family: Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background: #f6f6f6; padding: 20px 0">
            <tr>
                <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background: #ffffff; border-radius: 10px; overflow: hidden">

                    <!-- LOGO -->
                    <tr>
                        <td style="text-align: center; padding: 25px 20px 10px 20px; background: #ffffff;">
                            <img src="${logoSrc}" alt="Artesanas de Velas"
                             style="max-width: 160px; height: auto; display: block; margin: 0 auto;" />
                        </td>
                    </tr>

                    <!-- HEADER -->
                    <tr>
                    <td style="background: #d4a76a; color: #ffffff; text-align: center; padding: 20px;">
                        <h1 style="margin: 0; font-size: 20px">Nuevo pedido recibido</h1>
                        <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.8;">
                        Artesanas de Velas · Panel de administración
                        </p>
                    </td>
                    </tr>

                    <!-- CONTENIDO -->
                    <tr>
                    <td style="padding: 25px; color: #333">
                        <h2 style="margin-top: 0">Datos del cliente</h2>
                        <p><strong>Nombre:</strong> ${pedido.nombre}</p>
                        <p><strong>Email:</strong> ${pedido.correo}</p>
                        <p><strong>Teléfono:</strong> ${pedido.telefono || 'No proporcionado'}</p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

                        <h2>Pedido #${pedido.id}</h2>
                        <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse">
                        <tr style="background: #f3e9df">
                            <th align="left">Producto</th>
                            <th align="center">Cantidad</th>
                            <th align="right">Precio</th>
                        </tr>
                        ${filasProductos}
                        </table>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

                        <h2 style="text-align: right">Total: ${pedido.total} €</h2>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

                        <h2>Dirección de envío</h2>
                        <p>${direccionFormateada}</p>

                        <p style="font-size: 12px; color: #999;">
                        Pedido realizado el ${new Date(pedido.fecha_creacion).toLocaleString('es-ES')}
                        </p>
                    </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                    <td style="background: #f3e9df; color: #777; text-align: center; padding: 15px; font-size: 12px;">
                        Sistema de pedidos · Artesanas de Velas
                    </td>
                    </tr>

                </table>
                </td>
            </tr>
            </table>
        </body>
        </html>
        `
    });
};



// ── 4. EMAIL AVISO DE PEDIDO PERSONALIZADO AL ADMINISTRADOR ─────────────────
const enviarEmailPedidoPersonalizadoAdmin  = async (pedidoP) => {
    await resend.emails.send({
        from: CORREO_REMITENTE,
        to: CORREO_ADMIN,
        subject: `Nueva solicitud personalizada — ${pedidoP.nombre}`,
        html: `
        <!doctype html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Nueva solicitud personalizada</title>
        </head>
        <body style="margin: 0; padding: 0; background: #f6f6f6; font-family: Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background: #f6f6f6; padding: 20px 0">
            <tr>
                <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background: #ffffff; border-radius: 10px; overflow: hidden">

                    <!-- LOGO -->
                    <tr>
                        <td style="text-align: center; padding: 25px 20px 10px 20px; background: #ffffff;">
                            <img src="${logoSrc}" alt="Artesanas de Velas"
                             style="max-width: 160px; height: auto; display: block; margin: 0 auto;" />
                        </td>
                    </tr>

                    <!-- HEADER -->
                    <tr>
                    <td style="background: #d4a76a; color: #ffffff; text-align: center; padding: 20px;">
                        <h1 style="margin: 0; font-size: 20px">Nueva solicitud personalizada</h1>
                        <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.8;">
                        Artesanas de Velas · Panel de administración
                        </p>
                    </td>
                    </tr>

                    <!-- CONTENIDO -->
                    <tr>
                    <td style="padding: 25px; color: #333">
                        <h2 style="margin-top: 0">Datos del cliente</h2>
                        <p><strong>Nombre:</strong> ${pedidoP.nombre}</p>
                        <p><strong>Email:</strong> ${pedidoP.correo}</p>
                        <p><strong>Teléfono:</strong> ${pedidoP.telefono || 'No proporcionado'}</p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

                        <h2>Detalles de la solicitud</h2>
                        <p><strong>Producto de referencia:</strong> ${pedidoP.producto_referencia || 'Sin referencia'}</p>
                        <p><strong>Cantidad:</strong> ${pedidoP.cantidad || 'No especificada'}</p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

                        <h2>Descripción</h2>
                        <p style="
                        background: #f3e9df;
                        padding: 16px;
                        border-radius: 8px;
                        line-height: 1.6;
                        ">${pedidoP.descripcion}</p>

                        <p style="font-size: 12px; color: #999;">
                        Solicitud recibida el ${new Date(pedidoP.fecha_creacion).toLocaleString('es-ES')}
                        </p>
                    </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                    <td style="background: #f3e9df; color: #777; text-align: center; padding: 15px; font-size: 12px;">
                        Sistema de pedidos · Artesanas de Velas
                    </td>
                    </tr>

                </table>
                </td>
            </tr>
            </table>
        </body>
        </html>
        `
    });
};

module.exports = {
    enviarEmailRecuperacion,
    enviarEmailPedidoCliente,
    enviarEmailPedidoAdmin,
    enviarEmailPedidoPersonalizadoAdmin
};
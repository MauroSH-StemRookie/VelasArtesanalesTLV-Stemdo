//Imports
const crypto = require ('crypto');



// URLs oficiales de Redsys según entorno
const URLS = {
    test:       'https://sis-t.redsys.es:25443/sis/realizarPago',
    production: 'https://sis.redsys.es/sis/realizarPago'
}

// Clave derivada por operación: cifrado 3DES de la clave del comercio con el nº de pedido
// Generar clave derivada por pedido. Redsys exige que cada pedido se firme con una clave única.
// Se obtiene cifrando 8 bytes en cero con 3DES, usando la clave del comercio y el nº de pedido como IV.
const encryptKey = (orderId, merchantKey) => {
    const keyBuffer = Buffer.from(merchantKey, 'base64');

    // El nº de pedido se usa como IV del cifrado 3DES:
    // debe tener exactamente 8 bytes → se rellena con \0 si es corto, se recorta si es largo
    const orderBuffer = Buffer.from(orderId.toString().padEnd(8, '\0').substring(0, 8));
    
    // Cifrado 3DES en modo CBC: clave = MERCHANT_KEY, IV = nº de pedido
    const cipher = crypto.createCipheriv('des-ede3-cbc', keyBuffer, orderBuffer);
    cipher.setAutoPadding(false);

    return Buffer.concat([cipher.update(Buffer.alloc(8)), cipher.final()]);
};

// HMAC-SHA256 de Ds_MerchantParameters con la clave derivada
const generateSignature = (params, encryptedKey) => {
    return crypto
        .createHmac('sha256', encryptedKey)
        .update(params)
        .digest('base64');
};


// ─────────────────────────────────────────────
// Crear parámetros firmados para enviar al TPV
// Firmar los parámetros con HMAC-SHA256. Recibe los parámetros en Base64 y la clave derivada del pedido. Devuelve la firma en Base64.
// ─────────────────────────────────────────────
const crearPago = ({ orderId, amount, urlOk, urlKo, urlNotificacion, merchantName}) => {

    //VARIABLES 
    const MERCHANT_CODE =   process.env.REDSYS_MERCHANT_CODE;   // Nº de comercio (FUC)
    const MERCHANT_KEY =    process.env.REDSYS_MERCHANT_KEY;    // Clave secreta para firmar (en Base64)
    const TERMINAL =        process.env.REDSYS_TERMINAL;        // Nº de terminal
    const ENVIRONMENT =     process.env.REDSYS_ENVIRONMENT;     // 'test' o 'production' --- "procces" → "process"

    //Redsys espera el importe en centimos, sin decimales
    const amountCents = Math.round(parseFloat(amount) *100).toString();
    //El numero de pedido debe tener entre 4 y 12 caracteres
    const orderIdFormateado = orderId.toString().padStart(4, '0').substring(0, 12);

     const paramsObj = {
        DS_MERCHANT_AMOUNT:          amountCents,
        DS_MERCHANT_ORDER:           orderIdFormateado,
        DS_MERCHANT_MERCHANTCODE:    MERCHANT_CODE,
        DS_MERCHANT_TERMINAL:        TERMINAL,
        DS_MERCHANT_CURRENCY:        '978',
        DS_MERCHANT_TRANSACTIONTYPE: '0',
        DS_MERCHANT_URLOK:           urlOk,
        DS_MERCHANT_URLKO:           urlKo,
        DS_MERCHANT_MERCHANTURL:     urlNotificacion, 
        DS_MERCHANT_MERCHANTNAME:    merchantName || 'Artesanas de Velas'
    };

    // Redsys exige recibir el JSON codificado en Base64
    const paramsBase64 = Buffer.from(JSON.stringify(paramsObj)).toString('base64');
    
    // Generar clave derivada específica para este pedido
    const encryptedKey = encryptKey(orderIdFormateado, MERCHANT_KEY);
    const signature    = generateSignature(paramsBase64, encryptedKey);

    return {
        url:                    URLS[ENVIRONMENT],
        Ds_SignatureVersion:    'HMAC_SHA256_V1',
        Ds_MerchantParameters:  paramsBase64,
        Ds_Signature:           signature
    };
};



// ─────────────────────────────────────────────
// Verificar firma de la notificación entrante
// Cuando Redsys llama al webhook, hay que verificar que la firma es válida antes de actualizar nada en la BD.
// ─────────────────────────────────────────────

const verificarNotificacion = ({ Ds_MerchantParameters, Ds_Signature }) => {
    const MERCHANT_KEY = process.env.REDSYS_MERCHANT_KEY;
console.log('🔑 MERCHANT_KEY en verificar:', JSON.stringify(MERCHANT_KEY));
    // Redsys manda los parámetros también en Base64 — los decodificamos para poder leer
    const paramsDecoded = JSON.parse(Buffer.from(Ds_MerchantParameters, 'base64').toString('utf8'));

    //Redsys devuelve el orderId como Ds_Order en la notificacion
    const orderId       = paramsDecoded.Ds_Order || paramsDecoded.DS_ORDER;

    if (!orderId) {
        console.error('No se encontró Ds_Order en la notificación:', paramsDecoded);
        return { firmaValida: false, params: paramsDecoded, pagoAprobado: false };
    }

    const encryptedKey  = encryptKey(orderId, MERCHANT_KEY);

    //Normalizar la firma recibida (URL-safe base64 -> base64 estandar)
    const signatureNormalizada = Ds_Signature.replace(/-/g, '+').replace(/_/g, '/');
    const excpedtedSignature    = generateSignature(Ds_MerchantParameters, encryptedKey);

    // timingSafeEqual en vez de === para evitar ataques de timing:
    // con === un atacante puede medir cuánto tarda la comparación y deducir la clave
    const firmaValida = crypto.timingSafeEqual(
        Buffer.from(excpedtedSignature),
        Buffer.from(signatureNormalizada)
    );

    return {
        firmaValida,
        params:         paramsDecoded,
        // Codigo 0000-0099 -> pago correcto
        pagoAprobado:   firmaValida && parseInt(paramsDecoded.Ds_Response) <= 99
    };
};

module.exports = {crearPago, verificarNotificacion};